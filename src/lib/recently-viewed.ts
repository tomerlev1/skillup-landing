// "Recently viewed tutors" — guest-friendly localStorage rail. Full card
// snapshots are stored (not just ids) so rendering the rail needs zero
// backend round-trips; freshness matters less than instant recall here.

export interface ViewedTeacherSnapshot {
  id: string;
  display_name: string;
  image: string | null;
  subject: string | null;
  city_name: string | null;
  hourly_rate: number | null;
  rating_avg: number;
  review_count: number;
  viewed_at: number;
}

const KEY = "skillup:recently-viewed";
const MAX = 12;

export function getRecentlyViewed(): ViewedTeacherSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v) => v && typeof v.id === "string")
      : [];
  } catch {
    return [];
  }
}

export function recordView(snapshot: Omit<ViewedTeacherSnapshot, "viewed_at">): void {
  if (typeof window === "undefined") return;
  const next = [
    { ...snapshot, viewed_at: Date.now() },
    ...getRecentlyViewed().filter((v) => v.id !== snapshot.id),
  ];
  window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX)));
}
