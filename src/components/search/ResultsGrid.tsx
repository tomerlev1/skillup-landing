"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import TeacherCard from "@/components/market/TeacherCard";
import { createClient } from "@/lib/supabase/client";
import type { SearchParams, SearchResult, TeacherCard as TeacherCardData } from "@/lib/types";

interface ResultsGridProps {
  initial: SearchResult;
  applied: SearchParams;
  pageSize: number;
}

// First page arrives server-rendered (SEO + instant paint); "load more"
// pages are fetched client-side straight from the anon RPC. Pagination,
// not infinite scroll — comparison shopping needs landmarks.
export default function ResultsGrid({ initial, applied, pageSize }: ResultsGridProps) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TeacherCardData[]>(initial.items);
  const [pending, startTransition] = useTransition();

  // New filters (new server render) reset the accumulated pages.
  useEffect(() => {
    setItems(initial.items);
  }, [initial]);

  const hasMore = items.length < initial.total;

  function loadMore() {
    startTransition(async () => {
      const { data } = await supabase.rpc("search_teachers_public", {
        p_query: applied.query ?? null,
        p_city_id: applied.cityId ?? null,
        p_category_id: applied.categoryId ?? null,
        p_subject_ids: applied.subjectIds?.length ? applied.subjectIds : null,
        p_min_price: applied.minPrice ?? null,
        p_max_price: applied.maxPrice ?? null,
        p_min_rating: applied.minRating ?? null,
        p_modes: applied.modes?.length ? applied.modes : null,
        p_sort: applied.sort ?? "rating",
        p_limit: pageSize,
        p_offset: items.length,
      });
      const next = (data as SearchResult | null)?.items ?? [];
      setItems((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...next.filter((t) => !seen.has(t.id))];
      });
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {items.map((t, i) => (
          <TeacherCard key={t.id} teacher={t} priority={i < 4} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="inline-flex h-12 cursor-pointer items-center rounded-full border border-[var(--mk-ink)] px-8 text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-paper-25 disabled:opacity-50"
          >
            {pending ? "טוען..." : "הצגת מורים נוספים"}
          </button>
          <p className="tnum mt-3 text-xs text-[var(--mk-ink-3)]">
            {items.length} מתוך {initial.total}
          </p>
        </div>
      )}
    </>
  );
}
