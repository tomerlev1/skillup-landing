import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import CategoryIcon from "@/components/market/CategoryIcon";
import RecentlyViewedRail from "@/components/market/RecentlyViewedRail";
import SearchPill from "@/components/market/SearchPill";
import TeacherRail from "@/components/market/TeacherRail";
import Chip from "@/components/ui/Chip";
import { getFeaturedTeachers, getNewTeachers } from "@/lib/data/teachers";
import { getCategories, getMajorCities } from "@/lib/data/taxonomy";
import { categorySlug, citySlug } from "@/lib/slugs";

export const revalidate = 1800; // ISR — teacher rails refresh every 30 min

export const metadata: Metadata = {
  title: "SkillUp | מורה פרטי בכל תחום — חיפוש, השוואה וקביעת שיעור אונליין",
  description:
    "מוצאים מורה פרטי מאומת ב-9 תחומים: מתמטיקה, אנגלית, בגרויות, תכנות, מוזיקה ועוד. משווים מחירים וביקורות אמיתיות, וקובעים שיעור ישירות מול המורה — אונליין או פנים אל פנים, בכל הארץ, בלי מתווכים.",
  alternates: { canonical: "/" },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "מחפשים לפי מקצוע ועיר",
    text: "מסננים לפי תחום, מחיר, דירוג ואופן הלימוד — אונליין, אצל המורה או אצלכם.",
  },
  {
    step: "02",
    title: "משווים פרופילים אמיתיים",
    text: "ביקורות של תלמידים, ניסיון, השכלה וסרטון היכרות. בלי הפתעות.",
  },
  {
    step: "03",
    title: "קובעים שיעור בקליק",
    text: "בוחרים מועד מתוך היומן האמיתי של המורה ומקבלים אישור ישירות ממנו.",
  },
  {
    step: "04",
    title: "לומדים ומתקדמים",
    text: "שומרים על קשר בצ'אט, קובעים שיעורי המשך ועוקבים אחרי ההתקדמות.",
  },
];

const HOME_FAQ = [
  {
    q: "כמה עולה שיעור פרטי דרך SkillUp?",
    a: "כל מורה קובע את המחיר שלו, והוא מוצג בפרופיל באופן שקוף — כולל הבדלי מחיר בין שיעור אונליין, שיעור אצל המורה ושיעור אצלכם בבית. אין עמלות תיווך ואין עלויות נסתרות.",
  },
  {
    q: "איך אני יודע שהמורה טוב?",
    a: "כל פרופיל מציג ביקורות אמיתיות של תלמידים שלמדו אצל המורה, דירוג מצטבר, שנות ניסיון והשכלה. מורים עם תג \"מורה מאומת\" עברו תהליך אימות של SkillUp.",
  },
  {
    q: "האם אפשר ללמוד אונליין?",
    a: "כן. רוב המורים מלמדים גם אונליין וגם פנים אל פנים. אפשר לסנן בחיפוש לפי אופן הלימוד המועדף עליכם.",
  },
  {
    q: "איך קובעים שיעור?",
    a: "נכנסים לפרופיל המורה, בוחרים מקצוע, אופן לימוד ומועד פנוי מתוך היומן שלו — והבקשה נשלחת ישירות למורה לאישור. אפשר גם לשלוח הודעה קודם ולשאול כל שאלה.",
  },
  {
    q: "האם החיפוש חינם?",
    a: "לגמרי. אפשר לחפש, להשוות מורים ולקרוא ביקורות בלי להירשם. הרשמה נדרשת רק כשרוצים לקבוע שיעור או לשלוח הודעה למורה.",
  },
  {
    q: "אני מורה — איך מצטרפים?",
    a: "מורידים את אפליקציית SkillUp, פותחים פרופיל מורה ומגדירים מקצועות, מחירים וזמינות. הפרופיל שלכם יופיע כאן באתר ובאפליקציה מול אלפי תלמידים.",
  },
];

