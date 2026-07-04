"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import { createClient } from "@/lib/supabase/client";
import {
  formatDateShort,
  formatPrice,
  formatTime,
  formatWeekday,
  lessonModeLabel,
  lessonModePrice,
} from "@/lib/format";
import type { AvailabilitySlot, LessonMode } from "@/lib/types";

interface WizardTeacher {
  id: string;
  display_name: string;
  avatar_url: string | null;
  hourly_rate: number | null;
  lesson_modes: LessonMode[];
  lesson_mode_prices: Partial<Record<string, number>> | null;
  default_lesson_duration_minutes: number;
}

interface BookingWizardProps {
  teacher: WizardTeacher;
  subjects: { id: string; name_he: string }[];
  slots: AvailabilitySlot[];
  studentId: string;
}

// create_booking's booking_mode enum keys differ from teachers.lesson_modes.
const MODE_TO_BOOKING: Record<LessonMode, string> = {
  online: "online",
  teacher_home: "teacher_location",
  student_home: "student_location",
};

const LEVEL_CATEGORIES = ["יסודי", "חטיבת ביניים", "תיכון", "אקדמיה", "מבוגרים"];
const PROFICIENCIES = ["מתחילים", "בסיס קיים", "מתקדמים"];
const MAX_SLOTS = 3;

const STEPS = ["פרטי השיעור", "מועדים", "אישור"] as const;

interface SubmitOutcome {
  created: number;
  failed: number;
  anyConfirmed: boolean;
}

