"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, MapPin, Search, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CategoryIcon from "@/components/market/CategoryIcon";
import type { Category } from "@/lib/types";

interface Suggestion {
  kind: "subject" | "category" | "city" | "teacher";
  id: string;
  label: string;
  sublabel?: string;
  iconName?: string | null;
}

const TYPEWRITER_WORDS = [
  "מתמטיקה",
  "אנגלית",
  "גיטרה",
  "פסיכומטרי",
  "תכנות",
  "בישול",
  "פיזיקה",
];

// Typewriter that types a word, holds, deletes, moves on — while `active`.
// Returns "" when paused or when the user prefers reduced motion.
function useTypewriter(words: string[], active: boolean): string {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const w = words[word];
      char += deleting ? -1 : 1;
      setText(w.slice(0, char));
      if (!deleting && char === w.length) {
        deleting = true;
        timer = setTimeout(tick, 2400); // hold the full word longer
      } else if (deleting && char === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        timer = setTimeout(tick, 550); // calm gap before the next word
      } else {
        timer = setTimeout(tick, deleting ? 55 : 110);
      }
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [active, words]);
  return text;
}

interface SearchPillProps {
  categories: Category[];
  /** Compact variant for non-hero placements. */
  compact?: boolean;
  autoFocus?: boolean;
}

