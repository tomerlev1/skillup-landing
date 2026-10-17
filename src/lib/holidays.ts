// Israeli holidays for the teacher calendar — the same bundled dataset the
// iOS app ships (Hebcal, CC BY 4.0), keyed by Jerusalem calendar date.
import data from "@/lib/data/israeli-holidays.json";

export type HolidayCategory = "major" | "national_holiday" | "erev_chag" | "minor";

export interface Holiday {
  date: string;
  title_he: string;
  category: HolidayCategory;
}

const RANK: Record<HolidayCategory, number> = { major: 3, national_holiday: 2, erev_chag: 1, minor: 0 };

const BY_DATE = new Map<string, Holiday>();
for (const h of data as Holiday[]) {
  const prev = BY_DATE.get(h.date);
  if (!prev || RANK[h.category] > RANK[prev.category]) BY_DATE.set(h.date, h);
}

export function holidayOn(dateKey: string): Holiday | null {
  return BY_DATE.get(dateKey) ?? null;
}

/** Full chag / national day: tinted in the grid, opening slots asks first. */
export function isRestDay(h: Holiday | null): boolean {
  return h?.category === "major" || h?.category === "national_holiday";
}

export function holidayNote(h: Holiday): string {
  switch (h.category) {
    case "major":
    case "national_holiday":
      return "יום חג. רוב התלמידים לא קובעים שיעורים היום.";
    case "erev_chag":
      return "ערב חג. אצל רבים זה חצי יום עבודה.";
    default:
      return "ציון בלוח השנה, בלי הגבלה על שיעורים.";
  }
}

export const HOLIDAY_ATTRIBUTION = "Hebcal.com (CC BY 4.0)";
