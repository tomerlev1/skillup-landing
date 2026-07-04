// Hebrew/RTL-safe formatting helpers. Prices, dates and phone numbers are LTR
// runs inside RTL text — always render them through these helpers (and wrap
// inline with dir="ltr" / unicode-bidi isolation at the component level).

const ILS = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return ILS.format(amount);
}

const RATING = new Intl.NumberFormat("he-IL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatRating(value: number): string {
  return RATING.format(value);
}

const DATE_SHORT = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
});

const DATE_FULL = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_24H = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY = new Intl.DateTimeFormat("he-IL", { weekday: "long" });

export function formatDateShort(iso: string): string {
  return DATE_SHORT.format(new Date(iso));
}

export function formatDateFull(iso: string): string {
  return DATE_FULL.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return TIME_24H.format(new Date(iso));
}

export function formatWeekday(iso: string): string {
  return WEEKDAY.format(new Date(iso));
}

/** "לפני 5 דקות" style relative time for chat and reviews. */
export function formatRelative(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("he", { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHours = Math.round(diffMin / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  return DATE_FULL.format(new Date(iso));
}

export const LESSON_MODE_LABELS: Record<string, string> = {
  online: "אונליין",
  teacher_home: "אצל המורה",
  student_home: "אצלכם בבית",
};

export function lessonModeLabel(mode: string): string {
  return LESSON_MODE_LABELS[mode] ?? mode;
}

// lesson_mode_prices holds a per-mode SURCHARGE (delta) on the base hourly
// rate — the DB (create_booking) adds it: total = hourly_rate + surcharge.
// iOS stores surcharges under legacy keys too (teacher_location/student_location).
const MODE_PRICE_KEYS: Record<string, string> = {
  online: "online",
  teacher_home: "teacher_location",
  student_home: "student_location",
};

export function lessonModePrice(
  mode: string,
  hourlyRate: number | null,
  prices: Partial<Record<string, number>> | null,
): number | null {
  if (hourlyRate == null) return null;
  const p = prices ?? {};
  const surcharge = p[mode] ?? p[MODE_PRICE_KEYS[mode] ?? mode] ?? 0;
  return hourlyRate + surcharge;
}
