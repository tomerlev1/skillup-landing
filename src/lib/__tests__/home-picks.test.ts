import { describe, expect, it } from "vitest";
import { displayReviewerName, pickQuotes, pickWallTeachers } from "../home-picks";
import type { PublicReview } from "../data/reviews";
import type { AvailabilitySlot, TeacherCard } from "../types";

function teacher(id: string, over: Partial<TeacherCard> = {}): TeacherCard {
  return {
    id,
    display_name: `מורה ${id}`,
    bio: null,
    avatar_url: `https://example.com/${id}.jpg`,
    card_image_url: null,
    video_url: null,
    hourly_rate: 150,
    lesson_mode_prices: null,
    lesson_modes: ["online"],
    city_id: null,
    city_name: null,
    experience_years: null,
    total_students: null,
    education: null,
    languages: null,
    is_verified: true,
    is_subscribed: false,
    subscription_tier: null,
    created_at: "2026-01-01T00:00:00Z",
    rating_avg: 4.5,
    review_count: 3,
    subjects: ["מתמטיקה"],
    ...over,
  };
}

function slot(teacherId: string): AvailabilitySlot {
  return {
    id: `s-${teacherId}`,
    teacher_id: teacherId,
    start_at: "2026-10-18T14:00:00Z",
    end_at: "2026-10-18T15:00:00Z",
    is_booked: false,
    allowed_modes: null,
  } as AvailabilitySlot;
}

const LONG = "שיעור מעולה, הסבירה בסבלנות רבה וממש עזרה לי להבין את החומר לבגרות.";

function review(over: Partial<PublicReview> = {}): PublicReview {
  return {
    id: Math.random().toString(36).slice(2),
    rating: 5,
    text: LONG,
    written_at: "2026-09-01T00:00:00Z",
    reviewer_name: "נועה",
    ...over,
  };
}

describe("pickWallTeachers", () => {
  it("puts teachers with a slot first and returns exactly 4", () => {
    const ts = [
      teacher("a", { rating_avg: 5 }),
      teacher("b", { rating_avg: 4.9 }),
      teacher("c", { rating_avg: 4.8 }),
      teacher("d", { rating_avg: 4.7 }),
      teacher("e", { rating_avg: 4.2 }),
      teacher("f", { rating_avg: 4.1 }),
    ];
    const picked = pickWallTeachers(ts, { e: slot("e"), f: slot("f") });
    expect(picked).toHaveLength(4);
    expect(picked.slice(0, 2).map((t) => t.id)).toEqual(["e", "f"]);
    expect(picked.slice(2).map((t) => t.id)).toEqual(["a", "b"]);
  });

  it("breaks rating ties by review_count", () => {
    const ts = [
      teacher("a", { rating_avg: 5, review_count: 2 }),
      teacher("b", { rating_avg: 5, review_count: 9 }),
      teacher("c"),
      teacher("d"),
    ];
    expect(pickWallTeachers(ts, {})[0].id).toBe("b");
  });

  it("returns [] when only 3 qualify", () => {
    expect(pickWallTeachers([teacher("a"), teacher("b"), teacher("c")], {})).toEqual([]);
  });

  it("excludes teachers without an avatar, unverified, or with no reviews", () => {
    const ts = [
      teacher("a"),
      teacher("b"),
      teacher("c"),
      teacher("noavatar", { avatar_url: null }),
      teacher("unverified", { is_verified: false }),
      teacher("noreviews", { review_count: 0 }),
    ];
    expect(pickWallTeachers(ts, {})).toEqual([]);
    const withFourth = pickWallTeachers([...ts, teacher("d")], {});
    expect(withFourth.map((t) => t.id).sort()).toEqual(["a", "b", "c", "d"]);
  });
});

describe("displayReviewerName", () => {
  it("maps the gendered default and empty names", () => {
    expect(displayReviewerName("תלמיד/ה")).toBe("תלמיד ב-SkillUp");
    expect(displayReviewerName("")).toBe("תלמיד ב-SkillUp");
    expect(displayReviewerName("   ")).toBe("תלמיד ב-SkillUp");
    expect(displayReviewerName(" תלמיד/ה ")).toBe("תלמיד ב-SkillUp");
  });
  it("trims real names", () => {
    expect(displayReviewerName("  נועה ")).toBe("נועה");
  });
});

describe("pickQuotes", () => {
  const three = (reviewsFor: (i: number) => PublicReview[]) =>
    ["a", "b", "c"].map((id, i) => ({ teacher: teacher(id), reviews: reviewsFor(i) }));

  it("returns 3 quotes with teacher name and subject", () => {
    const quotes = pickQuotes(three(() => [review()]));
    expect(quotes).toHaveLength(3);
    expect(quotes[0]).toEqual({
      text: LONG,
      reviewer: "נועה",
      teacherName: "מורה a",
      subject: "מתמטיקה",
    });
  });

  it("drops 4-star reviews", () => {
    const quotes = pickQuotes(three((i) => [review({ rating: i === 0 ? 4 : 5 })]));
    expect(quotes).toEqual([]);
  });

  it("drops texts that are too short or too long", () => {
    expect(pickQuotes(three((i) => [review({ text: i === 0 ? "מעולה" : LONG })]))).toEqual([]);
    expect(
      pickQuotes(three((i) => [review({ text: i === 0 ? "א".repeat(221) : LONG })])),
    ).toEqual([]);
  });

  it("takes at most one quote per teacher and 3 total", () => {
    const input = ["a", "b", "c", "d"].map((id) => ({
      teacher: teacher(id),
      reviews: [review(), review(), review()],
    }));
    const quotes = pickQuotes(input);
    expect(quotes).toHaveLength(3);
    expect(new Set(quotes.map((q) => q.teacherName)).size).toBe(3);
  });

  it("returns [] when fewer than 3 teachers have a usable quote", () => {
    const input = [
      { teacher: teacher("a"), reviews: [review(), review(), review()] },
      { teacher: teacher("b"), reviews: [review()] },
    ];
    expect(pickQuotes(input)).toEqual([]);
  });

  it("maps the gendered default reviewer name", () => {
    const quotes = pickQuotes(three(() => [review({ reviewer_name: "תלמיד/ה" })]));
    expect(quotes[0].reviewer).toBe("תלמיד ב-SkillUp");
  });

  it("subject is null when the teacher has no subjects", () => {
    const input = ["a", "b", "c"].map((id) => ({
      teacher: teacher(id, { subjects: [] }),
      reviews: [review()],
    }));
    expect(pickQuotes(input)[0].subject).toBeNull();
  });
});
