// Booking price quotes. The server RPC `quote_booking` is the single source of
// truth for what a lesson costs, so web, iOS and Android show the same number:
//   lesson_price = hourly_rate * minutes / 60 + flat mode add-on (no rounding)
// The mode add-on is per LESSON, never per hour, and is never prorated.

import { formatPrice } from "@/lib/format";
import type { AvailabilitySlot, LessonMode } from "@/lib/types";

export interface BookingQuote {
  currency: string;
  duration_minutes: number;
  mode: string;
  hourly_rate: number;
  base_amount: number;
  mode_addon: number;
  lesson_price: number;
  credits_applied: number;
  amount_to_pay: number;
  pricing_version: number;
}

export interface QuoteArgs {
  teacherId: string;
  durationMinutes: number;
  mode: LessonMode;
}

/** Minimal shape of the Supabase client this module needs (easy to mock). */
export interface RpcClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

/**
 * Validates the jsonb returned by quote_booking. Returns null when a required
 * money field is missing or not a number, so the UI shows an error instead of
 * a wrong price.
 */
export function parseQuote(raw: unknown): BookingQuote | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const lessonPrice = num(r.lesson_price);
  const hourly = num(r.hourly_rate);
  const duration = num(r.duration_minutes);
  if (lessonPrice == null || hourly == null || duration == null) return null;
  const base = num(r.base_amount) ?? hourly * (duration / 60);
  const addon = num(r.mode_addon) ?? 0;
  const credits = num(r.credits_applied) ?? 0;
  return {
    currency: typeof r.currency === "string" ? r.currency : "ILS",
    duration_minutes: duration,
    mode: typeof r.mode === "string" ? r.mode : "",
    hourly_rate: hourly,
    base_amount: base,
    mode_addon: addon,
    lesson_price: lessonPrice,
    credits_applied: credits,
    amount_to_pay: num(r.amount_to_pay) ?? Math.max(lessonPrice - credits, 0),
    pricing_version: num(r.pricing_version) ?? 1,
  };
}

/** Cache key for one distinct (mode, duration) pair. */
export function quoteKey(mode: LessonMode, durationMinutes: number): string {
  return `${mode}:${durationMinutes}`;
}

export async function fetchQuote(client: RpcClient, args: QuoteArgs): Promise<BookingQuote> {
  const { data, error } = await client.rpc("quote_booking", {
    p_teacher_id: args.teacherId,
    p_duration_minutes: args.durationMinutes,
    p_mode: args.mode,
  });
  if (error) throw new Error(error.message);
  const quote = parseQuote(data);
  if (!quote) throw new Error("Invalid quote response");
  return quote;
}

export function slotDurationMinutes(slot: Pick<AvailabilitySlot, "start_at" | "end_at">): number {
  return Math.round(
    (new Date(slot.end_at).getTime() - new Date(slot.start_at).getTime()) / 60_000,
  );
}

/** The distinct quote keys a selection needs (one RPC call each). */
export function neededQuoteKeys(
  slots: Pick<AvailabilitySlot, "start_at" | "end_at">[],
  mode: LessonMode | null,
): { key: string; durationMinutes: number }[] {
  if (!mode) return [];
  const seen = new Map<string, number>();
  for (const s of slots) {
    const d = slotDurationMinutes(s);
    seen.set(quoteKey(mode, d), d);
  }
  return [...seen.entries()].map(([key, durationMinutes]) => ({ key, durationMinutes }));
}

export type QuoteEntry = { status: "ok"; quote: BookingQuote } | { status: "error" };

export type SlotPrice =
  | { status: "ok"; price: number }
  | { status: "loading" }
  | { status: "error" };

export interface WizardPricing {
  slots: SlotPrice[];
  total: SlotPrice;
}

/**
 * Per-slot prices and the total for the summary step, from fetched quotes.
 * The total is only a number once every slot has a quote; any error wins over
 * loading so the retry message shows.
 */
export function wizardPricing(
  slots: Pick<AvailabilitySlot, "start_at" | "end_at">[],
  mode: LessonMode | null,
  quotes: Record<string, QuoteEntry>,
): WizardPricing {
  const perSlot: SlotPrice[] = slots.map((s) => {
    if (!mode) return { status: "loading" };
    const entry = quotes[quoteKey(mode, slotDurationMinutes(s))];
    if (!entry) return { status: "loading" };
    if (entry.status === "error") return { status: "error" };
    return { status: "ok", price: entry.quote.lesson_price };
  });
  let total: SlotPrice;
  if (perSlot.some((p) => p.status === "error")) total = { status: "error" };
  else if (perSlot.some((p) => p.status === "loading")) total = { status: "loading" };
  else
    total = {
      status: "ok",
      price: perSlot.reduce((sum, p) => sum + (p.status === "ok" ? p.price : 0), 0),
    };
  return { slots: perSlot, total };
}

/**
 * Flat per-lesson add-on for a mode, read the way quote_booking reads it:
 * `lesson_mode_prices` keyed by the teachers.lesson_modes key, default 0.
 */
export function modeAddon(
  mode: LessonMode,
  prices: Partial<Record<string, number>> | null,
): number {
  const v = num(prices?.[mode]);
  return v ?? 0;
}

/** "₪150 לשעה" or "₪150 לשעה + ₪20 לשיעור". Null when there is no rate. */
export function modePriceLabel(hourlyRate: number | null, addon: number): string | null {
  if (hourlyRate == null) return null;
  const base = `${formatPrice(hourlyRate)} לשעה`;
  if (!addon) return base;
  const sign = addon > 0 ? "+" : "-";
  return `${base} ${sign} ${formatPrice(Math.abs(addon))} לשיעור`;
}

/** Short add-on text for compact places: "+ ₪20 לשיעור", or null for none. */
export function addonLabel(addon: number): string | null {
  if (!addon) return null;
  const sign = addon > 0 ? "+" : "-";
  return `${sign} ${formatPrice(Math.abs(addon))} לשיעור`;
}
