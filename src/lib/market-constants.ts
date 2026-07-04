import type { City } from "@/lib/types";

// Major cities for footer/SEO city pages. Matched by prefix against
// cities.name_he (DB names include suffixes, e.g. "תל אביב - יפו").
export const MAJOR_CITY_PREFIXES = [
  "תל אביב",
  "ירושלים",
  "חיפה",
  "באר שבע",
  "ראשון לציון",
  "פתח תקווה",
  "נתניה",
  "רמת גן",
  "חולון",
  "אשדוד",
  "רעננה",
  "הרצליה",
] as const;

export function pickMajorCities(all: City[]): City[] {
  return MAJOR_CITY_PREFIXES.map((prefix) =>
    all.find((c) => c.name_he.startsWith(prefix)),
  ).filter((c): c is City => Boolean(c));
}

// Price filter chips (₪/hour) for search.
export const PRICE_RANGES = [
  { label: "עד ‎₪150", min: undefined, max: 150 },
  { label: "‎₪150–₪200", min: 150, max: 200 },
  { label: "‎₪200 ומעלה", min: 200, max: undefined },
] as const;
