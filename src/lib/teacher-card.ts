import { lessonModeLabel } from "@/lib/format";
import type { LessonMode, TeacherCard } from "@/lib/types";

export interface TeacherCardLines {
  /** Up to 3 subjects, " · "-joined. */
  subjects: string | null;
  /** "7 שנות ניסיון · 40+ תלמידים" (each part only when > 0). */
  credentials: string | null;
  /** "תל אביב · גם אונליין", "חיפה · אצל המורה", "אונליין"… */
  where: string | null;
  price: number | null;
  /** No reviews yet → "חדש ב-SkillUp" instead of a rating. */
  isNew: boolean;
}

const SEP = " · ";
const MODE_ORDER: LessonMode[] = ["online", "teacher_home", "student_home"];

function credentialsLine(years: number | null, students: number | null): string | null {
  const parts: string[] = [];
  if (years && years > 0) parts.push(years === 1 ? "שנת ניסיון אחת" : `${years} שנות ניסיון`);
  if (students && students > 0) parts.push(`${students}+ תלמידים`);
  return parts.length ? parts.join(SEP) : null;
}

function whereLine(city: string | null, modes: LessonMode[] | null): string | null {
  const set = new Set(modes ?? []);
  const ordered = MODE_ORDER.filter((m) => set.has(m));
  const join = (phrase: string | null) =>
    [city, phrase].filter(Boolean).join(SEP) || null;

  if (ordered.length === 0) return join(null);
  if (ordered.length === 1 && ordered[0] === "online") return lessonModeLabel("online");
  if (set.has("online")) return join("גם אונליין");
  return join(ordered.map(lessonModeLabel).join(SEP));
}

/** Pre-formatted text lines for every TeacherCard variant. Pure, testable. */
export function teacherCardLines(t: TeacherCard): TeacherCardLines {
  const subjects = t.subjects.slice(0, 3).join(SEP);
  return {
    subjects: subjects || null,
    credentials: credentialsLine(t.experience_years, t.total_students),
    where: whereLine(t.city_name, t.lesson_modes),
    price: t.hourly_rate ?? null,
    isNew: t.review_count === 0,
  };
}
