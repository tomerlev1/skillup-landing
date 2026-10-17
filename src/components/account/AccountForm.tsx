"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, CheckCircle2, GraduationCap, Link2, MapPin, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

type Value = string | number | boolean | null | string[];

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "tel" | "number" | "textarea" | "url";
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}

// One form, two roles — the field list is data, not duplicated JSX.
// Every write is RLS-scoped to the user's own row (auth.uid() = id).
const STUDENT_FIELDS: FieldDef[] = [
  { key: "first_name", label: "שם פרטי", type: "text" },
  { key: "last_name", label: "שם משפחה", type: "text" },
  { key: "phone", label: "טלפון", type: "tel", hint: "לא מוצג בפומבי" },
  { key: "bio", label: "קצת עליי", type: "textarea", wide: true, placeholder: "מה אתם לומדים? מה המטרה שלכם?" },
];

const TEACHER_FIELDS: FieldDef[] = [
  { key: "display_name", label: "שם תצוגה", type: "text", hint: "כך תופיעו מול תלמידים" },
  { key: "phone_number", label: "טלפון", type: "tel", hint: "לא מוצג בפומבי" },
  { key: "hourly_rate", label: "מחיר לשעה (₪)", type: "number" },
  { key: "experience_years", label: "שנות ניסיון", type: "number" },
  { key: "bio", label: "על עצמי", type: "textarea", wide: true, placeholder: "ספרו לתלמידים מי אתם, מה אתם מלמדים ואיך נראה שיעור אצלכם" },
];

const TEACHER_LINKS: FieldDef[] = [
  { key: "instagram_url", label: "אינסטגרם", type: "url", placeholder: "https://instagram.com/…" },
  { key: "facebook_url", label: "פייסבוק", type: "url", placeholder: "https://facebook.com/…" },
  { key: "website_url", label: "אתר אישי", type: "url", placeholder: "https://…" },
];

const LEVEL_CATEGORIES = ["יסודי", "חטיבת ביניים", "תיכון", "אקדמיה", "מבוגרים"];
const PROFICIENCIES = ["מתחילים", "בסיס קיים", "מתקדמים"];

// display_name + bio + hourly_rate + city — the minimum for a searchable
// teacher profile. Completion only upgrades; it never hides an existing one.
const TEACHER_REQUIRED = ["display_name", "bio", "hourly_rate"] as const;

interface AccountFormProps {
  role: UserRole;
  userId: string;
  initial: Record<string, Value>;
  initialCityName: string | null;
  /** Category names offered as learning interests (students). */
  interestOptions?: string[];
}