export default async function HomePage() {
  const [categories, majorCities, featured, newest] = await Promise.all([
    getCategories(),
    getMajorCities(),
    getFeaturedTeachers(8),
    getNewTeachers(8),
  ]);

  const newcomers = newest.filter(
    (t) => !featured.slice(0, 8).some((f) => f.id === t.id),
  );

  return (
    <>
      {/* ===== Hero: search-first, listings visible above the fold ===== */}
      <section className="border-b border-[var(--mk-hairline)] bg-[var(--mk-band)]">
        <div className="mx-auto max-w-[840px] px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-20">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.01em] text-[var(--mk-ink)]">
            המורה הפרטי הבא שלכם
            <br />
            נמצא כאן
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-[var(--mk-ink-2)] sm:text-lg">
            מחפשים, משווים וקובעים שיעור ישירות מול מורים מאומתים —
            אונליין או פנים אל פנים, בכל הארץ.
          </p>

          <div className="mt-8">
            <SearchPill categories={categories} />
          </div>

          {/* Category shortcuts — real links to the SEO category pages */}
          <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {categories.map((cat) => (
              <Chip key={cat.id} href={`/categories/${categorySlug(cat)}`} size="sm">
                <CategoryIcon
                  iconName={cat.icon_name}
                  size={14}
                  className="text-[var(--mk-ink-3)]"
                />
                {cat.name_he}
              </Chip>
            ))}
          </div>

          <p className="mt-7 text-[13px] text-[var(--mk-ink-3)]">
            מורים מאומתים · ביקורות אמיתיות מתלמידים · קשר ישיר בלי מתווכים
          </p>
        </div>
      </section>

      {/* ===== Featured teachers — the marketplace is the hero ===== */}
      <div className="pt-14">
        <TeacherRail
          title="מורים מובילים ב-SkillUp"
          teachers={featured}
          moreHref="/search"
          priorityImages
        />
      </div>

      <RecentlyViewedRail />

      {/* ===== Categories grid ===== */}
      <section className="mt-16 bg-[var(--mk-band)] py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
            מה תרצו ללמוד היום?
          </h2>
          <p className="mt-1.5 text-sm text-[var(--mk-ink-3)]">
            9 תחומים, יותר מ-120 מקצועות — משיעורי מתמטיקה ועד גיטרה ובישול.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${categorySlug(cat)}`}
                className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--mk-shadow)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-50 text-[var(--mk-ink)]">
                    <CategoryIcon iconName={cat.icon_name} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-base font-semibold text-[var(--mk-ink)]">
                      {cat.name_he}
                      <ChevronLeft
                        size={15}
                        className="text-[var(--mk-ink-3)] transition-transform group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                    {cat.description_he && (
                      <span className="mt-1 block text-sm leading-relaxed text-[var(--mk-ink-3)]">
                        {cat.description_he}
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== New teachers ===== */}
      {newcomers.length > 0 && (
        <div className="pt-16">
          <TeacherRail
            title="חדשים ב-SkillUp"
            teachers={newcomers}
            moreHref="/search?sort=newest"
          />
        </div>
      )}

      {/* ===== How it works ===== */}
      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6" id="how-it-works">
        <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
          איך זה עובד
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <span className="font-display text-3xl font-extrabold tracking-tight text-ink-300">
                {item.step}
              </span>
              <h3 className="mt-2 text-base font-semibold text-[var(--mk-ink)]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--mk-ink-2)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mk-hairline-t mt-14 grid grid-cols-1 gap-6 pt-10 sm:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "מורים מאומתים",
              text: "פרופילים עם תג אימות עברו בדיקה של צוות SkillUp.",
            },
            {
              icon: MessageCircle,
              title: "קשר ישיר עם המורה",
              text: "צ'אט ישיר לתיאום ושאלות — בלי מתווכים באמצע.",
            },
            {
              icon: CalendarCheck,
              title: "זמינות אמיתית",
              text: "היומן בפרופיל משקף את הזמינות העדכנית של המורה.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper-50 text-[var(--mk-ink)]">
                <Icon size={19} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--mk-ink)]">
                  {title}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-[var(--mk-ink-2)]">
                  {text}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Cities band (SEO browse surface) ===== */}
      <section className="bg-[var(--mk-band)] py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
            מורים פרטיים בכל הארץ
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {majorCities.map((city) => (
              <Chip key={city.id} href={`/cities/${citySlug(city)}`} size="sm">
                מורה פרטי ב{city.name_he.split(" - ")[0]}
              </Chip>
            ))}
            <Chip href="/search" size="sm">
              כל הערים
            </Chip>
          </div>
        </div>
      </section>

      {/* ===== For tutors ===== */}
      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6">
        <div className="final-cta">
          <div className="max-w-[560px]">
            <p className="eyebrow">למורים</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-[var(--mk-ink)] sm:text-3xl">
              מלמדים? התלמידים הבאים שלכם כבר מחפשים אתכם
            </h2>
            <p className="panel-muted mt-4 text-base leading-relaxed">
              פרופיל מקצועי, יומן זמינות, צ'אט ישיר עם תלמידים וניהול שיעורים —
              הכול במקום אחד, בלי עמלות תיווך על הידע שלכם.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/for-tutors"
                className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                איך מצטרפים כמורה
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex h-12 items-center rounded-full border border-[var(--panel-rule)] px-6 text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-white/60"
              >
                עוד על SkillUp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-[840px] px-4 pb-24 sm:px-6">
        <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
          שאלות נפוצות
        </h2>
        <div className="faq mt-6">
          {HOME_FAQ.map((item, i) => (
            <details key={item.q}>
              <summary>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
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
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--mk-ink-3)]">
          יש לכם שאלה אחרת?{" "}
          <Link href="/faq" className="font-medium text-brand-700 hover:underline">
            לכל השאלות והתשובות
          </Link>
        </p>
      </section>
    </>
  );
}
