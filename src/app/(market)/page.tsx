import type { Metadata } from "next";
import Link from "next/link";
import ForTeachersPanel from "@/components/home/ForTeachersPanel";
import GoalTiles from "@/components/home/GoalTiles";
import HeroWall from "@/components/home/HeroWall";
import HowItWorks from "@/components/home/HowItWorks";
import StudentQuotes from "@/components/home/StudentQuotes";
import WhatWeCheck from "@/components/home/WhatWeCheck";
import RecentlyViewedRail from "@/components/market/RecentlyViewedRail";
import TeacherRail from "@/components/market/TeacherRail";
import { getHomeData } from "@/lib/data/home";

export const revalidate = 1800; // ISR — teacher rails refresh every 30 min

export const metadata: Metadata = {
  title: "SkillUp | מורה פרטי לכל מקצוע: חיפוש, השוואה וקביעת שיעור",
  description:
    "מוצאים מורה פרטי מאומת ב-9 תחומים: מתמטיקה, אנגלית, בגרויות, תכנות, מוזיקה ועוד. משווים מחירים וביקורות אמיתיות וקובעים שיעור ישירות מול המורה, אונליין או פנים אל פנים, בכל הארץ ובלי מתווכים.",
  alternates: { canonical: "/" },
};

const HOME_FAQ = [
  {
    q: "כמה עולה שיעור פרטי דרך SkillUp?",
    a: "כל מורה קובע את המחיר שלו, והוא מוצג בפרופיל בצורה שקופה, כולל ההבדל בין שיעור אונליין, שיעור אצל המורה ושיעור אצלכם בבית. אין עמלות ואין עלויות נסתרות.",
  },
  {
    q: "איך אני יודע שהמורה טוב?",
    a: "כל פרופיל מציג ביקורות אמיתיות של תלמידים שלמדו אצל המורה, דירוג מצטבר, שנות ניסיון והשכלה. מורים עם תג ״מורה מאומת״ עברו תהליך אימות של הצוות שלנו.",
  },
  {
    q: "האם אפשר ללמוד אונליין?",
    a: "כן. רוב המורים מלמדים גם אונליין וגם פנים אל פנים. אפשר לסנן בחיפוש לפי אופן הלימוד המועדף עליכם.",
  },
  {
    q: "איך קובעים שיעור?",
    a: "נכנסים לפרופיל של המורה, בוחרים מקצוע, אופן לימוד ומועד פנוי מתוך היומן שלו, והבקשה עוברת אליו לאישור. אפשר גם לשלוח הודעה קודם ולשאול כל מה שחשוב לכם.",
  },
  {
    q: "האם החיפוש חינם?",
    a: "לגמרי. אפשר לחפש, להשוות מורים ולקרוא ביקורות בלי להירשם. הרשמה נדרשת רק כשרוצים לקבוע שיעור או לשלוח הודעה למורה.",
  },
  {
    q: "אני מורה, איך מצטרפים?",
    a: "נרשמים כמורה כאן באתר או באפליקציית SkillUp, ממלאים את פרטי הפרופיל, ומאותו רגע תלמידים מוצאים אתכם בשני המקומות. אותו חשבון עובד בכל מקום.",
  },
];

export default async function HomePage() {
  const { categories, stats, wall, available, featured, nextSlots, quotes, goals } =
    await getHomeData();

  // "Available this week" when at least 4 teachers have an open slot —
  // preferring teachers not already on the hero wall — else top-rated.
  const wallIds = new Set(wall.map((t) => t.id));
  const availableOffWall = available.filter((t) => !wallIds.has(t.id));
  const availableRail = availableOffWall.length >= 4 ? availableOffWall : available;
  const showAvailable = availableRail.length >= 4;

  return (
    <>
      {/* 1. Hero — teachers are the heroes (direction C) */}
      <HeroWall categories={categories} stats={stats} wall={wall} nextSlots={nextSlots} />

      {/* 2. Goals */}
      <GoalTiles goals={goals} />

      {/* 3. Teachers rail */}
      <div className="pt-14 sm:pt-16">
        <TeacherRail
          title={showAvailable ? "יש להם מקום השבוע" : "מורים מובילים ב-SkillUp"}
          teachers={showAvailable ? availableRail : featured}
          nextSlots={nextSlots}
          moreHref="/search"
          minCount={4}
        />
      </div>

      <RecentlyViewedRail />

      {/* 4. How it works */}
      <HowItWorks />

      {/* 5. What we check */}
      <WhatWeCheck />

      {/* 6. Student quotes (hidden without three real ones) */}
      <StudentQuotes quotes={quotes} />

      {/* 7. For teachers + FAQ */}
      <ForTeachersPanel />

      <section className="mx-auto max-w-[840px] px-4 pb-24 pt-14 sm:px-6 sm:pt-16">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          שאלות נפוצות
        </h2>
        <div className="faq mt-6">
          {HOME_FAQ.map((item, i) => (
            <details key={item.q}>
              <summary>
                <span className="idx tnum">{String(i + 1).padStart(2, "0")}</span>
                {item.q}
                <svg
                  className="chev"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-3">
          יש לכם שאלה אחרת?{" "}
          <Link
            href="/faq"
            className="inline-flex min-h-11 items-center font-medium text-action hover:underline"
          >
            לכל השאלות והתשובות
          </Link>
        </p>
      </section>
    </>
  );
}
