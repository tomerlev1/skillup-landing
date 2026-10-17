"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort, formatWeekday } from "@/lib/format";
import type { AvailabilitySlot } from "@/lib/types";

interface ScheduleManagerProps {
  teacherId: string;
  slotMinutes: number;
}

// Working window shown in the grid (local time). Blocks step by the
// teacher's lesson duration, so they never overlap.
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;
const DAYS_AHEAD = 14;

function startOfDay(offsetDays: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// Teacher availability editor. Writes the SAME availability_slots table the
// iOS app uses; the realtime subscription means a change in the app appears
// here (and vice versa) without a refresh.
export default function ScheduleManager({
  teacherId,
  slotMinutes,
}: ScheduleManagerProps) {
  const supabase = useMemo(() => createClient(), []);
  const [dayOffset, setDayOffset] = useState(0);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const from = startOfDay(0).toISOString();
    const to = startOfDay(DAYS_AHEAD).toISOString();
    const { data } = await supabase
      .from("availability_slots")
      .select("id, teacher_id, start_at, end_at, is_booked, allowed_modes")
      .eq("teacher_id", teacherId)
      .gte("start_at", from)
      .lt("start_at", to)
      .order("start_at");
    setSlots((data ?? []) as AvailabilitySlot[]);
  }, [supabase, teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  // Live sync with the app: any insert/update/delete on this teacher's slots
  // re-pulls the window.
  useEffect(() => {
    const channel = supabase
      .channel(`schedule:${teacherId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability_slots",
          filter: `teacher_id=eq.${teacherId}`,
        },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, teacherId, load]);

  // Blocks for the selected day, keyed by ISO start.
  const blocks = useMemo(() => {
    const base = startOfDay(dayOffset);
    const out: { start: Date; end: Date; iso: string }[] = [];
    const stepMs = slotMinutes * 60_000;
    let t = new Date(base);
    t.setHours(DAY_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(base);
    dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);
    while (t.getTime() + stepMs <= dayEnd.getTime() + 1) {
      const start = new Date(t);
      const end = new Date(t.getTime() + stepMs);
      out.push({ start, end, iso: start.toISOString() });
      t = end;
    }
    return out;
  }, [dayOffset, slotMinutes]);

  const slotByIso = useMemo(() => {
    const m = new Map<string, AvailabilitySlot>();
    for (const s of slots) m.set(new Date(s.start_at).toISOString(), s);
    return m;
  }, [slots]);

  async function toggle(block: { start: Date; end: Date; iso: string }) {
    if (block.start.getTime() < Date.now()) return; // past
    const existing = slotByIso.get(block.iso);
    if (existing?.is_booked) return; // booked — locked
    setBusyKey(block.iso);

    if (existing) {
      await supabase.from("availability_slots").delete().eq("id", existing.id);
    } else {
      await supabase.from("availability_slots").insert({
        teacher_id: teacherId,
        start_at: block.start.toISOString(),
        end_at: block.end.toISOString(),
        is_booked: false,
      });
    }
    await load();
    setBusyKey(null);
  }

  const openCount = slots.filter((s) => !s.is_booked).length;
  const bookedCount = slots.length - openCount;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--r-md)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <p className="tnum text-[26px] font-black leading-none text-ok-text">{openCount}</p>
          <p className="mt-1.5 text-[13px] font-medium text-ink-2">חלונות פנויים · שבועיים</p>
        </div>
        <div className="rounded-[var(--r-md)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <p className="tnum text-[26px] font-black leading-none text-warn-text">{bookedCount}</p>
          <p className="mt-1.5 text-[13px] font-medium text-ink-2">שעות שכבר הוזמנו</p>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-[var(--r-md)] bg-brand-50 p-4 ring-1 ring-brand-100 sm:col-span-1">
          <CalendarClock strokeWidth={2} size={22} className="shrink-0 text-action" aria-hidden="true" />
          <p className="text-[13px] leading-snug text-ink-2">
            שיעור של <span className="tnum font-bold text-ink">{slotMinutes}</span> דקות לכל חלון
          </p>
        </div>
      </div>

      <div className="rounded-[var(--r-lg)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60 sm:p-6">

      {/* Day strip */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        {Array.from({ length: DAYS_AHEAD }, (_, i) => {
          const d = startOfDay(i);
          const selected = i === dayOffset;
          const dayOpen = slots.filter(
            (s) =>
              !s.is_booked &&
              new Date(s.start_at).toDateString() === d.toDateString(),
          ).length;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setDayOffset(i)}
              className={`relative min-w-[76px] shrink-0 cursor-pointer rounded-[var(--r-md)] px-3.5 py-2.5 text-center transition-all ${
                selected
                  ? "bg-[linear-gradient(160deg,#6457F0,#4F46E5)] text-white shadow-[0_10px_22px_-12px_rgba(79,70,229,0.9)]"
                  : "bg-canvas text-ink ring-1 ring-line/60 hover:bg-brand-50 hover:ring-brand-200"
              }`}
            >
              <span className="block text-sm font-bold">
                {i === 0 ? "היום" : formatWeekday(d.toISOString())}
              </span>
              <span
                className={`block text-[13px] ${selected ? "text-white/80" : "text-ink-3"}`}
              >
                {formatDateShort(d.toISOString())}
              </span>
              {dayOpen > 0 && (
                <span
                  className={`tnum mt-1.5 inline-block rounded-pill px-2 py-0.5 text-[12px] font-bold ${
                    selected ? "bg-white/20 text-white" : "bg-ok/10 text-ok-text"
                  }`}
                >
                  {dayOpen} פנויים
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-dashed border-line pt-5 sm:grid-cols-4 md:grid-cols-6">
        {blocks.map((block) => {
          const slot = slotByIso.get(block.iso);
          const past = block.start.getTime() < Date.now();
          const booked = slot?.is_booked ?? false;
          const open = Boolean(slot) && !booked;
          const time = block.start.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          });

          return (
            <button
              key={block.iso}
              type="button"
              onClick={() => toggle(block)}
              disabled={past || booked || busyKey === block.iso}
              aria-pressed={open}
              className={`tnum inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--r-sm)] border text-[15px] font-bold transition-all ${
                booked
                  ? "cursor-not-allowed border-warn/30 bg-warn/10 text-warn-text"
                  : open
                    ? "border-ok bg-ok/10 text-ok-text shadow-[0_6px_14px_-10px_rgba(16,185,129,0.9)] hover:bg-ok/15"
                    : past
                      ? "cursor-not-allowed border-transparent bg-canvas text-ink-3 opacity-50"
                      : "border-dashed border-line bg-surface text-ink-2 hover:border-action hover:bg-brand-50 hover:text-action"
              }`}
            >
              {booked ? (
                <Lock strokeWidth={2} size={15} aria-hidden="true" />
              ) : open ? (
                <Check strokeWidth={2.5} size={15} aria-hidden="true" />
              ) : null}
              {time}
            </button>
          );
        })}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-ok" /> פנוי להזמנה
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border border-warn/40 bg-warn/20" /> הוזמן
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border border-dashed border-ink-3" /> סגור
        </span>
      </p>
      </div>
    </div>
  );
}