// Three-step booking flow (matches the app): details (subject + mode + level)
// → pick up to 3 time slots → confirm. Each selected slot becomes its own
// booking via the hardened create_booking RPC (owner-guarded, idempotent).
export default function BookingWizard({
  teacher,
  subjects,
  slots,
  studentId,
}: BookingWizardProps) {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(0);

  const [subjectName, setSubjectName] = useState<string | null>(
    subjects.length === 1 ? subjects[0].name_he : null,
  );
  const [mode, setMode] = useState<LessonMode | null>(
    teacher.lesson_modes.length === 1 ? teacher.lesson_modes[0] : null,
  );
  const [levelCategory, setLevelCategory] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([]);
  const [notes, setNotes] = useState("");
  const [useCredits, setUseCredits] = useState(false);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitOutcome | null>(null);

  useEffect(() => {
    supabase
      .from("student_credits")
      .select("balance")
      .eq("student_id", studentId)
      .maybeSingle()
      .then(({ data }) => setCreditsBalance(Number(data?.balance ?? 0)));
  }, [supabase, studentId]);

  const eligibleSlots = useMemo(
    () =>
      slots.filter(
        (s) =>
          !mode ||
          !s.allowed_modes ||
          s.allowed_modes.length === 0 ||
          s.allowed_modes.includes(mode),
      ),
    [slots, mode],
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const s of eligibleSlots) {
      const day = s.start_at.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()].slice(0, 14);
  }, [eligibleSlots]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const dayKey = selectedDay ?? slotsByDay[0]?.[0] ?? null;

  const selectedIds = useMemo(
    () => new Set(selectedSlots.map((s) => s.id)),
    [selectedSlots],
  );

  function toggleSlot(slot: AvailabilitySlot) {
    setSelectedSlots((prev) => {
      if (prev.some((s) => s.id === slot.id))
        return prev.filter((s) => s.id !== slot.id);
      if (prev.length >= MAX_SLOTS) return prev; // cap at 3
      return [...prev, slot].sort((a, b) => a.start_at.localeCompare(b.start_at));
    });
  }

  function slotDuration(slot: AvailabilitySlot): number {
    return Math.round(
      (new Date(slot.end_at).getTime() - new Date(slot.start_at).getTime()) / 60_000,
    );
  }

  // Full per-lesson price = (base + mode surcharge) prorated by duration.
  function slotPrice(slot: AvailabilitySlot): number {
    const perHour =
      (mode ? lessonModePrice(mode, teacher.hourly_rate, teacher.lesson_mode_prices) : teacher.hourly_rate) ??
      teacher.hourly_rate ??
      0;
    return Math.round(perHour * (slotDuration(slot) / 60));
  }

  const totalPrice = selectedSlots.reduce((sum, s) => sum + slotPrice(s), 0);
  const creditsToApply = useCredits
    ? Math.min(Math.floor(creditsBalance), totalPrice)
    : 0;
  const amountAfterCredits = Math.max(totalPrice - creditsToApply, 0);

  const detailsValid =
    Boolean(subjectName) &&
    Boolean(mode) &&
    (mode !== "student_home" || address.trim().length > 4);
  const canContinue =
    step === 0 ? detailsValid : step === 1 ? selectedSlots.length > 0 : termsAccepted;

  async function submit() {
    if (!subjectName || !mode || selectedSlots.length === 0) return;
    setPending(true);
    setError(null);

    // Credits are applied to the FIRST lesson only, to avoid double-spending
    // across the batch (create_booking checks balance per call).
    let created = 0;
    let failed = 0;
    let anyConfirmed = false;
    let firstError: string | null = null;

    for (let i = 0; i < selectedSlots.length; i++) {
      const slot = selectedSlots[i];
      const { data, error: rpcError } = await supabase.rpc("create_booking", {
        p_idempotency_key: `web_${studentId}_${teacher.id}_${slot.start_at}`,
        p_teacher_id: teacher.id,
        p_student_id: studentId,
        p_subject: subjectName,
        p_mode: MODE_TO_BOOKING[mode],
        p_duration_minutes: slotDuration(slot),
        p_start_at: slot.start_at,
        p_timezone: "Asia/Jerusalem",
        p_notes: notes.trim() || null,
        p_location: mode === "student_home" ? address.trim() : null,
        p_student_level_category: levelCategory,
        p_student_level_proficiency: proficiency,
        p_credits_to_apply: i === 0 ? creditsToApply : 0,
        p_source: "web",
        p_selected_payment_method: i === 0 && creditsToApply > 0 ? "credits" : "card",
      });

      if (rpcError) {
        failed++;
        if (!firstError) {
          firstError = /already booked|23505/i.test(rpcError.message)
            ? "אחד המועדים נתפס הרגע."
            : /Insufficient credits/i.test(rpcError.message)
              ? "יתרת הקרדיטים אינה מספיקה."
              : /pending bookings/i.test(rpcError.message)
                ? "יש לכם כבר בקשות ממתינות. המתינו לאישור המורה."
                : "חלק מהשיעורים לא נקבעו. נסו שוב.";
        }
      } else {
        created++;
        const status = (data as { status?: string } | null)?.status;
        if (status === "confirmed") anyConfirmed = true;
      }
    }

    setPending(false);
    if (created === 0) {
      setError(firstError ?? "לא הצלחנו לקבוע את השיעור. נסו שוב.");
      return;
    }
    setResult({ created, failed, anyConfirmed });
  }

  /* ===== Success screen ===== */
  if (result) {
    return (
      <div className="rounded-3xl border border-[var(--mk-hairline)] bg-white p-8 text-center">
        <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--mk-ink)]">
          {result.created > 1
            ? `${result.created} בקשות שיעור נשלחו`
            : result.anyConfirmed
              ? "השיעור נקבע"
              : "הבקשה נשלחה למורה"}
        </h1>
        <p className="mx-auto mt-3 max-w-[440px] text-sm leading-relaxed text-[var(--mk-ink-2)]">
          {result.anyConfirmed
            ? `${teacher.display_name} אישר את השיעור. הפרטים ממתינים לכם באזור ״השיעורים שלי״.`
            : `${teacher.display_name} קיבל את הבקשה ויאשר אותה בהקדם. נעדכן אתכם ברגע שתהיה תשובה, ואפשר לעקוב באזור ״השיעורים שלי״.`}
          {result.failed > 0 &&
            ` (${result.failed} מהמועדים לא נקבעו — ייתכן שנתפסו בינתיים.)`}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/bookings"
            className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            לשיעורים שלי
          </Link>
          <Link
            href={`/messages/new?teacher=${teacher.id}`}
            className="inline-flex h-12 items-center rounded-full border border-[var(--mk-ink)] px-6 text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
          >
            שליחת הודעה למורה
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/tutors/${teacher.id}`}
          aria-label="חזרה לפרופיל"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--mk-hairline)] text-[var(--mk-ink)] transition-colors hover:border-[var(--mk-ink)]"
        >
          <ChevronRight size={18} />
        </Link>
        <Avatar src={teacher.avatar_url} name={teacher.display_name} size={44} />
        <div>
          <h1 className="font-display text-lg font-bold text-[var(--mk-ink)]">
            קביעת שיעור עם {teacher.display_name}
          </h1>
          <p className="text-sm text-[var(--mk-ink-3)]">
            {STEPS[step]} · שלב {step + 1} מתוך {STEPS.length}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand-600" : "bg-ink-150"}`}
          />
        ))}
      </div>

      <div className="mt-8 min-h-[300px]">
        {/* ===== Step 1: subject + mode + level (merged) ===== */}
        {step === 0 && (
          <div className="space-y-8">
            {subjects.length > 1 && (
              <fieldset>
                <legend className="text-base font-semibold text-[var(--mk-ink)]">
                  באיזה מקצוע תרצו שיעור?
                </legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <Chip
                      key={s.id}
                      selected={subjectName === s.name_he}
                      onClick={() => setSubjectName(s.name_he)}
                    >
                      {s.name_he}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="text-base font-semibold text-[var(--mk-ink)]">
                איך תרצו ללמוד?
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.lesson_modes.map((m) => {
                  const price = lessonModePrice(
                    m,
                    teacher.hourly_rate,
                    teacher.lesson_mode_prices,
                  );
                  return (
                    <Chip key={m} selected={mode === m} onClick={() => setMode(m)}>
                      {lessonModeLabel(m)}
                      {price != null && (
                        <span className="ltr-isolate tnum text-[var(--mk-ink-3)]">
                          · {formatPrice(price)}
                        </span>
                      )}
                    </Chip>
                  );
                })}
              </div>
            </fieldset>

            {mode === "student_home" && (
              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
                  כתובת לשיעור
                </label>
                <input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="רחוב, מספר בית ועיר"
                  className={inputClass}
                />
              </div>
            )}

            <fieldset>
              <legend className="text-base font-semibold text-[var(--mk-ink)]">
                למי השיעור?{" "}
                <span className="text-sm font-normal text-[var(--mk-ink-3)]">(לא חובה)</span>
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {LEVEL_CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    size="sm"
                    selected={levelCategory === c}
                    onClick={() => setLevelCategory(levelCategory === c ? null : c)}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROFICIENCIES.map((p) => (
                  <Chip
                    key={p}
                    size="sm"
                    selected={proficiency === p}
                    onClick={() => setProficiency(proficiency === p ? null : p)}
                  >
                    {p}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* ===== Step 2: slots (up to 3) ===== */}
        {step === 1 && (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold text-[var(--mk-ink)]">
                מתי נוח לכם?
              </h2>
              <span className="text-[13px] text-[var(--mk-ink-3)]">
                אפשר לבחור עד {MAX_SLOTS} שיעורים
              </span>
            </div>

            {slotsByDay.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-[var(--mk-band)] p-6 text-center text-sm leading-relaxed text-[var(--mk-ink-2)]">
                למורה אין כרגע מועדים פתוחים ביומן.
                <br />
                שלחו הודעה ותתאמו מועד ישירות.
                <div className="mt-4">
                  <Link
                    href={`/messages/new?teacher=${teacher.id}`}
                    className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white"
                  >
                    שליחת הודעה למורה
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  {slotsByDay.map(([day, daySlots]) => {
                    const selected = day === dayKey;
                    const picksHere = daySlots.filter((s) => selectedIds.has(s.id)).length;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`relative shrink-0 cursor-pointer rounded-2xl border px-4 py-2.5 text-center transition-colors ${
                          selected
                            ? "border-[var(--mk-ink)] bg-[var(--mk-ink)] text-white"
                            : "border-[var(--mk-hairline)] bg-white text-[var(--mk-ink)] hover:border-[var(--mk-ink)]"
                        }`}
                      >
                        <span className="block text-[13px] font-semibold">
                          {formatWeekday(daySlots[0].start_at)}
                        </span>
                        <span className={`block text-xs ${selected ? "text-white/80" : "text-[var(--mk-ink-3)]"}`}>
                          {formatDateShort(daySlots[0].start_at)}
                        </span>
                        {picksHere > 0 && (
                          <span className="absolute -top-1.5 -end-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                            {picksHere}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {(slotsByDay.find(([d]) => d === dayKey)?.[1] ?? []).map((s) => {
                    const selected = selectedIds.has(s.id);
                    const atCap = selectedSlots.length >= MAX_SLOTS && !selected;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSlot(s)}
                        disabled={atCap}
                        className={`tnum cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : atCap
                              ? "cursor-not-allowed border-[var(--mk-hairline)] bg-paper-25 text-[var(--mk-ink-3)] opacity-50"
                              : "border-[var(--mk-hairline)] bg-white text-[var(--mk-ink)] hover:border-[var(--mk-ink)]"
                        }`}
                      >
                        {formatTime(s.start_at)}–{formatTime(s.end_at)}
                      </button>
                    );
                  })}
                </div>

                {selectedSlots.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedSlots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSlot(s)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 ps-3 pe-2 text-[13px] font-medium text-brand-800"
                      >
                        {formatWeekday(s.start_at)} {formatDateShort(s.start_at)} ·{" "}
                        {formatTime(s.start_at)}
                        <span aria-hidden="true" className="text-brand-600">✕</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== Step 3: summary ===== */}
        {step === 2 && selectedSlots.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--mk-hairline)] bg-white p-5">
              <h2 className="text-base font-semibold text-[var(--mk-ink)]">סיכום</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--mk-ink-3)]">מקצוע</dt>
                  <dd className="text-end font-medium text-[var(--mk-ink)]">{subjectName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--mk-ink-3)]">אופן הלימוד</dt>
                  <dd className="text-end font-medium text-[var(--mk-ink)]">
                    {mode ? lessonModeLabel(mode) : ""}
                  </dd>
                </div>
                {mode === "student_home" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--mk-ink-3)]">כתובת</dt>
                    <dd className="text-end font-medium text-[var(--mk-ink)]">{address}</dd>
                  </div>
                )}

                <div className="mk-hairline-t pt-2.5">
                  <dt className="mb-2 text-[var(--mk-ink-3)]">
                    {selectedSlots.length > 1
                      ? `${selectedSlots.length} שיעורים`
                      : "מועד"}
                  </dt>
                  {selectedSlots.map((s) => (
                    <div key={s.id} className="flex justify-between gap-4 py-0.5">
                      <span className="text-[var(--mk-ink)]">
                        {formatWeekday(s.start_at)}, {formatDateShort(s.start_at)} ·{" "}
                        <span className="tnum">
                          {formatTime(s.start_at)}–{formatTime(s.end_at)}
                        </span>
                      </span>
                      <span className="ltr-isolate tnum font-medium text-[var(--mk-ink)]">
                        {formatPrice(slotPrice(s))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mk-hairline-t flex justify-between gap-4 pt-2.5">
                  <dt className="text-[var(--mk-ink-3)]">סה״כ</dt>
                  <dd className="ltr-isolate tnum font-semibold text-[var(--mk-ink)]">
                    {formatPrice(totalPrice)}
                  </dd>
                </div>
                {creditsToApply > 0 && (
                  <>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--mk-ink-3)]">קרדיטים</dt>
                      <dd className="ltr-isolate tnum font-medium text-emerald-600">
                        -{formatPrice(creditsToApply)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--mk-ink-3)]">לתשלום</dt>
                      <dd className="ltr-isolate tnum font-semibold text-[var(--mk-ink)]">
                        {formatPrice(amountAfterCredits)}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {creditsBalance > 0 && (
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--mk-hairline)] bg-white p-4 text-sm">
                <input
                  type="checkbox"
                  checked={useCredits}
                  onChange={(e) => setUseCredits(e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-[var(--mk-ink)]">
                  שימוש ביתרת הקרדיטים שלי{" "}
                  <span className="ltr-isolate tnum font-medium">
                    ({formatPrice(creditsBalance)})
                  </span>
                </span>
              </label>
            )}

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
                הערה למורה <span className="font-normal text-[var(--mk-ink-3)]">(לא חובה)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="ספרו למורה על מה תרצו לעבוד"
                className="w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--mk-ink-2)]">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                קראתי ואני מסכימ/ה{" "}
                <Link href="/terms" target="_blank" className="underline hover:text-[var(--mk-ink)]">
                  לתנאי השימוש
                </Link>{" "}
                ולמדיניות הביטולים של SkillUp.
              </span>
            </label>

            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--mk-ink-3)]">
              <Clock size={14} className="mt-0.5 shrink-0" />
              הבקשה נשלחת למורה לאישור. שיעור ראשון אצל מורה חדש מאושר בדרך
              כלל תוך 24 שעות.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {/* Footer nav */}
      <div className="mk-hairline-t mt-8 flex items-center justify-between pt-5">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="cursor-pointer text-sm font-medium text-[var(--mk-ink-2)] underline hover:text-[var(--mk-ink)] disabled:invisible"
        >
          חזרה
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => canContinue && setStep((s) => s + 1)}
            disabled={!canContinue}
            className="h-12 cursor-pointer rounded-full bg-brand-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            המשך
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canContinue || pending}
            className="h-12 cursor-pointer rounded-full bg-brand-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            {pending
              ? "שולחים בקשה..."
              : selectedSlots.length > 1
                ? `אישור ${selectedSlots.length} שיעורים`
                : "אישור וקביעת שיעור"}
          </button>
        )}
      </div>
    </div>
  );
}
