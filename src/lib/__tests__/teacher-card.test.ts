import { describe, expect, it } from "vitest";
import { teacherCardLines } from "../teacher-card";
import type { TeacherCard } from "../types";

function teacher(over: Partial<TeacherCard> = {}): TeacherCard {
  return {
    id: "t1",
    display_name: "רותם לוי",
    bio: null,
    avatar_url: null,
    card_image_url: null,
    video_url: null,
    hourly_rate: 190,
    lesson_mode_prices: null,
    lesson_modes: ["online"],
    city_id: "c1",
    city_name: "תל אביב",
    experience_years: 7,
    total_students: 40,
    education: null,
    languages: null,
    is_verified: true,
    is_subscribed: false,
    subscription_tier: null,
    created_at: "2026-01-01T00:00:00Z",
    rating_avg: 4.8,
    review_count: 12,
    subjects: ["מתמטיקה", "פיזיקה"],
    ...over,
  };
}

describe("teacherCardLines", () => {
  it("price is null when hourly_rate is null", () => {
    expect(teacherCardLines(teacher({ hourly_rate: null })).price).toBeNull();
  });
  it("price passes through", () => {
    expect(teacherCardLines(teacher()).price).toBe(190);
  });

  it("subjects is null when there are none", () => {
    expect(teacherCardLines(teacher({ subjects: [] })).subjects).toBeNull();
  });
  it("subjects: first 3 joined with a middle dot", () => {
    const s = ["מתמטיקה", "פיזיקה", "כימיה", "ביולוגיה"];
    expect(teacherCardLines(teacher({ subjects: s })).subjects).toBe(
      "מתמטיקה · פיזיקה · כימיה",
    );
  });

  it("credentials: years and students", () => {
    expect(
      teacherCardLines(teacher({ experience_years: 7, total_students: 40 })).credentials,
    ).toBe("7 שנות ניסיון · 40+ תלמידים");
  });
  it("credentials: null when nothing to show", () => {
    expect(
      teacherCardLines(teacher({ experience_years: null, total_students: 0 })).credentials,
    ).toBeNull();
  });
  it("credentials: one year reads naturally", () => {
    expect(
      teacherCardLines(teacher({ experience_years: 1, total_students: null })).credentials,
    ).toBe("שנת ניסיון אחת");
  });
  it("credentials: students only", () => {
    expect(
      teacherCardLines(teacher({ experience_years: 0, total_students: 15 })).credentials,
    ).toBe("15+ תלמידים");
  });

  it("where: online plus another mode", () => {
    expect(
      teacherCardLines(teacher({ lesson_modes: ["online", "teacher_home"], city_name: "חיפה" }))
        .where,
    ).toBe("חיפה · גם אונליין");
  });
  it("where: online only", () => {
    expect(teacherCardLines(teacher({ lesson_modes: ["online"] })).where).toBe("אונליין");
  });
  it("where: teacher_home only", () => {
    expect(
      teacherCardLines(teacher({ lesson_modes: ["teacher_home"], city_name: "חיפה" })).where,
    ).toBe("חיפה · אצל המורה");
  });
  it("where: student_home only", () => {
    expect(
      teacherCardLines(teacher({ lesson_modes: ["student_home"], city_name: "חיפה" })).where,
    ).toBe("חיפה · אצלכם בבית");
  });
  it("where: both in-person modes", () => {
    expect(
      teacherCardLines(
        teacher({ lesson_modes: ["teacher_home", "student_home"], city_name: "חיפה" }),
      ).where,
    ).toBe("חיפה · אצל המורה · אצלכם בבית");
  });
  it("where: no city falls back to the mode phrase", () => {
    expect(
      teacherCardLines(teacher({ lesson_modes: ["online", "teacher_home"], city_name: null }))
        .where,
    ).toBe("גם אונליין");
  });
  it("where: city only when no modes", () => {
    expect(teacherCardLines(teacher({ lesson_modes: null, city_name: "חיפה" })).where).toBe(
      "חיפה",
    );
  });
  it("where: null when nothing known", () => {
    expect(teacherCardLines(teacher({ lesson_modes: [], city_name: null })).where).toBeNull();
  });

  it("isNew when there are no reviews", () => {
    expect(teacherCardLines(teacher({ review_count: 0 })).isNew).toBe(true);
    expect(teacherCardLines(teacher({ review_count: 3 })).isNew).toBe(false);
  });
});