// Segmented search pill (Airbnb pattern, RTL): "מה ללמוד?" | "איפה?" with the
// indigo submit orb on the trailing (left) end. Zero-state shows the category
// shortcuts; typing suggests subjects, then teachers by name. City segment
// suggests cities plus "אונליין".
export default function SearchPill({
  categories,
  compact = false,
  autoFocus = false,
}: SearchPillProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const whatRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState<"what" | "where" | null>(null);
  const [what, setWhat] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [where, setWhere] = useState("");
  const [cityId, setCityId] = useState<string | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlighted, setHighlighted] = useState(-1);

  // Live typewriter placeholder — cycles subjects when the field is idle so
  // the search feels alive. Pauses on focus / once the user types.
  // Typewriter runs only while the "what" field is idle and empty.
  const typewriterOn = active !== "what" && what === "";
  const typed = useTypewriter(TYPEWRITER_WORDS, typewriterOn);
  // Never flash the base question mid-cycle — keep the "מורה ל" prefix while
  // the typewriter is running; show the plain prompt only when it's off.
  const whatPlaceholder = typewriterOn ? `מורה ל${typed}‏` : "מה תרצו ללמוד?";

  // Typing invalidates a previously picked suggestion.
  const onWhatChange = (v: string) => {
    setWhat(v);
    setSubjectId(null);
    setCategoryId(null);
  };
  const onWhereChange = (v: string) => {
    setWhere(v);
    setCityId(null);
    setOnlineOnly(false);
  };

  // Debounced suggestion fetching for the focused segment.
  useEffect(() => {
    if (!active) return;
    const q = active === "what" ? what.trim() : where.trim();

    const t = setTimeout(async () => {
      if (active === "what") {
        if (q.length < 1) {
          setSuggestions(
            categories.map((c) => ({
              kind: "category",
              id: c.id,
              label: c.name_he,
              iconName: c.icon_name,
            })),
          );
          return;
        }
        const [subjectsRes, teachersRes] = await Promise.all([
          supabase
            .from("subjects")
            .select("id, name_he, category_id")
            .ilike("name_he", `%${q}%`)
            .limit(6),
          q.length >= 2
            ? supabase.rpc("search_teachers_public", { p_query: q, p_limit: 3 })
            : Promise.resolve({ data: null }),
        ]);

        const subjectItems: Suggestion[] = (subjectsRes.data ?? []).map((s) => ({
          kind: "subject",
          id: s.id,
          label: s.name_he,
          sublabel: categories.find((c) => c.id === s.category_id)?.name_he,
        }));
        const teacherItems: Suggestion[] = (
          (teachersRes.data as { items?: { id: string; display_name: string; subjects: string[] }[] } | null)?.items ?? []
        ).map((tch) => ({
          kind: "teacher",
          id: tch.id,
          label: tch.display_name,
          sublabel: tch.subjects?.slice(0, 2).join(" · "),
        }));
        setSuggestions([...subjectItems, ...teacherItems]);
      } else {
        const online: Suggestion[] = "אונליין".startsWith(q) || q === ""
          ? [{ kind: "city", id: "online", label: "אונליין", sublabel: "שיעורים מרחוק מכל מקום" }]
          : [];
        if (q.length < 1) {
          setSuggestions(online);
          return;
        }
        const { data } = await supabase
          .from("cities")
          .select("id, name_he")
          .ilike("name_he", `${q}%`)
          .order("name_he")
          .limit(7);
        setSuggestions([
          ...online,
          ...(data ?? []).map((c) => ({
            kind: "city" as const,
            id: c.id,
            label: c.name_he,
          })),
        ]);
      }
      setHighlighted(-1);
    }, 200);

    return () => clearTimeout(t);
  }, [active, what, where, categories, supabase]);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setActive(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const submit = useCallback(() => {
    const params = new URLSearchParams();
    if (subjectId) params.set("subject", subjectId);
    else if (categoryId) params.set("category", categoryId);
    else if (what.trim()) params.set("q", what.trim());
    if (cityId) params.set("city", cityId);
    if (onlineOnly) params.set("mode", "online");
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }, [router, subjectId, categoryId, what, cityId, onlineOnly]);

  function pick(s: Suggestion) {
    if (s.kind === "teacher") {
      router.push(`/tutors/${s.id}`);
      return;
    }
    if (s.kind === "subject") {
      setWhat(s.label);
      setSubjectId(s.id);
      setCategoryId(null);
      setActive("where");
      return;
    }
    if (s.kind === "category") {
      setWhat(s.label);
      setCategoryId(s.id);
      setSubjectId(null);
      setActive("where");
      return;
    }
    // city / online
    if (s.id === "online") {
      setWhere("אונליין");
      setOnlineOnly(true);
      setCityId(null);
    } else {
      setWhere(s.label);
      setCityId(s.id);
      setOnlineOnly(false);
    }
    setActive(null);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && suggestions[highlighted]) pick(suggestions[highlighted]);
      else submit();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  const height = compact ? "h-12" : "h-14 sm:h-16";
  const open = active !== null && suggestions.length > 0;

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        role="search"
        className={`flex ${height} w-full items-stretch rounded-full border bg-white transition-shadow ${
          active
            ? "mk-shadow border-[var(--mk-hairline)]"
            : "border-[var(--mk-hairline)] shadow-[var(--mk-shadow-soft)]"
        }`}
      >
        {/* What segment */}
        <label
          className={`flex min-w-0 flex-[1.3] cursor-text items-center gap-2 rounded-full ps-4 pe-2 sm:gap-3 sm:ps-6 sm:pe-4 ${
            active === "what" ? "bg-white" : ""
          }`}
        >
          <GraduationCap size={18} className="shrink-0 text-[var(--mk-ink-3)]" />
          <span className="sr-only">מה תרצו ללמוד?</span>
          <input
            ref={whatRef}
            value={what}
            onChange={(e) => onWhatChange(e.target.value)}
            onFocus={() => setActive("what")}
            onKeyDown={onKeyDown}
            placeholder={whatPlaceholder}
            autoFocus={autoFocus}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--mk-ink)] outline-none placeholder:font-normal placeholder:text-[var(--mk-ink-3)] sm:text-[15px]"
          />
        </label>

        <span className="my-3 w-px shrink-0 bg-[var(--mk-hairline)]" aria-hidden="true" />

        {/* Where segment */}
        <label className="flex min-w-0 flex-1 cursor-text items-center gap-2 ps-3 pe-1 sm:gap-3 sm:ps-5 sm:pe-2">
          <MapPin size={18} className="shrink-0 text-[var(--mk-ink-3)]" />
          <span className="sr-only">איפה? עיר או אונליין</span>
          <input
            value={where}
            onChange={(e) => onWhereChange(e.target.value)}
            onFocus={() => setActive("where")}
            onKeyDown={onKeyDown}
            placeholder="עיר או אונליין"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--mk-ink)] outline-none placeholder:font-normal placeholder:text-[var(--mk-ink-3)] sm:text-[15px]"
          />
        </label>

        {/* Submit orb — trailing end (visual left in RTL) */}
        <div className="flex items-center pe-2 ps-1">
          <button
            type="button"
            onClick={submit}
            aria-label="חיפוש מורים"
            className={`orb-glow grid ${compact ? "h-9 w-9" : "h-10 w-10 sm:h-12 sm:w-12"} shrink-0 cursor-pointer place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700`}
          >
            <Search size={compact ? 16 : 19} />
          </button>
        </div>
      </div>

      {/* Suggestions panel */}
      {open && (
        <div
          role="listbox"
          className="mk-shadow absolute top-full inset-x-0 z-40 mt-2 overflow-hidden rounded-2xl border border-[var(--mk-hairline)] bg-white py-2"
        >
          {active === "what" && what.trim().length < 1 && (
            <p className="px-5 pb-1 pt-2 text-xs font-semibold text-[var(--mk-ink-3)]">
              תחומים פופולריים
            </p>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.kind}-${s.id}`}
              type="button"
              role="option"
              aria-selected={i === highlighted}
              onClick={() => pick(s)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-start ${
                i === highlighted ? "bg-paper-25" : ""
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper-50 text-[var(--mk-ink-2)]">
                {s.kind === "category" ? (
                  <CategoryIcon iconName={s.iconName ?? null} size={17} />
                ) : s.kind === "subject" ? (
                  <GraduationCap size={17} />
                ) : s.kind === "teacher" ? (
                  <User size={17} />
                ) : (
                  <MapPin size={17} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[var(--mk-ink)]">
                  {s.label}
                </span>
                {s.sublabel && (
                  <span className="block truncate text-xs text-[var(--mk-ink-3)]">
                    {s.sublabel}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
