import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import TeacherCard from "@/components/market/TeacherCard";
import Chip from "@/components/ui/Chip";
import { searchTeachers } from "@/lib/data/teachers";
import { getCategories, getMajorCities } from "@/lib/data/taxonomy";
import { SITE_URL } from "@/lib/constants";
import { categorySlug, citySlug, findCityBySlug } from "@/lib/slugs";
import { searchHref } from "@/lib/search-params";

export const revalidate = 3600; // city landing pages: hourly ISR

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cities = await getMajorCities();
  return cities.map((c) => ({ slug: citySlug(c) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = findCityBySlug(await getMajorCities(), slug);
  if (!city) return { title: "לא נמצא | SkillUp" };
  const shortName = city.name_he.split(" - ")[0];
  return {
    title: `מורה פרטי ב${shortName} | שיעורים פרטיים בכל המקצועות`,
    description: `מחפשים מורה פרטי ב${shortName}? משווים מורים מאומתים באזור ${shortName} לפי מקצוע, מחיר ודירוג. שיעורים אצל המורה, אצלכם בבית או אונליין, עם ביקורות אמיתיות וקביעת שיעור ישירה.`,
    alternates: { canonical: `/cities/${slug}` },
    other: {
      "geo.region": "IL",
      "geo.placename": shortName,
    },
  };
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function CityLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const [majorCities, categories] = await Promise.all([
    getMajorCities(),
    getCategories(),
  ]);
  const city = findCityBySlug(majorCities, slug);
  if (!city) notFound();

  const shortName = city.name_he.split(" - ")[0];
  const [inCity, online] = await Promise.all([
    searchTeachers({ cityId: city.id, limit: 12 }),
    searchTeachers({ modes: ["online"], limit: 8 }),
  ]);
  const onlineExtra = online.items.filter(
    (t) => !inCity.items.some((c) => c.id === t.id),
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `מורה פרטי ב${shortName}`,
        item: `${SITE_URL}/cities/${slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />

      <div className="max-w-[720px]">
        <nav aria-label="פירורי לחם" className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--mk-ink-3)]">
          <Link href="/" className="hover:text-[var(--mk-ink)] hover:underline">ראשי</Link>
          <ChevronLeft size={13} aria-hidden="true" />
          <span className="text-[var(--mk-ink)]">מורה פרטי ב{shortName}</span>
        </nav>

        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold text-[var(--mk-ink)] sm:text-4xl">
          <MapPin size={30} className="shrink-0 text-[var(--mk-ink-3)]" />
          מורה פרטי ב{shortName}
        </h1>
        <p className="mt-5 text-base leading-[1.75] text-[var(--mk-ink-2)]">
          מחפשים שיעורים פרטיים ב{shortName} והסביבה? ב-SkillUp תמצאו מורים
          מאומתים שמלמדים באזור {shortName}, אצל המורה, אצלכם בבית או אונליין.
          משווים מחירים, קוראים ביקורות אמיתיות של תלמידים וקובעים שיעור ישירות
          מול המורה, בלי מתווכים ובלי עמלות.
        </p>
      </div>

      {/* Teachers in the city */}
      <div className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
            {inCity.total > 0
              ? `${inCity.total} מורים ב${shortName}`
              : `מורים ב${shortName}`}
          </h2>
          <Link
            href={searchHref({ cityId: city.id })}
            className="shrink-0 text-sm font-medium text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
          >
            לחיפוש עם סינון
          </Link>
        </div>

        {inCity.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {inCity.items.map((t, i) => (
              <TeacherCard key={t.id} teacher={t} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-[var(--mk-band)] px-5 py-8 text-sm leading-relaxed text-[var(--mk-ink-2)]">
            עדיין אין מורים שמלמדים פרונטלית ב{shortName}, אבל יש מורים מעולים
            שמלמדים אונליין מכל מקום בארץ. הנה כמה מהם:
          </p>
        )}
      </div>

      {/* Online alternative rail */}
      {onlineExtra.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 font-display text-xl font-bold text-[var(--mk-ink)]">
            מורים אונליין שזמינים גם ל{shortName}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {onlineExtra.slice(0, 4).map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        </div>
      )}

      {/* Category cross-links */}
      <div className="mt-14 rounded-3xl bg-[var(--mk-band)] p-6 sm:p-8">
        <h2 className="text-base font-semibold text-[var(--mk-ink)]">
          שיעורים פרטיים ב{shortName} לפי תחום
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              href={searchHref({ categoryId: cat.id, cityId: city.id })}
              size="sm"
            >
              {cat.name_he} ב{shortName}
            </Chip>
          ))}
        </div>
        <div className="mk-hairline-t mt-5 flex flex-wrap gap-2 pt-4">
          {majorCities
            .filter((c) => c.id !== city.id)
            .slice(0, 8)
            .map((c) => (
              <Link
                key={c.id}
                href={`/cities/${citySlug(c)}`}
                className="text-[13px] text-[var(--mk-ink-3)] hover:text-[var(--mk-ink)] hover:underline"
              >
                מורה פרטי ב{c.name_he.split(" - ")[0]}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
