export const SITE_NAME = "SkillUp";
export const SITE_URL = "https://skillupwebsite.vercel.app";
export const CONTACT_EMAIL = "skillup.team.il@gmail.com";

export const APP_STORE_URL = "https://apps.apple.com/il/app/skillup/id6762197788";
// Placeholder Android URL. The real package name may differ when Android ships.
// When Android ships: update PLAY_STORE_URL if the package name differs, then flip
// PLAY_STORE_AVAILABLE to true. Store CTAs across the site automatically become
// UA-aware (iOS → App Store, Android → Play Store, else → both).
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.skillupapp.android";
export const PLAY_STORE_AVAILABLE = false;

// 9 official categories from the app, in display order.
// Category 9 (life skills) is the differentiator — flagged with isNew.
export const CATEGORIES = [
  {
    id: "math-science" as const,
    title: "מתמטיקה ומדעים",
    subjects: ["מתמטיקה", "פיזיקה", "ביולוגיה", "כימיה"],
  },
  {
    id: "foreign-languages" as const,
    title: "שפות זרות",
    subjects: ["אנגלית", "צרפתית", "ספרדית", "ערבית"],
  },
  {
    id: "hebrew-literature" as const,
    title: "עברית וספרות",
    subjects: ["לשון", "הבעה", "ספרות", "דקדוק"],
  },
  {
    id: "exam-prep" as const,
    title: "הכנה למבחנים",
    subjects: ["בגרויות", "פסיכומטרי", "SAT", "מיון"],
  },
  {
    id: "humanities" as const,
    title: "מדעי הרוח והחברה",
    subjects: ["היסטוריה", "גיאוגרפיה", "אזרחות", "חברה"],
  },
  {
    id: "sports-fitness" as const,
    title: "ספורט וכושר",
    subjects: ["כושר אישי", "ספורט", "ריקוד"],
  },
  {
    id: "arts-creativity" as const,
    title: "אומנות ויצירה",
    subjects: ["ציור", "מוזיקה", "עיצוב"],
  },
  {
    id: "tech-programming" as const,
    title: "תכנות וטכנולוגיה",
    subjects: ["Python", "JavaScript", "מדעי המחשב"],
  },
  {
    id: "life-skills" as const,
    title: "פנאי ומיומנויות חיים",
    subjects: ["בישול", "נהיגה", "פיננסים", "יצירתיות"],
    isNew: true,
  },
] as const;

