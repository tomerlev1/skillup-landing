import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AppStoreButtons from "@/components/market/AppStoreButtons";
import GuestOnly from "@/components/auth/GuestOnly";
import {
  BadgeCheck,
  BellRing,
  CalendarCheck,
  ChevronLeft,
  Headset,
  LayoutDashboard,
  MessageCircle,
  Smartphone,
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
  title: "SkillUp | מורה פרטי לכל מקצוע: חיפוש, השוואה וקביעת שיעור",
  description:
    "מוצאים מורה פרטי מאומת ב-9 תחומים: מתמטיקה, אנגלית, בגרויות, תכנות, מוזיקה ועוד. משווים מחירים וביקורות אמיתיות וקובעים שיעור ישירות מול המורה, אונליין או פנים אל פנים, בכל הארץ ובלי מתווכים.",
  alternates: { canonical: "/" },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "מחפשים לפי מקצוע ועיר",
    text: "מסננים לפי תחום, מחיר, דירוג ואופן הלימוד: אונליין, אצל המורה או אצלכם בבית.",
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
      <section className="section-bloom border-b border-[var(--mk-hairline)] bg-[var(--mk-band)]">
        <div className="mx-auto max-w-[840px] px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-20">
          <h1 className="rise-in font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.15] tracking-[-0.01em] text-[var(--mk-ink)]">
            מורים פרטיים בישראל
            <br />
            <span className="title-gradient">בצורה הנוחה והנגישה ביותר</span>
          </h1>
          <p
            className="rise-in mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-[var(--mk-ink-2)] sm:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            מחפשים, משווים וקובעים שיעור ישירות מול מורים מאומתים,
            אונליין או פנים אל פנים, בכל הארץ.
          </p>

          {/* z-20 so the search dropdown stacks above the chips row below
              (both create stacking contexts via their rise-in transform) */}
          <div className="rise-in relative z-20 mt-8" style={{ animationDelay: "0.2s" }}>
            <SearchPill categories={categories} />
          </div>

          {/* Category shortcuts — real links to the SEO category pages */}
          <div
            className="rise-in relative z-10 no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
            style={{ animationDelay: "0.3s" }}
          >
            {categories.map((cat) => (
              <Chip key={cat.id} href={`/categories/${categorySlug(cat)}`} size="sm">
                <CategoryIcon
                  iconName={cat.icon_name}
                  size={14}
                  color={cat.color_hex}
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
            9 תחומים ויותר מ-120 מקצועות, משיעור מתמטיקה ועד גיטרה ובישול.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${categorySlug(cat)}`}
                className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--mk-shadow)]"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-50"
                    style={
                      cat.color_hex
                        ? { backgroundColor: `${cat.color_hex}1a` }
                        : undefined
                    }
                  >
                    <CategoryIcon
                      iconName={cat.icon_name}
                      size={20}
                      color={cat.color_hex}
                      className="text-[var(--mk-ink)]"
                    />
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
              text: "מתאמים ושואלים בצ'אט ישיר, בלי מתווכים באמצע.",
            },
            {
              icon: CalendarCheck,
              title: "זמינות אמיתית",
              text: "היומן בפרופיל משקף את הזמינות העדכנית של המורה.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
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

      {/* ===== Get the app — placed after "how it works", once the product
          is understood; deliberately NOT in the hero so it never competes
          with search, the primary web action ===== */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-[var(--mk-hairline)] bg-white p-8 text-center sm:flex-row sm:justify-between sm:p-10 sm:text-start">
          <div className="max-w-[520px]">
            <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
              קחו את SkillUp לכל מקום
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--mk-ink-2)]">
              ההודעות, השיעורים והיומן שלכם בכיס. אותו חשבון בדיוק כמו באתר,
              עם התראות בזמן אמת על כל פעילות.
            </p>
          </div>
          <AppStoreButtons className="shrink-0 justify-center sm:justify-start" />
        </div>
      </section>

      {/* ===== Cities band (SEO browse surface) ===== */}
      <section className="mt-16 bg-[var(--mk-band)] py-14">
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

      {/* ===== For tutors — compact cross-platform pitch ===== */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div
          className="final-cta"
          style={{ padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 48px)" }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="max-w-[580px]">
              <p className="eyebrow">מידע למורים</p>
              <h2 className="mt-2 font-display text-xl font-extrabold leading-tight text-[var(--mk-ink)] sm:text-2xl">
                המורים שלנו נהנים יותר!
              </h2>
              <p className="panel-muted mt-3 text-[15px] leading-relaxed">
                תלמידים מוצאים אתכם גם באתר וגם באפליקציה שלנו. כל התהליך, מהחשיפה,
                קביעת שיעור, צ&apos;אט, הערות על השיעור ומעקב אם שולם או לא, הכל
                מתבצע מהכיס שלכם באופן מיידי, מהיר וחדשני. פנייה חדשה? אתם יודעים
                עליה באותה שנייה.
              </p>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: Smartphone, text: "פרופיל אחד, באתר ובאפליקציה" },
                  { icon: BellRing, text: "התראות בזמן האמת על כל פעילות" },
                  { icon: LayoutDashboard, text: "כלי ניהול מהמכשיר הנייד שלך" },
                  { icon: Headset, text: "שירות לקוחות זמין ומהיר" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm font-medium text-[var(--mk-ink)]">
                    <Icon size={15} className="shrink-0 text-brand-700" />
                    {text}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <GuestOnly>
                  <Link
                    href="/signup?role=teacher"
                    className="inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    פתיחת חשבון מורה
                  </Link>
                </GuestOnly>
                <Link
                  href="/for-tutors"
                  className="inline-flex h-11 items-center rounded-full border border-[var(--panel-rule)] px-6 text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-white/60"
                >
                  עוד על SkillUp למורים
                </Link>
              </div>
            </div>

            {/* Emotional illustration (hidden on mobile) */}
            <div className="hidden justify-center lg:flex">
              <Image
                src="/images/illustrations/teacher-student.png"
                alt="מורה ותלמיד לומדים יחד"
                width={260}
                height={260}
                className="w-[260px] rounded-3xl"
              />
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
