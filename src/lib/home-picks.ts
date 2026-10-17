import type { PublicReview } from "@/lib/data/reviews";
import type { AvailabilitySlot, TeacherCard } from "@/lib/types";

// Pure selection rules for the home page (spec §8.3). Kept free of data
// fetching so they are unit-tested in isolation.

const WALL_SIZE = 4;
const QUOTE_COUNT = 3;
const QUOTE_MIN = 40;
const QUOTE_MAX = 220;

const DEFAULT_REVIEWER = "תלמיד ב-SkillUp";

/**
 * The reviews RPC falls back to the gendered "תלמיד/ה"; the site never shows
 * gendered slashes, so that (and an empty name) becomes a neutral label.
 */
export function displayReviewerName(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed || trimmed === "תלמיד/ה") return DEFAULT_REVIEWER;
  return trimmed;
}

/**
 * Hero wall: verified teachers with a photo and at least one review. Teachers
 * with an open slot this week first, then by rating, then by review count.
 * Exactly 4, or [] so the hero falls back to a single centred column.
 */
export function pickWallTeachers(
  teachers: TeacherCard[],
  nextSlots: Record<string, AvailabilitySlot>,
): TeacherCard[] {
  const eligible = teachers.filter(
    (t) => t.is_verified && Boolean(t.avatar_url) && t.review_count >= 1,
  );
  if (eligible.length < WALL_SIZE) return [];
  const hasSlot = (t: TeacherCard) => (nextSlots[t.id] ? 1 : 0);
  return [...eligible]
    .sort(
      (a, b) =>
        hasSlot(b) - hasSlot(a) ||
        b.rating_avg - a.rating_avg ||
        b.review_count - a.review_count,
    )
    .slice(0, WALL_SIZE);
}

export interface HomeQuote {
  text: string;
  reviewer: string;
  teacherName: string;
  subject: string | null;
}

/**
 * Student quotes: 5-star reviews of a readable length, at most one per
 * teacher, exactly 3 — or [] so the section is hidden.
 */
export function pickQuotes(
  input: { teacher: TeacherCard; reviews: PublicReview[] }[],
): HomeQuote[] {
  const quotes: HomeQuote[] = [];
  for (const { teacher, reviews } of input) {
    if (quotes.length >= QUOTE_COUNT) break;
    const review = reviews.find((r) => {
      const len = r.text?.trim().length ?? 0;
      return r.rating === 5 && len >= QUOTE_MIN && len <= QUOTE_MAX;
    });
    if (!review) continue;
    quotes.push({
      text: review.text!.trim(),
      reviewer: displayReviewerName(review.reviewer_name),
      teacherName: teacher.display_name,
      subject: teacher.subjects[0] ?? null,
    });
  }
  return quotes.length >= QUOTE_COUNT ? quotes : [];
}