function Card({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-line/60 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[var(--r-sm)] bg-tint-indigo text-tint-indigo-fg">
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-ink-3">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`hit-44 inline-flex min-h-10 cursor-pointer items-center rounded-pill px-4 text-sm font-semibold transition-colors ${
        selected
          ? "bg-action text-on-action shadow-[0_6px_14px_-8px_rgba(79,70,229,0.8)]"
          : "bg-canvas text-ink-2 ring-1 ring-line hover:text-ink hover:ring-brand-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function AccountForm({
  role,
  userId,
  initial,
  initialCityName,
  interestOptions = [],
}: AccountFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const isTeacher = role === "teacher";
  const fields = isTeacher ? TEACHER_FIELDS : STUDENT_FIELDS;

  const [values, setValues] = useState<Record<string, Value>>(initial);
  const [cityId, setCityId] = useState<string | null>((initial.city_id as string) ?? null);
  const [cityName, setCityName] = useState(initialCityName);
  const [cityQuery, setCityQuery] = useState("");
  const [cityOptions, setCityOptions] = useState<{ id: string; name_he: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interests = (values.subjects_interests as string[] | null) ?? [];

  // City autosuggest (shared UX with the search filters).
  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 1) return setCityOptions([]);
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

  function set(key: string, value: Value) {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    // Only the whitelisted fields ever reach the update payload.
    const payload: Record<string, Value> = { city_id: cityId };
    for (const f of isTeacher ? [...fields, ...TEACHER_LINKS] : fields) {
      const raw = values[f.key];
      payload[f.key] =
        f.type === "number"
          ? raw === "" || raw == null
            ? null
            : Math.max(0, Number(raw))
          : typeof raw === "string"
            ? raw.trim() || null
            : (raw ?? null);
    }
    if (isTeacher) {
      const complete = TEACHER_REQUIRED.every((k) => payload[k]) && Boolean(cityId);
      payload.profile_completed = Boolean(initial.profile_completed) || complete;
    } else {
      payload.level_category = (values.level_category as string) || null;
      payload.level_proficiency = (values.level_proficiency as string) || null;
      payload.subjects_interests = interests.length ? interests : null;
    }

    const { error: updateError } = await supabase
      .from(isTeacher ? "teachers" : "students")
      .update(payload)
      .eq("id", userId);

    setPending(false);
    if (updateError) {
      setError("השמירה נכשלה. בדקו את הפרטים ונסו שוב.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const inputClass =
    "h-12 w-full rounded-[var(--r-sm)] border border-line bg-canvas px-4 text-[15px] outline-none focus:bg-surface";

  function renderField(f: FieldDef) {
    return (
      <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
        <label htmlFor={f.key} className="mb-1.5 block text-sm font-bold text-ink">
          {f.label}
        </label>
        {f.type === "textarea" ? (
          <>
            <textarea
              id={f.key}
              rows={4}
              maxLength={1200}
              placeholder={f.placeholder}
              value={(values[f.key] as string) ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full rounded-[var(--r-sm)] border border-line bg-canvas px-4 py-3 text-[15px] leading-relaxed outline-none focus:bg-surface"
            />
            <p className="mt-1 text-end text-[13px] text-ink-3">
              <span className="tnum">{((values[f.key] as string) ?? "").length}</span>/1200
            </p>
          </>
        ) : (
          <input
            id={f.key}
            type={f.type}
            dir={f.type === "text" ? undefined : "ltr"}
            min={f.type === "number" ? 0 : undefined}
            placeholder={f.placeholder}
            value={(values[f.key] as string | number) ?? ""}
            onChange={(e) => set(f.key, e.target.value)}
            className={`${inputClass} ${f.type === "text" ? "" : "text-start"}`}
          />
        )}
        {f.hint && <p className="mt-1 text-[13px] text-ink-3">{f.hint}</p>}
      </div>
    );
  }

  return (
    <div>
      {searchParams.get("welcome") && isTeacher && (
        <div className="mb-6 rounded-[var(--r-md)] bg-brand-50 px-5 py-4 text-sm leading-relaxed text-ink ring-1 ring-brand-100">
          ברוכים הבאים ל-SkillUp. השלימו את הפרטים כאן, והפרופיל שלכם יופיע מול תלמידים באתר
          ובאפליקציה.
        </div>
      )}

      {isTeacher && !initial.profile_completed && (
        <p className="mb-6 flex items-start gap-2 rounded-[var(--r-md)] bg-warn/10 px-4 py-3 text-sm leading-relaxed text-warn-text">
          <BadgeCheck strokeWidth={2} size={16} className="mt-0.5 shrink-0" />
          הפרופיל עדיין לא מוצג בחיפוש. מילוי שם תצוגה, תיאור, מחיר ועיר יפרסם אותו אוטומטית.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <Card icon={UserRound} title="פרטים אישיים" subtitle={isTeacher ? "מה שתלמידים יראו בפרופיל" : "רק המורים שלכם רואים את השם"}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{fields.map(renderField)}</div>
        </Card>

        {!isTeacher && (
          <Card icon={GraduationCap} title="הלמידה שלי" subtitle="עוזר למורים להתאים את השיעור אליכם">
            <p className="mb-2.5 text-sm font-bold text-ink">שלב לימודים</p>
            <div className="flex flex-wrap gap-2">
              {LEVEL_CATEGORIES.map((c) => (
                <Pill
                  key={c}
                  selected={values.level_category === c}
                  onClick={() => set("level_category", values.level_category === c ? null : c)}
                >
                  {c}
                </Pill>
              ))}
            </div>
            <p className="mb-2.5 mt-5 text-sm font-bold text-ink">רמה</p>
            <div className="flex flex-wrap gap-2">
              {PROFICIENCIES.map((p) => (
                <Pill
                  key={p}
                  selected={values.level_proficiency === p}
                  onClick={() => set("level_proficiency", values.level_proficiency === p ? null : p)}
                >
                  {p}
                </Pill>
              ))}
            </div>
            {interestOptions.length > 0 && (
              <>
                <p className="mb-2.5 mt-5 text-sm font-bold text-ink">
                  תחומים שמעניינים אותי <span className="font-normal text-ink-3">(אפשר לבחור כמה)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((name) => {
                    const on = interests.includes(name);
                    return (
                      <Pill
                        key={name}
                        selected={on}
                        onClick={() =>
                          set(
                            "subjects_interests",
                            on ? interests.filter((x) => x !== name) : [...interests, name],
                          )
                        }
                      >
                        {name}
                      </Pill>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        )}

        <Card icon={MapPin} title="עיר" subtitle={isTeacher ? "תלמידים באזור ימצאו אתכם" : "כדי להציע לכם מורים קרובים"}>
          {cityId && cityName ? (
            <span className="inline-flex items-center gap-2 rounded-pill bg-tint-indigo py-2 ps-4 pe-2 text-[15px] font-bold text-tint-indigo-fg">
              <MapPin strokeWidth={2} size={16} />
              {cityName}
              <button
                type="button"
                aria-label="הסרת עיר"
                onClick={() => {
                  setCityId(null);
                  setCityName(null);
                  setSaved(false);
                }}
                className="hit-44 grid h-7 w-7 cursor-pointer place-items-center rounded-pill hover:bg-brand-100"
              >
                <X strokeWidth={2} size={16} />
              </button>
            </span>
          ) : (
            <div className="relative">
              <input
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="חיפוש עיר..."
                aria-label="חיפוש עיר"
                className={inputClass}
              />
              {cityOptions.length > 0 && (
                <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-[var(--r-sm)] bg-surface py-1 shadow-[var(--shadow-lift)] ring-1 ring-line/60">
                  {cityOptions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCityId(c.id);
                        setCityName(c.name_he);
                        setCityQuery("");
                        setCityOptions([]);
                        setSaved(false);
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
        </Card>

        {isTeacher && (
          <Card icon={Link2} title="קישורים" subtitle="מוצגים בפרופיל הציבורי שלכם">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">{TEACHER_LINKS.map(renderField)}</div>
          </Card>
        )}

        {/* Sticky save bar */}
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-lg)] bg-surface/90 p-3 ps-5 shadow-[var(--shadow-lift)] ring-1 ring-line/60 backdrop-blur">
          <div className="min-h-6 text-sm" aria-live="polite">
            {error ? (
              <span role="alert" className="text-danger-text">
                {error}
              </span>
            ) : saved ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-ok-text">
                <CheckCircle2 strokeWidth={2} size={16} />
                הפרטים נשמרו
              </span>
            ) : (
              <span className="text-ink-3">השינויים נשמרים רק אחרי לחיצה על שמירה</span>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 cursor-pointer rounded-pill bg-action px-8 text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-colors hover:bg-action-hover disabled:opacity-60"
          >
            {pending ? "שומרים..." : "שמירת הפרטים"}
          </button>
        </div>
      </form>
    </div>
  );
}
