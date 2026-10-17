import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import CategoryIcon from "@/components/market/CategoryIcon";
import TeacherCard from "@/components/market/TeacherCard";
import Chip from "@/components/ui/Chip";
import { getNextSlots } from "@/lib/data/availability";
import { searchTeachers } from "@/lib/data/teachers";
import {
  getCategories,
  getMajorCities,
  getSubjectsByCategory,
} from "@/lib/data/taxonomy";
import { SITE_URL } from "@/lib/constants";
import { categorySlug, citySlug, findCategoryBySlug } from "@/lib/slugs";
import { searchHref } from "@/lib/search-params";

export const revalidate = 3600; // category landing pages: hourly ISR

// Human intro copy per category (SEO body content — not boilerplate).
const CATEGORY_INTROS: Record<string, string> = {
  "mathematics-and-sciences":
    "מתמטיקה, פיזיקה, כימיה וביולוגיה הם המקצועות שבהם הפער בין כיתה מלאה לשיעור אישי מורגש הכי מהר. מורה פרטי טוב לא רק פותר תרגילים: הוא מזהה בדיוק איפה ההבנה נעצרה, בונה את היסודות מחדש ומחזיר את הביטחון לפני המבחן הבא. ב-SkillUp תמצאו מורים למתמטיקה ומדעים לכל הרמות: מבית הספר היסודי, דרך 3-5 יחידות בתיכון ועד קורסי אוניברסיטה.",
  "foreign-languages":
    "אנגלית, צרפתית, ספרדית, ערבית או רוסית: שפה לומדים מדיבור, לא משינון. שיעור פרטי הוא הדרך המהירה ביותר לעבור מ״מבינים אבל מתביישים לדבר״ לשיחה שוטפת. המורים ב-SkillUp מלמדים גם לקראת בגרות ומבחני אמיר״ם וגם לצרכים מעשיים: עבודה, טיולים או ראיונות באנגלית.",
  "hebrew-and-language-arts":
    "לשון, הבעה וחיבור הם מהמקצועות שהכי קל לשפר בהם ציון עם ליווי נכון, כי הכללים ברורים. צריך רק מישהו שיסביר אותם בגובה העיניים. מורים פרטיים לעברית ולשון ב-SkillUp מלווים תלמידי חטיבה ותיכון לקראת הבגרות, ועוזרים גם לעולים חדשים שרוצים עברית בטוחה יותר.",
  "exams-and-test-prep":
    "בגרויות, פסיכומטרי, אמיר״ם או מבחני קבלה: הכנה טובה למבחן מתחילה בתוכנית עבודה נכונה. מורה פרטי שמתמחה בהכנה למבחנים יודע לזהות את שאלות הליבה, לתרגל בתנאי אמת ולנהל את הזמן שנשאר בצורה חכמה. זה ההבדל בין ללמוד הרבה לבין ללמוד נכון.",
  "humanities-and-social-sciences":
    "היסטוריה, אזרחות, ספרות ומדעי החברה דורשים משהו שקשה להשיג בכיתה גדולה: שיחה. מורה פרטי הופך חומר של שינון לסיפור שמבינים וזוכרים, ומלמד איך לכתוב תשובה מלאה שמזכה בכל הנקודות בבגרות.",
  "sports-and-fitness":
    "אימון אישי, שחייה, טניס או יוגה: עם מאמן אישי, כל אימון בנוי בדיוק על היכולות והמטרות שלכם. ב-SkillUp תמצאו מאמנים ומדריכים מוסמכים שמלמדים ליד הבית או אונליין, למתחילים ולמתקדמים, לילדים ולמבוגרים.",
  "arts-and-creativity":
    "גיטרה, פסנתר, פיתוח קול, ציור או צילום: תחביב הופך ליכולת אמיתית כשמוצאים מורה שמתאים לכם. שיעור אישי מתקדם בקצב שלכם, על המוזיקה והסגנון שאתם אוהבים, בלי להשוות לאף אחד אחר בכיתה.",
  "programming-and-technology":
    "תכנות אפשר ללמוד בכל גיל, וזה אחד הכישורים המבוקשים ביותר היום. מורים פרטיים לתכנות ב-SkillUp מלמדים Python, ג'אווה, פיתוח ווב ומדעי המחשב לתיכון (5 יחידות) ולסטודנטים, וגם מבוגרים שרוצים הסבה מקצועית מתחילים כאן.",
  "leisure-and-life-skills":
    "בישול, נהיגה, שחמט או צילום: הכישורים שעושים את החיים מעניינים יותר. זה התחום שמייחד את SkillUp: לא רק מקצועות בית ספר, אלא כל דבר ששווה ללמוד ממישהו שבאמת יודע ללמד אותו.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: categorySlug(c) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(await getCategories(), slug);
  if (!category) return { title: "לא נמצא | SkillUp" };
  return {
    title: `מורים פרטיים ל${category.name_he} | שיעורים אונליין ופרונטליים`,
    description: `מציאת מורה פרטי ל${category.name_he} בכל הארץ: השוואת מורים מאומתים לפי מחיר, דירוג וביקורות אמיתיות, וקביעת שיעור ישירות מול המורה, אונליין או פנים אל פנים.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function CategoryLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = findCategoryBySlug(categories, slug);
  if (!category) notFound();

  const [subjects, result, majorCities] = await Promise.all([
    getSubjectsByCategory(category.id),
    searchTeachers({ categoryId: category.id, limit: 12 }),
    getMajorCities(),
  ]);

  const nextSlots = await getNextSlots(result.items.map((t) => t.id));

  const intro = CATEGORY_INTROS[slug] ?? category.description_he ?? "";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `מורים פרטיים ל${category.name_he}`,
    numberOfItems: result.total,
    itemListElement: result.items.slice(0, 10).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/tutors/${t.id}`,
      name: t.display_name,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `מורים ל${category.name_he}`,
        item: `${SITE_URL}/categories/${slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />

      {/* Header */}
      <div className="relative isolate overflow-hidden rounded-[var(--r-lg)] p-6 ring-1 ring-brand-100 sm:p-10 [&>*]:max-w-[760px]" style={{ background: "var(--hero-wash)" }}>
        <nav aria-label="פירורי לחם" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
          <Link href="/" className="hit-44 hover:text-ink hover:underline">ראשי</Link>
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="text-ink">מורים ל{category.name_he}</span>
        </nav>

        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[var(--r-md)] bg-surface text-action shadow-[var(--shadow-card)]">
            <CategoryIcon iconName={category.icon_name} size={26} className="text-action" />
          </span>
          <h1 className="font-ed text-[30px] font-black leading-tight text-balance text-ink sm:text-[44px]">
            מורים פרטיים ל{category.name_he}
          </h1>
        </div>

        {intro && (
          <p className="mt-5 text-[17px] leading-[1.75] text-ink-2">{intro}</p>
        )}
      </div>

      {/* Subject chips — deep links into filtered search */}
      {subjects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[15px] font-bold text-ink">
            מקצועות ב{category.name_he}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <Chip key={s.id} href={searchHref({ subjectIds: [s.id] })} size="sm">
                {s.name_he}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Teachers */}
      <div className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-ed text-[26px] font-extrabold leading-tight text-balance text-ink sm:text-[32px]">
            {result.total > 0
              ? `${result.total} מורים ל${category.name_he} ב-SkillUp`
              : `מורים ל${category.name_he}`}
          </h2>
          <Link
            href={searchHref({ categoryId: category.id })}
            className="inline-flex min-h-11 shrink-0 items-center text-[15px] font-bold text-action hover:underline"
          >
            לכל המורים עם סינון
          </Link>
        </div>

        {result.items.length > 0 ? (
          <div className="flex max-w-[960px] flex-col gap-4">
            {result.items.map((t, i) => (
              <TeacherCard
                key={t.id}
                teacher={t}
                variant="list"
                nextSlot={nextSlots[t.id]}
                priority={i < 4}
              />
            ))}
          </div>
        ) : (
          <p className="max-w-[960px] rounded-[var(--r-lg)] bg-surface px-6 py-10 text-center text-base leading-relaxed text-ink-2 shadow-[var(--shadow-card)] ring-1 ring-line/60">
            המורים הראשונים בתחום הזה בדרך אלינו. בינתיים אפשר לחפש בתחומים
            אחרים או להירשם ולקבל עדכון.
          </p>
        )}
      </div>

      {/* Geo cross-links */}
      <div className="mt-14 rounded-[var(--r-lg)] bg-brand-50 p-6 ring-1 ring-brand-100 sm:p-8">
        <h2 className="text-lg font-extrabold text-ink">
          {category.name_he} לפי עיר
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          מורים פרטיים ליד הבית, או אונליין מכל מקום בארץ.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {majorCities.map((city) => (
            <Chip key={city.id} href={`/cities/${citySlug(city)}`} size="sm">
              מורה פרטי ב{city.name_he.split(" - ")[0]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
