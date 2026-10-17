// Pure helpers for the teacher availability calendar.
// All calendar math is done on Jerusalem wall-clock values ("YYYY-MM-DD" +
// minutes since midnight) so it never depends on the browser's timezone.
// The availability RPCs take the same wall-clock values and resolve them in
// the teacher's timezone server-side.

const TZ = "Asia/Jerusalem";

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export interface WallClock {
  /** "2026-10-21" */
  date: string;
  /** Minutes since local midnight, 0..1439. */
  minutes: number;
}

export function wallClock(iso: string | Date): WallClock {
  const parts = Object.fromEntries(
    PARTS.formatToParts(typeof iso === "string" ? new Date(iso) : iso).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function toUtcDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(dateKey: string, days: number): string {
  const d = toUtcDate(dateKey);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a calendar date. */
export function weekdayOf(dateKey: string): number {
  return toUtcDate(dateKey).getUTCDay();
}

/** The Sunday that starts the (Israeli) week containing dateKey. */
export function weekStart(dateKey: string): string {
  return addDays(dateKey, -weekdayOf(dateKey));
}

export function hhmm(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function parseHhmm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Wall-clock span of a slot/booking; end minutes may be 1440 (midnight). */
export function span(startIso: string, endIso: string): { date: string; start: number; end: number } {
  const s = wallClock(startIso);
  const e = wallClock(endIso);
  const end = e.date === s.date ? e.minutes : e.minutes + 1440;
  return { date: s.date, start: s.minutes, end };
}

export interface SlotLike {
  start_at: string;
  end_at: string;
  is_booked: boolean;
  allowed_modes?: string[] | null;
}

export interface UpsertSlot {
  start_time: string;
  end_time: string;
  allowed_modes?: string[];
}

/**
 * The full list of OPEN slots for one day, as upsert_availability_slots
 * expects it (the RPC replaces every unbooked slot on that date). Booked
 * slots are kept by the server and must not be sent.
 */
export function dayPayload(
  daySlots: SlotLike[],
  change: { add?: { start: number; end: number; modes?: string[] | null }; removeStartAt?: string },
): UpsertSlot[] {
  const out: UpsertSlot[] = [];
  for (const s of daySlots) {
    if (s.is_booked) continue;
    if (change.removeStartAt && s.start_at === change.removeStartAt) continue;
    const sp = span(s.start_at, s.end_at);
    out.push({
      start_time: hhmm(sp.start),
      end_time: hhmm(sp.end),
      ...(s.allowed_modes?.length ? { allowed_modes: s.allowed_modes } : {}),
    });
  }
  if (change.add) {
    out.push({
      start_time: hhmm(change.add.start),
      end_time: hhmm(change.add.end),
      ...(change.add.modes?.length ? { allowed_modes: change.add.modes } : {}),
    });
  }
  return out.sort((a, b) => a.start_time.localeCompare(b.start_time));
}
