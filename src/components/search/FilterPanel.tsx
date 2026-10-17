"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, MapPin, Star, X } from "lucide-react";
import CategoryIcon from "@/components/market/CategoryIcon";
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

/** Collapsible filter group: the header shows the current choice, so a
 *  closed group still tells you what is applied. */
function Section({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string | null;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen || Boolean(summary));
  return (
    <section className="border-b border-line/70 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-3.5 text-start"
      >
        <span className="min-w-0">
          <span className="block text-[15px] font-extrabold text-ink">{title}</span>
          {summary && (
            <span className="mt-0.5 block truncate text-[13px] font-semibold text-action">{summary}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 text-ink-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Compact checklist row used for single/multi choice lists. */
function OptionRow({
  selected,
  onClick,
  children,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-[var(--r-sm)] px-2.5 text-start text-[15px] transition-colors ${
        selected ? "bg-tint-indigo font-bold text-tint-indigo-fg" : "text-ink-2 hover:bg-canvas hover:text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-[18px] shrink-0 place-items-center border-2 transition-colors ${
          multi ? "rounded-[var(--r-sm)] scale-90" : "rounded-full"
        } ${selected ? "border-action bg-action text-on-action" : "border-line bg-surface"}`}
      >
        {selected && <Check size={12} strokeWidth={3.5} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

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

  // Summaries shown on collapsed group headers.
  const categoryName = categories.find((c) => c.id === draft.categoryId)?.name_he ?? null;
  const subjectName = subjects.find((s) => s.id === draft.subjectIds?.[0])?.name_he ?? null;
  const modesSummary = draft.modes?.length
    ? draft.modes.map((m) => LESSON_MODE_LABELS[m]).join(", ")
    : null;
  const priceSummary =
    PRICE_RANGES.find((r) => r.min === draft.minPrice && r.max === draft.maxPrice)?.label ?? null;
  const ratingSummary = RATING_OPTIONS.find((o) => o.value === draft.minRating)?.label ?? null;

  return (
    <div>
      {/* Category */}
      <Section title="תחום" summary={categoryName} defaultOpen>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const selected = draft.categoryId === cat.id;
            return (
              <OptionRow
                key={cat.id}
                selected={selected}
                onClick={() =>
                  update({
                    categoryId: selected ? undefined : cat.id,
                    subjectIds: undefined,
                  })
                }
              >
                <span className="inline-flex items-center gap-2">
                  <CategoryIcon iconName={cat.icon_name} size={16} className="shrink-0 opacity-70" />
                  {cat.name_he}
                </span>
              </OptionRow>
            );
          })}
        </div>
      </Section>

      {/* Subject (within category) */}
      {subjects.length > 0 && (
        <Section title="מקצוע" summary={subjectName} defaultOpen>
          <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pe-1">
            {subjects.map((s) => {
              const selected = draft.subjectIds?.[0] === s.id;
              return (
                <Chip
                  key={s.id}
                  size="sm"
                  selected={selected}
                  onClick={() => update({ subjectIds: selected ? undefined : [s.id] })}
                >
                  {s.name_he}
                </Chip>
              );
            })}
          </div>
        </Section>
      )}

      {/* City */}
      <Section title="עיר" summary={draft.cityId ? cityName : null}>
        {draft.cityId && cityName ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-indigo py-1.5 ps-3.5 pe-1.5 text-sm font-bold text-tint-indigo-fg">
            <MapPin strokeWidth={2} size={15} />
            {cityName}
            <button
              type="button"
              aria-label="הסרת סינון עיר"
              onClick={() => {
                update({ cityId: undefined });
                setCityName(null);
              }}
              className="hit-44 grid h-7 w-7 cursor-pointer place-items-center rounded-full hover:bg-brand-100"
            >
              <X strokeWidth={2} size={15} />
            </button>
          </span>
        ) : (
          <div className="relative">
            <MapPin
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="חיפוש עיר..."
              aria-label="חיפוש עיר"
              className="h-11 w-full rounded-[var(--r-sm)] border border-line bg-canvas ps-9 pe-3 text-sm outline-none placeholder:text-ink-3"
            />
            {cityOptions.length > 0 && (
              <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-[var(--r-sm)] bg-surface py-1 shadow-[var(--shadow-lift)] ring-1 ring-line/60">
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
      </Section>

      {/* Lesson mode */}
      <Section title="אופן הלימוד" summary={modesSummary} defaultOpen>
        <div className="space-y-0.5">
          {(Object.keys(LESSON_MODE_LABELS) as LessonMode[]).map((mode) => {
            const selected = draft.modes?.includes(mode) ?? false;
            return (
              <OptionRow
                key={mode}
                multi
                selected={selected}
                onClick={() => {
                  const current = draft.modes ?? [];
                  const next = selected ? current.filter((m) => m !== mode) : [...current, mode];
                  update({ modes: next.length ? next : undefined });
                }}
              >
                {LESSON_MODE_LABELS[mode]}
              </OptionRow>
            );
          })}
        </div>
      </Section>

      {/* Price */}
      <Section title="מחיר לשעה" summary={priceSummary}>
        <div className="grid grid-cols-3 gap-1.5">
          {PRICE_RANGES.map((range) => {
            const selected = draft.minPrice === range.min && draft.maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  update(
                    selected
                      ? { minPrice: undefined, maxPrice: undefined }
                      : { minPrice: range.min, maxPrice: range.max },
                  )
                }
                className={`min-h-10 cursor-pointer rounded-[var(--r-sm)] px-1 text-[13px] font-bold transition-colors ${
                  selected
                    ? "bg-action text-on-action"
                    : "bg-canvas text-ink-2 ring-1 ring-line/70 hover:text-ink hover:ring-brand-200"
                }`}
              >
                <span className="ltr-isolate tnum">{range.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Rating */}
      <Section title="דירוג" summary={ratingSummary ? `${ratingSummary} כוכבים` : null}>
        <div className="grid grid-cols-2 gap-1.5">
          {RATING_OPTIONS.map((opt) => {
            const selected = draft.minRating === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ minRating: selected ? undefined : opt.value })}
                className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-1 rounded-[var(--r-sm)] text-[13px] font-bold transition-colors ${
                  selected
                    ? "bg-action text-on-action"
                    : "bg-canvas text-ink-2 ring-1 ring-line/70 hover:text-ink hover:ring-brand-200"
                }`}
              >
                <Star size={14} strokeWidth={2} fill="currentColor" className={selected ? "" : "text-star"} aria-hidden="true" />
                <span className="tnum">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {batch && <div className="pt-4">{renderApply?.(previewCount, apply)}</div>}
    </div>
  );
}
