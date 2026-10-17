import { getNextSlots } from "@/lib/data/availability";
import { getTeacherReviews } from "@/lib/data/reviews";
import { getCategories, getSubjects } from "@/lib/data/taxonomy";
import { getFeaturedTeachers, getNewTeachers, searchTeachers } from "@/lib/data/teachers";
import { pickQuotes, pickWallTeachers, type HomeQuote } from "@/lib/home-picks";
import { searchHref } from "@/lib/search-params";
import { categorySlug } from "@/lib/slugs";
import type { AvailabilitySlot, Category, Subject, TeacherCard } from "@/lib/types";

export type GoalTile = { label: string; href: string };

export interface HomeData {
  categories: Category[];
  stats: { teachers: number; categories: number };
  wall: TeacherCard[];
  /** Featured/newest teachers with an open slot in the next 7 days. */
  available: TeacherCard[];
  featured: TeacherCard[];
  nextSlots: Record<string, AvailabilitySlot>;
  quotes: HomeQuote[];
  goals: GoalTile[];
}

const QUOTE_TEACHERS = 8;

/**
 * "מה המטרה?" tiles. Category and subject ids differ between environments, so
 * lookups go by Hebrew name at runtime; anything not found falls back to the
 * plain search page.
 */
export function buildGoalTiles(categories: Category[], subjects: Subject[]): GoalTile[] {
  const category = (name: string) => {
    const cat = categories.find((c) => c.name_he === name);
    return cat ? `/categories/${categorySlug(cat)}` : "/search";
  };
  const subject = (name: string) => {
    const s = subjects.find((x) => x.name_he === name);
    return s ? searchHref({ subjectIds: [s.id] }) : "/search";
  };
  return [
    { label: "בגרות", href: category("מבחנים והכנה") },
    { label: "פסיכומטרי", href: subject("פסיכומטרי") },
    { label: "לשפר ציון", href: category("מתמטיקה ומדעים") },
    { label: "ללמוד משהו חדש", href: category("פנאי וכישורי חיים") },
    { label: "למבוגרים", href: searchHref({ query: "מבוגרים" }) },
  ];
}

async function safe<T>(p: Promise<T>, fallback: T, what: string): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error(`home: ${what} failed`, e);
    return fallback;
  }
}

/** Everything the home page renders, fetched in parallel at ISR time. */
export async function getHomeData(): Promise<HomeData> {
  const [categories, subjects, totals, featured, newest] = await Promise.all([
    getCategories(),
    safe(getSubjects(), [] as Subject[], "subjects"),
    safe(searchTeachers({ limit: 1 }), { items: [], total: 0 }, "teacher count"),
    getFeaturedTeachers(12),
    safe(getNewTeachers(12), [] as TeacherCard[], "newest teachers"),
  ]);

  // Featured first, newest after, deduped — the pool for the wall and the
  // "available this week" rail.
  const seen = new Set<string>();
  const pool = [...featured, ...newest].filter((t) =>
    seen.has(t.id) ? false : (seen.add(t.id), true),
  );

  const quoteTeachers = featured
    .filter((t) => t.review_count > 0)
    .slice(0, QUOTE_TEACHERS);

  const [nextSlots, reviewSets] = await Promise.all([
    getNextSlots(pool.map((t) => t.id)),
    Promise.all(
      quoteTeachers.map((t) => safe(getTeacherReviews(t.id, 10), [], "reviews")),
    ),
  ]);

  return {
    categories,
    stats: { teachers: totals.total ?? 0, categories: categories.length },
    wall: pickWallTeachers(pool, nextSlots),
    available: pool.filter((t) => nextSlots[t.id]),
    featured: featured.slice(0, 8),
    nextSlots,
    quotes: pickQuotes(
      quoteTeachers.map((teacher, i) => ({ teacher, reviews: reviewSets[i] })),
    ),
    goals: buildGoalTiles(categories, subjects),
  };
}
