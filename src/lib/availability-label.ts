const TZ = "Asia/Jerusalem";
const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "שבת"];

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Jerusalem calendar day as a UTC-midnight day number. */
function dayNumber(d: Date): number {
  const [y, m, day] = dateFmt.format(d).split("-").map(Number);
  return Date.UTC(y, m - 1, day) / 86_400_000;
}

const weekdayFmt = new Intl.DateTimeFormat("he-IL", { timeZone: TZ, weekday: "long" });
const dateShortFmt = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
});

/** "2026-10-21": the Jerusalem calendar day of an instant (for grouping slots by day). */
export function jerusalemDayKey(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "יום רביעי", Jerusalem calendar day. */
export function jerusalemWeekday(iso: string): string {
  return weekdayFmt.format(new Date(iso));
}

/** "21 באוקטובר", Jerusalem calendar day. */
export function jerusalemDateShort(iso: string): string {
  return dateShortFmt.format(new Date(iso));
}

/** "17:00", Jerusalem time, 24h. */
export function availabilityTime(startIso: string): string {
  return timeFmt.format(new Date(startIso));
}

/** Short Hebrew availability label, or null if past or 7+ calendar days ahead. */
export function availabilityLabel(startIso: string, now: Date): string | null {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime()) || start.getTime() < now.getTime()) return null;
  const diff = dayNumber(start) - dayNumber(now);
  if (diff < 0 || diff > 6) return null;
  const time = availabilityTime(startIso);
  if (diff === 0) return `יש מקום היום · ${time}`;
  if (diff === 1) return `יש מקום מחר · ${time}`;
  // Day-of-week from the Jerusalem calendar day (0 = Sunday).
  const dow = new Date(dayNumber(start) * 86_400_000).getUTCDay();
  const day = dow === 6 ? "בשבת" : `ביום ${WEEKDAYS[dow]}`;
  return `יש מקום ${day} · ${time}`;
}
