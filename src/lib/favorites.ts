// Guest-friendly saved-tutors list in localStorage. Works logged-out (a
// return-visit engagement surface), no backend required. Components listen
// to the custom event to stay in sync across the page.

const KEY = "skillup:saved-tutors";
export const FAVORITES_EVENT = "skillup:favorites-changed";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function isFavorite(teacherId: string): boolean {
  return getFavorites().includes(teacherId);
}

export function toggleFavorite(teacherId: string): boolean {
  const current = getFavorites();
  const next = current.includes(teacherId)
    ? current.filter((id) => id !== teacherId)
    : [...current, teacherId];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  return next.includes(teacherId);
}
