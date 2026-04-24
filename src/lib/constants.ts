export const SITE_NAME = "SkillUp";
export const SITE_URL = "https://skillupwebsite.vercel.app";
export const CONTACT_EMAIL = "skillup.team.il@gmail.com";

export const APP_STORE_URL = "#"; // TODO: Replace with real App Store URL
export const PLAY_STORE_URL = "#"; // TODO: Replace with real Play Store URL

export const NAV_LINKS = [
  { href: "#why-skillup", label: "למה SkillUp" },
  { href: "#how-it-works", label: "איך זה עובד" },
  { href: "#subjects", label: "מקצועות" },
  { href: "#for-tutors", label: "למורים" },
  { href: "#features", label: "יכולות" },
  { href: "#download", label: "הורדה" },
] as const;

export const PAIN_POINTS = [
  {
    iconId: "frustrated-search" as const,
    title: "חיפושים אינסופיים אחרי מורה פרטי?",
    description:
      "מסננים לפי מקצוע, רמה, אזור ומחיר. רואים מורים זמינים עכשיו. בלי שלושה ימים של המתנה בקבוצת ההורים.",
  },
  {
    iconId: "unverified-teacher" as const,
    title: "איך יודעים שהמורה באמת טוב?",
    description:
      "מורים מאומתים, ביקורות אמינות ואמיתיות מתלמידים שלמדו אצלם ואופציות רחבות שמאפשרות לקלוע בול למורה שמתאים לכם.",
  },
  {
    iconId: "complicated-coord" as const,
    title: "תיאום מסובך ותשלומים מבלבלים?",
    description:
      "יומן, צ׳אט ותזכורות, הכל בתוך האפליקציה. בלי לרדוף אחרי הודעות, בלי להתבלבל. התשלום? ישיר מכם למורה, בלי תיווכנים באמצע. אנחנו לא לוקחים עמלה אף פעם, גם אחרי גרסת הבטא.",
  },
] as const;

export const STEPS = [
  {
    number: 1,
    title: "חפשו מורה",
    description: "הזינו מקצוע ותוך שניות תקבלו רשימה של מורים מותאמים אישית",
  },
  {
    number: 2,
    title: "בחרו את המתאים",
    description: "עיינו בפרופילים, קראו ביקורות של תלמידים אחרים ובחרו בביטחון",
  },
  {
    number: 3,
    title: "קבעו שיעור",
    description: "בחרו תאריך ושעה נוחים, אשרו ותתחילו ללמוד",
  },
  {
    number: 4,
    title: "התחילו ללמוד!",
    description: "שיעור פרטי אחד על אחד - אחרי השיעור, דרגו ושתפו",
  },
] as const;

// 7 features that hit the actual differentiators (verified against the iOS repo).
export const FEATURES = [
  {
    icon: "dashboard" as const,
    title: "5 מערכות ניהול באפליקציה אחת",
    description:
      "לוח שיעורים, תשלומים, תלמידים, הכנסות, והתקשרות — הכול במקום אחד. תגידו שלום לאקסל, לביט ולוואטסאפ.",
    color: "amber" as const,
  },
  {
    icon: "modality" as const,
    title: "3 דרכים ללמוד",
    description:
      "אונליין, אצל המורה, או אצלכם בבית. אתם בוחרים מה הכי נוח לכם, שיעור אחר שיעור.",
    color: "blue" as const,
  },
  {
    icon: "video" as const,
    title: "לינק Zoom אוטומטי",
    description:
      "שיעור אונליין? הקישור מגיע אליכם בלחיצה. בלי לגלוש בין אפליקציות, בלי לחפש מיילים ישנים.",
    color: "indigo" as const,
  },
  {
    icon: "message-circle" as const,
    title: "צ׳אט עם תגובה ממסך הנעילה",
    description:
      "צ׳אט בזמן אמת עם המורה, כולל קבצים (PDF, Word, Excel, PPT עד 5MB). אפשר לענות להודעה ישירות מהבאנר על מסך הנעילה, בלי לפתוח את האפליקציה.",
    color: "rose" as const,
  },
  {
    icon: "shield-check" as const,
    title: "מורים מאומתים",
    description:
      "אימות זהות, בדיקת השכלה ואישור רקע, עוד לפני שהמורה מופיע בחיפוש. בלי הפתעות.",
    color: "emerald" as const,
  },
  {
    icon: "dashboard" as const,
    title: "דשבורד הכנסות למורים",
    description:
      "תג PRO, גרפי מגמה, יעדים עם חגיגת זהב. ניהול קריירה שלמה, מתוך האפליקציה.",
    color: "cyan" as const,
  },
  {
    icon: "bolt" as const,
    title: "תזכורת 4 שעות לפני השיעור",
    description:
      "פוש + מייל אוטומטי 4 שעות לפני, גם לתלמיד וגם למורה. אף שיעור לא נופל בגלל שכחה.",
    color: "amber" as const,
  },
] as const;

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
    subjects: ["בישול", "נהיגה", "אתיקט", "יצירתיות"],
    isNew: true,
  },
] as const;

// Short trust badges for the marquee ticker above QuickAnswer.
export const TRUST_BADGES = [
  "0% עמלה",
  "מורים מאומתים",
  "אונליין · אצל המורה · אצלכם",
  "עברית מלאה · RTL",
  "ביטול חינם בהתאם למדיניות הביטולים שלנו",
  "תשלום ישיר למורה",
  "בישראל, בעברית",
] as const;

// The 5 management systems that make up the Features hero tile.
export const MANAGEMENT_SYSTEMS = [
  { n: "01", label: "לוח שיעורים" },
  { n: "02", label: "תשלומים" },
  { n: "03", label: "תלמידים" },
  { n: "04", label: "הכנסות" },
  { n: "05", label: "תקשורת" },
] as const;

// Pull-quote intro for the Quick Answer section (pre-launch, honest).
export const QUICK_ANSWER =
  "SkillUp היא אפליקציית מובייל ישראלית שמחברת תלמידים, הורים ומבוגרים עם מורים פרטיים מאומתים ב-9 תחומים: מתמטיקה ומדעים, שפות זרות, עברית וספרות, בגרויות ופסיכומטרי, מדעי הרוח, ספורט, אומנות, תכנות, ופנאי ומיומנויות חיים (בישול, נהיגה, אתיקט). 3 דרכי לימוד: אונליין, אצל המורה, או אצלכם בבית. ללא עמלת תיווך. התשלום ביניכם לבין המורה. ביטול לפני השיעור בהתאם למדיניות הביטולים שלנו.";

// Founders' letter — replaces testimonials until real reviews land.
export const FOUNDER_LETTER =
  "בנינו את SkillUp כי מצאנו את עצמנו, כמו כל הורה ותלמיד בישראל, רודפים אחרי המלצות בקבוצות וואטסאפ, מתאמים שעות בטלפון, ומשלמים במזומן בלי שום שקיפות. בלי שום הגיון. רצינו שיהיה מקום אחד בעברית, על הטלפון, שבו רואים מורה, רואים מחיר, רואים שעות, ולוחצים. בלי תיווך. בלי עמלות. בלי הפתעות. SkillUp כאן, עכשיו, ואתם מוזמנים להיות חלק מההתחלה שלנו.";
