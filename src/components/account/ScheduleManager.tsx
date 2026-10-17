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

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-[var(--r-sm)] bg-action-soft text-action">
          <CalendarClock strokeWidth={1.75} size={20} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">
            ניהול הזמינות שלי
          </h2>
          <p className="text-sm text-ink-3">
            מסומן בירוק = פנוי להזמנה. השינויים מסתנכרנים מיד עם האפליקציה.
          </p>
        </div>
      </div>

      {/* Day strip */}
      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
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
              className={`relative shrink-0 rounded-[var(--r-md)] border px-3.5 py-2 text-center transition-colors ${
                selected
                  ? "border-ink bg-ink text-surface"
                  : "border-line bg-surface text-ink hover:border-ink"
              }`}
            >
              <span className="block text-sm font-semibold">
                {i === 0 ? "היום" : formatWeekday(d.toISOString())}
              </span>
              <span
                className={`block text-sm ${selected ? "text-surface/80" : "text-ink-3"}`}
              >
                {formatDateShort(d.toISOString())}
              </span>
              {dayOpen > 0 && (
                <span
                  className={`tnum mt-1 block text-sm font-bold ${
                    selected ? "text-surface" : "text-ok-text"
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
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
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
              className={`tnum inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--r-sm)] border text-sm font-medium transition-colors ${
                booked
                  ? "cursor-not-allowed border-warn/30 bg-warn/10 text-warn"
                  : open
                    ? "border-ok bg-ok/10 text-ok-text hover:bg-ok/15"
                    : past
                      ? "cursor-not-allowed border-line bg-canvas text-ink-3 opacity-50"
                      : "border-line bg-surface text-ink hover:border-ink"
              }`}
            >
              {booked ? (
                <Lock strokeWidth={1.75} size={16} aria-hidden="true" />
              ) : open ? (
                <Check strokeWidth={1.75} size={16} aria-hidden="true" />
              ) : null}
              {time}
            </button>
          );
        })}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--r-sm)] bg-ok" /> פנוי
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--r-sm)] border border-warn/30 bg-warn/10" /> הוזמן
        </span>
        <span className="tnum ms-auto font-medium text-ink-2">
          {openCount} חלונות פנויים בשבועיים הקרובים
        </span>
      </p>
    </div>
  );
}
