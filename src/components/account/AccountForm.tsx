"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, CalendarClock, CheckCircle2, ChevronLeft, MapPin, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_STORE_URL } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

type Value = string | number | boolean | null;

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "tel" | "number" | "textarea" | "url";
  placeholder?: string;
  hint?: string;
}

// One form, two roles — the field list is data, not duplicated JSX.
// Every write is RLS-scoped to the user's own row (auth.uid() = id).
const STUDENT_FIELDS: FieldDef[] = [
  { key: "first_name", label: "שם פרטי", type: "text" },
  { key: "last_name", label: "שם משפחה", type: "text" },
  { key: "phone", label: "טלפון", type: "tel" },
  { key: "bio", label: "קצת עליי", type: "textarea", placeholder: "מה אתם לומדים? מה המטרה שלכם?" },
];

const TEACHER_FIELDS: FieldDef[] = [
  { key: "display_name", label: "שם תצוגה", type: "text", hint: "כך תופיעו מול תלמידים" },
  { key: "phone_number", label: "טלפון", type: "tel" },
  { key: "hourly_rate", label: "מחיר לשעה (₪)", type: "number" },
  { key: "experience_years", label: "שנות ניסיון", type: "number" },
  { key: "bio", label: "על עצמי", type: "textarea", placeholder: "ספרו לתלמידים מי אתם, מה אתם מלמדים ואיך נראה שיעור אצלכם" },
  { key: "instagram_url", label: "אינסטגרם (קישור)", type: "url" },
  { key: "facebook_url", label: "פייסבוק (קישור)", type: "url" },
  { key: "website_url", label: "אתר אישי (קישור)", type: "url" },
];

// display_name + bio + hourly_rate + city — the minimum for a searchable
// teacher profile. Completion only upgrades; it never hides an existing one.
const TEACHER_REQUIRED = ["display_name", "bio", "hourly_rate"] as const;

interface AccountFormProps {
  role: UserRole;
  userId: string;
  initial: Record<string, Value>;
  initialCityName: string | null;
}

export default function AccountForm({
  role,
  userId,
  initial,
  initialCityName,
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    // Only the whitelisted fields ever reach the update payload.
    const payload: Record<string, Value> = { city_id: cityId };
    for (const f of fields) {
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
      const complete =
        TEACHER_REQUIRED.every((k) => payload[k]) && Boolean(cityId);
      payload.profile_completed = Boolean(initial.profile_completed) || complete;
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
    "h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]";

  return (
    <div>
      {searchParams.get("welcome") && isTeacher && (
        <div className="mb-6 rounded-2xl bg-brand-50 px-5 py-4 text-sm leading-relaxed text-brand-800">
          ברוכים הבאים ל-SkillUp! השלימו את הפרטים כאן, והפרופיל שלכם יופיע מול
          תלמידים באתר ובאפליקציה.
        </div>
      )}

      <h1 className="font-display text-2xl font-bold text-[var(--mk-ink)]">
        הפרופיל שלי
      </h1>
      <p className="mt-1.5 text-sm text-[var(--mk-ink-2)]">
        {initial.email as string} ·{" "}
        {isTeacher ? "חשבון מורה" : "חשבון תלמיד/ה"}
      </p>

      {isTeacher && !initial.profile_completed && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-700">
          <BadgeCheck size={15} className="mt-0.5 shrink-0" />
          הפרופיל עדיין לא מוצג בחיפוש. מילוי שם תצוגה, תיאור, מחיר ועיר יפרסם
          אותו אוטומטית.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <label htmlFor={f.key} className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.key}
                  rows={4}
                  maxLength={1200}
                  placeholder={f.placeholder}
                  value={(values[f.key] as string) ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
                />
              ) : (
                <input
                  id={f.key}
                  type={f.type}
                  dir={f.type === "text" ? undefined : "ltr"}
                  min={f.type === "number" ? 0 : undefined}
                  placeholder={f.placeholder}
                  value={(values[f.key] as string | number) ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={`${inputClass} ${f.type === "text" ? "" : "text-start"}`}
                />
              )}
              {f.hint && <p className="mt-1 text-xs text-[var(--mk-ink-3)]">{f.hint}</p>}
            </div>
          ))}

          {/* City */}
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">עיר</span>
            {cityId && cityName ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--mk-ink)] py-2 ps-4 pe-2 text-sm font-medium text-white">
                <MapPin size={14} />
                {cityName}
                <button
                  type="button"
                  aria-label="הסרת עיר"
                  onClick={() => {
                    setCityId(null);
                    setCityName(null);
                  }}
                  className="grid h-6 w-6 cursor-pointer place-items-center rounded-full hover:bg-white/20"
                >
                  <X size={13} />
                </button>
              </span>
            ) : (
              <div className="relative">
                <input
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="חיפוש עיר..."
                  className={inputClass}
                />
                {cityOptions.length > 0 && (
                  <div className="mk-shadow absolute top-full inset-x-0 z-30 mt-1 overflow-hidden rounded-xl border border-[var(--mk-hairline)] bg-white py-1">
                    {cityOptions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCityId(c.id);
                          setCityName(c.name_he);
                          setCityQuery("");
                          setCityOptions([]);
                        }}
                        className="block w-full cursor-pointer px-4 py-2.5 text-start text-sm hover:bg-paper-25"
                      >
                        {c.name_he}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        {saved && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            הפרטים נשמרו.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full cursor-pointer rounded-full bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {pending ? "שומרים..." : "שמירת הפרטים"}
        </button>
      </form>

      {isTeacher && (
        <>
          <Link
            href="/account/schedule"
            className="mt-8 flex items-center gap-3.5 rounded-2xl border border-[var(--mk-hairline)] bg-white p-4 transition-colors hover:border-[var(--mk-ink)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <CalendarClock size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--mk-ink)]">
                ניהול הזמינות שלי
              </span>
              <span className="block text-[13px] text-[var(--mk-ink-3)]">
                הוספה והסרה של חלונות לשיעורים. מסתנכרן מיד עם האפליקציה.
              </span>
            </span>
            <ChevronLeft size={18} className="shrink-0 text-[var(--mk-ink-3)]" />
          </Link>

          <p className="mt-4 rounded-2xl bg-[var(--mk-band)] px-5 py-4 text-[13px] leading-relaxed text-[var(--mk-ink-2)]">
            תמונות פרופיל ומקצועות לימוד מנהלים כרגע דרך{" "}
            <a href={APP_STORE_URL} className="font-semibold text-brand-700 hover:underline">
              אפליקציית SkillUp
            </a>
            . אותו חשבון, אותו פרופיל.
          </p>
        </>
      )}
    </div>
  );
}
