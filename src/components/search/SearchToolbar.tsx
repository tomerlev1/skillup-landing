"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import FilterPanel from "@/components/search/FilterPanel";
import { searchHref, SORT_LABELS } from "@/lib/search-params";
import type { Category, SearchParams, SortOption } from "@/lib/types";

interface SearchToolbarProps {
  categories: Category[];
  applied: SearchParams;
  appliedCityName: string | null;
  total: number;
}

// Results header: count + sort menu (desktop & mobile) + the mobile
// filters button that opens the bottom sheet.
export default function SearchToolbar({
  categories,
  applied,
  appliedCityName,
  total,
}: SearchToolbarProps) {
  const router = useRouter();
  const [sortOpen, setSortOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const sort = applied.sort ?? "rating";

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-ink-2">
        <span className="tnum font-semibold text-ink">{total}</span>{" "}
        מורים נמצאו
      </p>

      <div className="flex items-center gap-2">
        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            className="hit-44 inline-flex h-10 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            {SORT_LABELS[sort]}
            <ChevronDown strokeWidth={1.75} size={16} className={sortOpen ? "rotate-180" : ""} />
          </button>
          {sortOpen && (
            <div
              role="listbox"
              className="shadow-[var(--shadow-lift)] absolute top-full end-0 z-40 mt-1.5 w-52 overflow-hidden rounded-[var(--r-sm)] border border-line bg-surface py-1"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === sort}
                  onClick={() => {
                    setSortOpen(false);
                    router.push(searchHref({ ...applied, sort: option }), {
                      scroll: false,
                    });
                  }}
                  className={`block w-full cursor-pointer px-4 py-3 text-start text-sm hover:bg-canvas ${
                    option === sort
                      ? "font-semibold text-ink"
                      : "text-ink-2"
                  }`}
                >
                  {SORT_LABELS[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile filters */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-ink lg:hidden"
        >
          <SlidersHorizontal strokeWidth={1.75} size={16} />
          סינון
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="סינון מורים">
        <FilterPanel
          categories={categories}
          applied={applied}
          appliedCityName={appliedCityName}
          batch
          onApplied={() => setSheetOpen(false)}
          renderApply={(count, apply) => (
            <button
              type="button"
              onClick={apply}
              className="h-12 w-full cursor-pointer rounded-full bg-action text-sm font-semibold text-on-action transition-opacity hover:opacity-90"
            >
              {count != null ? (
                <>
                  הצגת <span className="tnum">{count}</span> מורים
                </>
              ) : (
                "הצגת תוצאות"
              )}
            </button>
          )}
        />
      </BottomSheet>
    </div>
  );
}
