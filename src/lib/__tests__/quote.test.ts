import { describe, expect, it, vi } from "vitest";
import { formatAmount, formatPrice } from "../format";
import {
  addonLabel,
  fetchQuote,
  modeAddon,
  modePriceLabel,
  neededQuoteKeys,
  parseQuote,
  quoteKey,
  wizardPricing,
  type BookingQuote,
  type QuoteEntry,
  type RpcClient,
} from "../quote";

// What quote_booking returns for 150/h, +20 teacher_home add-on, 90 minutes.
const RAW_90 = {
  currency: "ILS",
  duration_minutes: 90,
  mode: "teacher_home",
  hourly_rate: 150,
  base_amount: 225,
  mode_addon: 20,
  lesson_price: 245,
  credits_applied: 0,
  amount_to_pay: 245,
  pricing_version: 1,
};

function quote(over: Partial<BookingQuote> = {}): BookingQuote {
  return { ...(parseQuote(RAW_90) as BookingQuote), ...over };
}

function slot(startIso: string, minutes: number) {
  const start = new Date(startIso);
  return {
    start_at: start.toISOString(),
    end_at: new Date(start.getTime() + minutes * 60_000).toISOString(),
  };
}

describe("parseQuote", () => {
  it("parses a full response", () => {
    expect(parseQuote(RAW_90)).toEqual(RAW_90);
  });
  it("accepts numeric strings (Postgres numeric)", () => {
    const q = parseQuote({ ...RAW_90, lesson_price: "112.5", hourly_rate: "150" });
    expect(q?.lesson_price).toBe(112.5);
    expect(q?.hourly_rate).toBe(150);
  });
  it("rejects missing or broken money fields", () => {
    expect(parseQuote(null)).toBeNull();
    expect(parseQuote([])).toBeNull();
    expect(parseQuote({ ...RAW_90, lesson_price: undefined })).toBeNull();
    expect(parseQuote({ ...RAW_90, lesson_price: "abc" })).toBeNull();
    expect(parseQuote({ ...RAW_90, hourly_rate: null })).toBeNull();
  });
  it("fills optional fields with safe defaults", () => {
    const q = parseQuote({ lesson_price: 100, hourly_rate: 100, duration_minutes: 60 });
    expect(q).toMatchObject({
      currency: "ILS",
      base_amount: 100,
      mode_addon: 0,
      credits_applied: 0,
      amount_to_pay: 100,
    });
  });
});

describe("fetchQuote", () => {
  it("calls quote_booking with the RPC argument names", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: RAW_90, error: null });
    const q = await fetchQuote({ rpc } as RpcClient, {
      teacherId: "t1",
      durationMinutes: 90,
      mode: "teacher_home",
    });
    expect(rpc).toHaveBeenCalledWith("quote_booking", {
      p_teacher_id: "t1",
      p_duration_minutes: 90,
      p_mode: "teacher_home",
    });
    expect(q.lesson_price).toBe(245);
  });
  it("throws on an RPC error", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(
      fetchQuote({ rpc } as RpcClient, { teacherId: "t1", durationMinutes: 60, mode: "online" }),
    ).rejects.toThrow("boom");
  });
  it("throws on an invalid payload", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { foo: 1 }, error: null });
    await expect(
      fetchQuote({ rpc } as RpcClient, { teacherId: "t1", durationMinutes: 60, mode: "online" }),
    ).rejects.toThrow();
  });
});

describe("neededQuoteKeys", () => {
  it("one key per distinct duration, none without a mode", () => {
    const slots = [
      slot("2099-01-01T10:00:00Z", 60),
      slot("2099-01-02T10:00:00Z", 90),
      slot("2099-01-03T10:00:00Z", 60),
    ];
    expect(neededQuoteKeys(slots, null)).toEqual([]);
    expect(neededQuoteKeys(slots, "online")).toEqual([
      { key: "online:60", durationMinutes: 60 },
      { key: "online:90", durationMinutes: 90 },
    ]);
  });
});

