import type { LessonMode, SearchParams, SortOption } from "@/lib/types";

// One canonical mapping between /search?... query params and the RPC
// params — shared by the server page, filter panel and load-more client.
// URL-as-state: every filter is shareable and back-button-safe.

const SORTS: SortOption[] = ["rating", "price_asc", "price_desc", "newest", "reviews"];
const MODES: LessonMode[] = ["online", "teacher_home", "student_home"];

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | undefined): number | undefined {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function parseSearchParams(raw: RawSearchParams): SearchParams {
  const modes = first(raw.mode)
    ?.split(",")
    .filter((m): m is LessonMode => (MODES as string[]).includes(m));
  const sort = first(raw.sort);

  return {
    query: first(raw.q)?.slice(0, 80) || undefined,
    cityId: first(raw.city) || undefined,
    categoryId: first(raw.category) || undefined,
    subjectIds: first(raw.subject) ? [first(raw.subject)!] : undefined,
    minPrice: num(first(raw.min_price)),
    maxPrice: num(first(raw.max_price)),
    minRating: num(first(raw.min_rating)),
    modes: modes?.length ? modes : undefined,
    sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : "rating",
  };
}

export function serializeSearchParams(params: SearchParams): URLSearchParams {
  const out = new URLSearchParams();
  if (params.query) out.set("q", params.query);
  if (params.subjectIds?.[0]) out.set("subject", params.subjectIds[0]);
  if (params.categoryId) out.set("category", params.categoryId);
  if (params.cityId) out.set("city", params.cityId);
  if (params.minPrice != null) out.set("min_price", String(params.minPrice));
  if (params.maxPrice != null) out.set("max_price", String(params.maxPrice));
  if (params.minRating != null) out.set("min_rating", String(params.minRating));
  if (params.modes?.length) out.set("mode", params.modes.join(","));
  if (params.sort && params.sort !== "rating") out.set("sort", params.sort);
  return out;
}

export function searchHref(params: SearchParams): string {
  const qs = serializeSearchParams(params);
  return `/search${qs.size ? `?${qs}` : ""}`;
}

export const SORT_LABELS: Record<SortOption, string> = {
  rating: "הדירוג הגבוה ביותר",
  reviews: "הכי הרבה ביקורות",
  price_asc: "מחיר: מהנמוך לגבוה",
  price_desc: "מחיר: מהגבוה לנמוך",
  newest: "חדשים באתר",
};
