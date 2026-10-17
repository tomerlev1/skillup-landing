import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterPanel from "@/components/search/FilterPanel";
import ResultsGrid from "@/components/search/ResultsGrid";
import SearchToolbar from "@/components/search/SearchToolbar";
import Chip from "@/components/ui/Chip";
import { getNextSlots } from "@/lib/data/availability";
import { searchTeachers } from "@/lib/data/teachers";
import { getCategories } from "@/lib/data/taxonomy";
import { createPublicClient } from "@/lib/supabase/public";
import { parseSearchParams, type RawSearchParams } from "@/lib/search-params";
import { categorySlug } from "@/lib/slugs";

const PAGE_SIZE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const applied = parseSearchParams(await searchParams);
  const cityName = applied.cityId ? await resolveCityName(applied.cityId) : null;
  const title = `מציאת מורה פרטי${cityName ? ` ב${cityName}` : ""} | SkillUp`;
  return {
    title,
    description:
      "חיפוש מורים פרטיים מאומתים לפי מקצוע, עיר, מחיר ודירוג. משווים פרופילים וביקורות אמיתיות וקובעים שיעור ישירות מול המורה.",
    // Filtered variants canonicalize to the base search page; the indexable
    // filter combinations live at /categories/* and /cities/*.
    alternates: { canonical: "/search" },
  };
}

async function resolveCityName(cityId: string): Promise<string | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("cities")
    .select("name_he")
    .eq("id", cityId)
    .maybeSingle();
  return data?.name_he ?? null;
}

async function resolveSubjectName(subjectId: string): Promise<string | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("subjects")
    .select("name_he")
    .eq("id", subjectId)
    .maybeSingle();
  return data?.name_he ?? null;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const applied = parseSearchParams(await searchParams);

  const [categories, result, cityName, subjectName] = await Promise.all([
    getCategories(),
    searchTeachers({ ...applied, limit: PAGE_SIZE, offset: 0 }),
    applied.cityId ? resolveCityName(applied.cityId) : Promise.resolve(null),
    applied.subjectIds?.[0]
      ? resolveSubjectName(applied.subjectIds[0])
      : Promise.resolve(null),
  ]);

  const nextSlots = await getNextSlots(result.items.map((t) => t.id));

  const categoryName = applied.categoryId
    ? (categories.find((c) => c.id === applied.categoryId)?.name_he ?? null)
    : null;

  const heading = subjectName
    ? `מורים ל${subjectName}`
    : categoryName
      ? `מורים ל${categoryName}`
      : applied.query
        ? `תוצאות חיפוש עבור "${applied.query}"`
        : "כל המורים";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-ed text-[28px] font-black text-ink sm:text-[38px]">
        {heading}
        {cityName && <span> ב{cityName}</span>}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Filter sidebar — first in DOM = the RIGHT side in RTL */}
        <aside className="hidden lg:block" aria-label="סינון תוצאות">
          <div className="sticky top-24 rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-line/60">
            <h2 className="mb-5 text-lg font-extrabold text-ink">סינון</h2>
            <FilterPanel
              categories={categories}
              applied={applied}
              appliedCityName={cityName}
            />
          </div>
        </aside>

        <section aria-label="תוצאות">
          <div className="space-y-4">
            <SearchToolbar
              categories={categories}
              applied={applied}
              appliedCityName={cityName}
              total={result.total}
            />
            <ActiveFilters
              applied={applied}
              subjectName={subjectName}
              categoryName={categoryName}
              cityName={cityName}
            />
          </div>

          <div className="mt-6">
            {result.items.length > 0 ? (
              <ResultsGrid
                initial={result}
                applied={applied}
                pageSize={PAGE_SIZE}
                initialNextSlots={nextSlots}
              />
            ) : (
              <div className="rounded-[var(--r-md)] bg-canvas px-6 py-16 text-center">
                <SearchX strokeWidth={1.75}
                  size={24}
                  className="mx-auto text-ink-3"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-lg font-semibold text-ink">
                  לא מצאנו מורים שמתאימים לחיפוש הזה
                </h2>
                <p className="mx-auto mt-2 max-w-[380px] text-sm leading-relaxed text-ink-2">
                  נסו להסיר חלק מהסינונים או לחפש מקצוע קרוב.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Chip href="/search" size="sm">
                    ניקוי כל הסינונים
                  </Chip>
                  {categories.slice(0, 4).map((cat) => (
                    <Chip
                      key={cat.id}
                      href={`/categories/${categorySlug(cat)}`}
                      size="sm"
                    >
                      {cat.name_he}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