describe("wizardPricing", () => {
  const s90 = slot("2099-01-01T10:00:00Z", 90);
  const s60 = slot("2099-01-02T10:00:00Z", 60);

  it("uses lesson_price per slot and sums it (90 min at 150/h +20 = 245, not 255)", () => {
    const quotes: Record<string, QuoteEntry> = {
      [quoteKey("teacher_home", 90)]: { status: "ok", quote: quote() },
      [quoteKey("teacher_home", 60)]: {
        status: "ok",
        quote: quote({ duration_minutes: 60, base_amount: 150, lesson_price: 170 }),
      },
    };
    const p = wizardPricing([s90, s60], "teacher_home", quotes);
    expect(p.slots).toEqual([
      { status: "ok", price: 245 },
      { status: "ok", price: 170 },
    ]);
    expect(p.total).toEqual({ status: "ok", price: 415 });
  });

  it("keeps fractional prices exact (no per-slot rounding)", () => {
    const s45 = slot("2099-01-01T10:00:00Z", 45);
    const quotes: Record<string, QuoteEntry> = {
      [quoteKey("online", 45)]: {
        status: "ok",
        quote: quote({ duration_minutes: 45, lesson_price: 112.5 }),
      },
    };
    const p = wizardPricing([s45, slot("2099-01-02T10:00:00Z", 45)], "online", quotes);
    expect(p.total).toEqual({ status: "ok", price: 225 });
  });

  it("is loading while any quote is missing", () => {
    const quotes: Record<string, QuoteEntry> = {
      [quoteKey("teacher_home", 90)]: { status: "ok", quote: quote() },
    };
    const p = wizardPricing([s90, s60], "teacher_home", quotes);
    expect(p.slots[1]).toEqual({ status: "loading" });
    expect(p.total).toEqual({ status: "loading" });
  });

  it("an error wins over loading so retry is offered", () => {
    const quotes: Record<string, QuoteEntry> = {
      [quoteKey("teacher_home", 90)]: { status: "error" },
    };
    const p = wizardPricing([s90, s60], "teacher_home", quotes);
    expect(p.slots[0]).toEqual({ status: "error" });
    expect(p.total).toEqual({ status: "error" });
  });

  it("no mode yet → loading", () => {
    expect(wizardPricing([s90], null, {}).total).toEqual({ status: "loading" });
  });
});

describe("mode add-on display", () => {
  const prices = { online: 0, teacher_home: 20, teacher_location: 99 };

  it("reads the flat add-on by the lesson_modes key, like the server", () => {
    expect(modeAddon("teacher_home", prices)).toBe(20);
    expect(modeAddon("online", prices)).toBe(0);
    expect(modeAddon("student_home", prices)).toBe(0);
    expect(modeAddon("online", null)).toBe(0);
  });

  it("shows hourly rate plus a per-lesson add-on, never a summed hourly price", () => {
    expect(modePriceLabel(150, 20)).toBe(`${formatPrice(150)} לשעה + ${formatPrice(20)} לשיעור`);
    expect(modePriceLabel(150, 0)).toBe(`${formatPrice(150)} לשעה`);
    expect(modePriceLabel(150, -10)).toBe(`${formatPrice(150)} לשעה - ${formatPrice(10)} לשיעור`);
    expect(modePriceLabel(null, 20)).toBeNull();
    expect(modePriceLabel(150, 20)).not.toContain(formatPrice(170));
  });

  it("addonLabel", () => {
    expect(addonLabel(20)).toBe(`+ ${formatPrice(20)} לשיעור`);
    expect(addonLabel(0)).toBeNull();
  });
});

describe("formatAmount", () => {
  it("whole shekels without decimals, agorot when present", () => {
    expect(formatAmount(245)).toBe(formatPrice(245));
    expect(formatAmount(112.5)).toContain("112.50");
    expect(formatAmount(112.5)).not.toBe(formatPrice(113));
  });
});
