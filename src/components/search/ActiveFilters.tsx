import Link from "next/link";
import { X } from "lucide-react";
import { searchHref } from "@/lib/search-params";
import { LESSON_MODE_LABELS, formatPrice } from "@/lib/format";
import type { SearchParams } from "@/lib/types";

interface ActiveFiltersProps {
  applied: SearchParams;
  subjectName?: string | null;
  categoryName?: string | null;
  cityName?: string | null;
}

interface FilterChip {
  key: string;
  label: string;
  without: SearchParams;
}

// Removable applied-filter chips. Server component: each chip is a plain
// link to the same URL minus that filter — back-button and share safe.
export default function ActiveFilters({
  applied,
  subjectName,
  categoryName,
  cityName,
}: ActiveFiltersProps) {
  const chips: FilterChip[] = [];

  if (applied.query)
    chips.push({
      key: "q",
      label: `"${applied.query}"`,
      without: { ...applied, query: undefined },
    });
  if (applied.subjectIds?.[0] && subjectName)
    chips.push({
      key: "subject",
      label: subjectName,
      without: { ...applied, subjectIds: undefined },
    });
  if (applied.categoryId && categoryName && !applied.subjectIds?.length)
    chips.push({
      key: "category",
      label: categoryName,
      without: { ...applied, categoryId: undefined, subjectIds: undefined },
    });
  if (applied.cityId && cityName)
    chips.push({
      key: "city",
      label: cityName,
      without: { ...applied, cityId: undefined },
    });
  for (const mode of applied.modes ?? [])
    chips.push({
      key: `mode-${mode}`,
      label: LESSON_MODE_LABELS[mode],
      without: {
        ...applied,
        modes: applied.modes?.filter((m) => m !== mode).length
          ? applied.modes.filter((m) => m !== mode)
          : undefined,
      },
    });
  if (applied.minPrice != null || applied.maxPrice != null)
    chips.push({
      key: "price",
      label:
        applied.minPrice != null && applied.maxPrice != null
          ? `${formatPrice(applied.minPrice)}–${formatPrice(applied.maxPrice)}`
          : applied.maxPrice != null
            ? `עד ${formatPrice(applied.maxPrice)}`
            : `מ-${formatPrice(applied.minPrice!)}`,
      without: { ...applied, minPrice: undefined, maxPrice: undefined },
    });
  if (applied.minRating != null)
    chips.push({
      key: "rating",
      label: `★ ${applied.minRating}+`,
      without: { ...applied, minRating: undefined },
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={searchHref(chip.without)}
          className="hit-44 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink ps-3.5 pe-2.5 text-sm font-medium text-surface"
        >
          {chip.label}
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      ))}
      <Link
        href="/search"
        className="hit-44 inline-flex h-9 items-center text-sm font-medium text-ink-2 underline hover:text-ink"
      >
        ניקוי הכול
      </Link>
    </div>
  );
}
