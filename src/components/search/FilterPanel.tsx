"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Chip from "@/components/ui/Chip";
import { PRICE_RANGES } from "@/lib/market-constants";
import { searchHref } from "@/lib/search-params";
import { LESSON_MODE_LABELS } from "@/lib/format";
import type { Category, LessonMode, SearchParams, Subject } from "@/lib/types";

interface FilterPanelProps {
  categories: Category[];
  applied: SearchParams;
  appliedCityName: string | null;
  /** Batch mode (mobile sheet): edits are local until "apply". */
  batch?: boolean;
  onApplied?: () => void;
  /** Live count preview for the sticky apply button (batch mode). */
  renderApply?: (count: number | null, apply: () => void) => React.ReactNode;
}

const RATING_OPTIONS = [
  { label: "4 ומעלה", value: 4 },
  { label: "4.5 ומעלה", value: 4.5 },
];

// The full filter set. Desktop renders it as the (RTL-right) sidebar with
// instant apply; the mobile bottom sheet renders it in batch mode with a
// sticky "הצג N מורים" button.
export default function FilterPanel({
  categories,
  applied,
  appliedCityName,
  batch = false,
  onApplied,
  renderApply,
}: FilterPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [draft, setDraft] = useState<SearchParams>(applied);
  const [cityName, setCityName] = useState<string | null>(appliedCityName);
  const [cityQuery, setCityQuery] = useState("");
  const [cityOptions, setCityOptions] = useState<{ id: string; name_he: string }[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  useEffect(() => {
    setDraft(applied);
    setCityName(appliedCityName);
  }, [applied, appliedCityName]);

  // Subjects for the selected category (chip row under the category select).
  useEffect(() => {
    const categoryId = draft.categoryId;
    if (!categoryId) {
      setSubjects([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("subjects")
      .select("id, name_he, name, category_id, icon")
      .eq("category_id", categoryId)
      .order("name_he")
      .then(({ data }) => {
        if (!cancelled) setSubjects((data ?? []) as Subject[]);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.categoryId, supabase]);

  // City autosuggest inside the panel.
  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 1) {
      setCityOptions([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("cities")
        .select("id, name_he")
        .ilike("name_he", `${q}%`)
        .order("name_he")
        .limit(6);
      setCityOptions(data ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [cityQuery, supabase]);

  // Live result-count preview for the batch (mobile) apply button.
  useEffect(() => {
    if (!batch) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc("search_teachers_public", {
        p_query: draft.query ?? null,
        p_city_id: draft.cityId ?? null,
        p_category_id: draft.categoryId ?? null,
        p_subject_ids: draft.subjectIds?.length ? draft.subjectIds : null,
        p_min_price: draft.minPrice ?? null,
        p_max_price: draft.maxPrice ?? null,
        p_min_rating: draft.minRating ?? null,
        p_modes: draft.modes?.length ? draft.modes : null,
        p_limit: 1,
      });
      if (!cancelled) setPreviewCount((data as { total?: number } | null)?.total ?? null);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [batch, draft, supabase]);

  function commit(next: SearchParams) {
    router.push(searchHref(next), { scroll: false });
    onApplied?.();
  }

  function update(partial: Partial<SearchParams>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    if (!batch) commit(next);
  }

  const apply = () => commit(draft);

  return (
    <div className="space-y-7">
      {/* Category */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">תחום</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const selected = draft.categoryId === cat.id;
            return (
              <Chip
                key={cat.id}
                size="sm"
                selected={selected}
                onClick={() =>
                  update({
                    categoryId: selected ? undefined : cat.id,
                    subjectIds: undefined,
                  })
                }
              >
                {cat.name_he}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      {/* Subject (within category) */}
      {subjects.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-ink">מקצוע</legend>
          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {subjects.map((s) => {
              const selected = draft.subjectIds?.[0] === s.id;
              return (
                <Chip
                  key={s.id}
                  size="sm"
                  selected={selected}
                  onClick={() =>
                    update({ subjectIds: selected ? undefined : [s.id] })
                  }
                >
                  {s.name_he}
                </Chip>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* City */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">עיר</legend>
        {draft.cityId && cityName ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-ink py-2 ps-4 pe-2 text-sm font-medium text-surface">
            <MapPin strokeWidth={1.75} size={16} />
            {cityName}
            <button
              type="button"
              aria-label="הסרת סינון עיר"
              onClick={() => {
                update({ cityId: undefined });
                setCityName(null);
              }}
              className="hit-44 grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-surface/20"
            >
              <X strokeWidth={1.75} size={16} />
            </button>
          </span>
        ) : (
          <div className="relative">
            <input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="חיפוש עיר..."
              className="h-11 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-sm outline-none transition-colors placeholder:text-ink-3 focus:border-ink"
            />
            {cityOptions.length > 0 && (
              <div className="shadow-[var(--shadow-lift)] absolute top-full inset-x-0 z-30 mt-1 overflow-hidden rounded-[var(--r-sm)] border border-line bg-surface py-1">
                {cityOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCityName(c.name_he);
                      setCityQuery("");
                      setCityOptions([]);
                      update({ cityId: c.id });
                    }}
                    className="block w-full cursor-pointer px-4 py-2.5 text-start text-sm hover:bg-canvas"
                  >
                    {c.name_he}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Lesson mode */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">אופן הלימוד</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LESSON_MODE_LABELS) as LessonMode[]).map((mode) => {
            const selected = draft.modes?.includes(mode) ?? false;
            return (
              <Chip
                key={mode}
                size="sm"
                selected={selected}
                onClick={() => {
                  const current = draft.modes ?? [];
                  const next = selected
                    ? current.filter((m) => m !== mode)
                    : [...current, mode];
                  update({ modes: next.length ? next : undefined });
                }}
              >
                {LESSON_MODE_LABELS[mode]}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">מחיר לשעה</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => {
            const selected =
              draft.minPrice === range.min && draft.maxPrice === range.max;
            return (
              <Chip
                key={range.label}
                size="sm"
                selected={selected}
                onClick={() =>
                  update(
                    selected
                      ? { minPrice: undefined, maxPrice: undefined }
                      : { minPrice: range.min, maxPrice: range.max },
                  )
                }
              >
                <span className="ltr-isolate tnum">{range.label}</span>
              </Chip>
            );
          })}
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">דירוג</legend>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => {
            const selected = draft.minRating === opt.value;
            return (
              <Chip
                key={opt.value}
                size="sm"
                selected={selected}
                onClick={() =>
                  update({ minRating: selected ? undefined : opt.value })
                }
              >
                ★ <span className="tnum">{opt.label}</span>
              </Chip>
            );
          })}
        </div>
      </fieldset>

      {batch && renderApply?.(previewCount, apply)}
    </div>
  );
}
