/**
 * Learning/teaching progress derived from the user's own bookings
 * (read-only; no schema changes). All month math is in Asia/Jerusalem.
 */

export interface ProgressBooking {
  start_at: string;
  end_at: string;
  status: string;
  teacher_id: string;
  student_id: string;
  subject_id: string | null;
}

export interface MonthBar {
  /** "YYYY-MM" */
  key: string;
  /** Hebrew short month label, e.g. "אוק׳" */
  label: string;
  count: number;
}

export interface Milestone {
  target: number;
  title: string;
  achieved: boolean;
}

export interface Progress {
  completed: number;
  hours: number;
  /** Distinct peers (teachers for a student, students for a teacher). */
  peers: number;
  subjects: number;
  upcoming: number;
  /** Last 6 months, oldest first, ending with the current month. */
  monthly: MonthBar[];
  /** Next milestone not yet reached (null when all are done). */
  nextMilestone: Milestone | null;
  milestones: Milestone[];
}

const MONTHS_HE = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

const MILESTONES: { target: number; title: string }[] = [
  { target: 1, title: "השיעור הראשון" },
  { target: 5, title: "5 שיעורים" },
  { target: 10, title: "10 שיעורים" },
  { target: 25, title: "25 שיעורים" },
  { target: 50, title: "50 שיעורים" },
];

const YM = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
});

/** "YYYY-MM" of an instant in Asia/Jerusalem. */
export function jerusalemMonthKey(d: Date): string {
  const parts = YM.formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** A lesson counts as done when it is marked completed, or confirmed and already over. */
export function isDone(b: ProgressBooking, now: Date): boolean {
  if (b.status === "completed") return true;
  return b.status === "confirmed" && new Date(b.end_at).getTime() <= now.getTime();
}

export function computeProgress(
  bookings: ProgressBooking[],
  role: "student" | "teacher",
  now: Date,
): Progress {
  const done = bookings.filter((b) => isDone(b, now));
  const minutes = done.reduce(
    (sum, b) => sum + Math.max(0, (new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 60_000),
    0,
  );
  const peers = new Set(done.map((b) => (role === "student" ? b.teacher_id : b.student_id)));
  const subjects = new Set(done.map((b) => b.subject_id).filter(Boolean));
  const upcoming = bookings.filter(
    (b) =>
      ["pending", "confirmed", "awaiting_payment"].includes(b.status) &&
      new Date(b.start_at).getTime() > now.getTime(),
  ).length;

  const current = jerusalemMonthKey(now);
  const monthly: MonthBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const key = shiftMonth(current, -i);
    const month = Number(key.split("-")[1]);
    monthly.push({ key, label: MONTHS_HE[month - 1], count: 0 });
  }
  for (const b of done) {
    const key = jerusalemMonthKey(new Date(b.start_at));
    const bar = monthly.find((m) => m.key === key);
    if (bar) bar.count += 1;
  }

  const milestones = MILESTONES.map((m) => ({ ...m, achieved: done.length >= m.target }));

  return {
    completed: done.length,
    hours: Math.round((minutes / 60) * 10) / 10,
    peers: peers.size,
    subjects: subjects.size,
    upcoming,
    monthly,
    nextMilestone: milestones.find((m) => !m.achieved) ?? null,
    milestones,
  };
}

/** Profile completeness (0–100) and the missing items, for the progress ring. */
export function profileCompleteness(
  checks: { label: string; done: boolean }[],
): { percent: number; missing: string[] } {
  if (checks.length === 0) return { percent: 100, missing: [] };
  const doneCount = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((doneCount / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => c.label),
  };
}
