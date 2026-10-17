import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import TeacherCard from "@/components/market/TeacherCard";
import Chip from "@/components/ui/Chip";
import { getNextSlots } from "@/lib/data/availability";
import { searchTeachers } from "@/lib/data/teachers";
import { getCategories, getMajorCities } from "@/lib/data/taxonomy";
import { SITE_URL } from "@/lib/constants";
import { citySlug, findCityBySlug } from "@/lib/slugs";
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

  const nextSlots = await getNextSlots([
    ...inCity.items.map((t) => t.id),
    ...onlineExtra.slice(0, 4).map((t) => t.id),
  ]);

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
        <nav aria-label="פירורי לחם" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
          <Link href="/" className="hit-44 hover:text-ink hover:underline">ראשי</Link>
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="text-ink">מורה פרטי ב{shortName}</span>
        </nav>

        <h1 className="flex items-center gap-3 font-ed text-[28px] font-bold leading-tight text-balance text-ink sm:text-[36px]">
          <MapPin size={24} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-ink-3" />
          מורה פרטי ב{shortName}
        </h1>
        <p className="mt-5 text-base leading-[1.75] text-ink-2">
          מחפשים שיעורים פרטיים ב{shortName} והסביבה? ב-SkillUp תמצאו מורים
          מאומתים שמלמדים באזור {shortName}, אצל המורה, אצלכם בבית או אונליין.
          משווים מחירים, קוראים ביקורות אמיתיות של תלמידים וקובעים שיעור ישירות
          מול המורה, בלי מתווכים ובלי עמלות.
        </p>
      </div>

      {/* Teachers in the city */}
      <div className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
            {inCity.total > 0
              ? `${inCity.total} מורים ב${shortName}`
              : `מורים ב${shortName}`}
          </h2>
          <Link
            href={searchHref({ cityId: city.id })}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-2 hover:text-ink hover:underline"
          >
            לחיפוש עם סינון
          </Link>
        </div>

        {inCity.items.length > 0 ? (
          <div className="flex max-w-[960px] flex-col gap-4">
            {inCity.items.map((t, i) => (
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
          <p className="rounded-[var(--r-md)] border border-line bg-surface px-5 py-8 text-base leading-relaxed text-ink-2">
            עדיין אין מורים שמלמדים פרונטלית ב{shortName}, אבל יש מורים שמלמדים
            אונליין מכל מקום בארץ. הנה כמה מהם:
          </p>
        )}
      </div>

      {/* Online alternative rail */}
      {onlineExtra.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
            מורים אונליין שזמינים גם ל{shortName}
          </h2>
          <div className="flex max-w-[960px] flex-col gap-4">
            {onlineExtra.slice(0, 4).map((t) => (
              <TeacherCard
                key={t.id}
                teacher={t}
                variant="list"
                nextSlot={nextSlots[t.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category cross-links */}
      <div className="mt-14 rounded-[var(--r-md)] border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-base font-semibold text-ink">
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
        <div className="mt-5 flex flex-wrap gap-x-4 border-t border-line pt-3">
          {majorCities
            .filter((c) => c.id !== city.id)
            .slice(0, 8)
            .map((c) => (
              <Link
                key={c.id}
                href={`/cities/${citySlug(c)}`}
                className="inline-flex min-h-11 items-center text-sm text-ink-2 hover:text-ink hover:underline"
              >
                מורה פרטי ב{c.name_he.split(" - ")[0]}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
