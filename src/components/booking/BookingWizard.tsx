"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, TriangleAlert, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import BookingSuccess, { type BookingOutcome } from "@/components/booking/BookingSuccess";
import { createClient } from "@/lib/supabase/client";
import {
  availabilityTime,
  jerusalemDateShort,
  jerusalemDayKey,
  jerusalemWeekday,
} from "@/lib/availability-label";
import { resolvePreselectedSlot, slotFitsMode, submitLabel } from "@/lib/booking";
import { formatPrice, lessonModeLabel, lessonModePrice } from "@/lib/format";
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
  /** `?slot=` from the profile's availability pills. */
  preselectedSlotId?: string;
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
const MAX_DAYS = 14;

const STEPS = ["מועד", "פרטים", "סיכום"] as const;

/** "יום רביעי 17:00": a slot as the user sees it, Jerusalem time. */
function slotWhen(slot: AvailabilitySlot): string {
  return `${jerusalemWeekday(slot.start_at)} ${availabilityTime(slot.start_at)}`;
}

function slotDuration(slot: AvailabilitySlot): number {
  return Math.round(
    (new Date(slot.end_at).getTime() - new Date(slot.start_at).getTime()) / 60_000,
  );
}

// Toggle pill for subject / mode / level choices. Selected = ink, never
// indigo: the one indigo action on the screen is the footer button.
function Option({
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
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--r-pill)] border px-4 text-sm font-medium transition-colors duration-200 ease-[var(--ease)] ${
        selected
          ? "border-ink bg-ink text-canvas"
          : "border-line bg-surface text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

// Time-first booking flow (spec §8.6): pick up to 3 times → lesson details →
// summary. Each selected slot becomes its own booking via the hardened
// create_booking RPC (owner-guarded, idempotent).
export default function BookingWizard({
  teacher,
  subjects,
  slots,
  studentId,
  preselectedSlotId,
}: BookingWizardProps) {
  const supabase = useMemo(() => createClient(), []);
  const name = teacher.display_name;

  // Resolved once on mount: the notice should not flip while the user works.
  const [preselect] = useState(() => resolvePreselectedSlot(slots, preselectedSlotId));

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
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>(
    preselect.slot ? [preselect.slot] : [],
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(
    preselect.slot ? jerusalemDayKey(preselect.slot.start_at) : null,
  );
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingOutcome | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedSlots.map((s) => s.id)),
    [selectedSlots],
  );

  // allowed_modes filter: once a mode is known, times that don't support it
  // are hidden (already-picked ones stay visible so they can be removed).
  const slotsByDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const s of slots) {
      if (!slotFitsMode(s, mode) && !selectedIds.has(s.id)) continue;
      const day = jerusalemDayKey(s.start_at);
      const list = map.get(day);
      if (list) list.push(s);
      else map.set(day, [s]);
    }
    return [...map.entries()].slice(0, MAX_DAYS);
  }, [slots, mode, selectedIds]);

  const dayKey =
    selectedDay && slotsByDay.some(([d]) => d === selectedDay)
      ? selectedDay
      : (slotsByDay[0]?.[0] ?? null);

  const misfits = selectedSlots.filter((s) => !slotFitsMode(s, mode));

  function toggleSlot(slot: AvailabilitySlot) {
    setSelectedSlots((prev) => {
      if (prev.some((s) => s.id === slot.id)) return prev.filter((s) => s.id !== slot.id);
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, slot].sort((a, b) => a.start_at.localeCompare(b.start_at));
    });
  }

  // Full per-lesson price = (base + mode surcharge) prorated by duration.
  // No hourly rate on the profile → no price at all (never a fake ₪0).
  const hasPrice = teacher.hourly_rate != null;
  function slotPrice(slot: AvailabilitySlot): number {
    const perHour =
      (mode
        ? lessonModePrice(mode, teacher.hourly_rate, teacher.lesson_mode_prices)
        : teacher.hourly_rate) ??
      teacher.hourly_rate ??
      0;
    return Math.round(perHour * (slotDuration(slot) / 60));
  }

  const totalPrice = selectedSlots.reduce((sum, s) => sum + slotPrice(s), 0);

  const detailsValid =
    Boolean(subjectName) &&
    Boolean(mode) &&
    (mode !== "student_home" || address.trim().length > 4) &&
    misfits.length === 0;
  const canContinue =
    step === 0
      ? selectedSlots.length > 0 && misfits.length === 0
      : detailsValid && selectedSlots.length > 0;

  async function submit() {
    if (!subjectName || !mode || selectedSlots.length === 0) return;
    setPending(true);
    setError(null);

    const createdSlots: AvailabilitySlot[] = [];
    const confirmedSlotIds: string[] = [];
    let failed = 0;
    let anyConfirmed = false;
    let firstError: string | null = null;

    for (const slot of selectedSlots) {
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
        // SkillUp never charges students: no credits on the web.
        p_credits_to_apply: 0,
        p_source: "web",
        p_selected_payment_method: "card",
      });

      if (rpcError) {
        failed++;
        if (!firstError) {
          firstError = /already booked|23505/i.test(rpcError.message)
            ? "אחד המועדים נתפס הרגע."
            : /pending bookings/i.test(rpcError.message)
              ? "יש לכם כבר בקשות ממתינות. המתינו לאישור המורה."
              : "חלק מהבקשות לא נשלחו. נסו שוב.";
        }
      } else {
        createdSlots.push(slot);
        const status = (data as { status?: string } | null)?.status;
        if (status === "confirmed") {
          anyConfirmed = true;
          confirmedSlotIds.push(slot.id);
        }
      }
    }

    setPending(false);
    if (createdSlots.length === 0) {
      setError(firstError ?? "לא הצלחנו לשלוח את הבקשה. נסו שוב.");
      return;
    }
    setResult({ createdSlots, failed, anyConfirmed, confirmedSlotIds });
  }

  if (result) {
    return (
      <BookingSuccess
        teacher={{ id: teacher.id, display_name: name, avatar_url: teacher.avatar_url }}
        subjectName={subjectName ?? ""}
        outcome={result}
      />
    );
  }

  // Empty state follows what can actually be booked: no day groups left once
  // the selected/fixed mode filter is applied (not just an empty calendar).
  const noSlots = slotsByDay.length === 0;
  // Open slots exist, but none fit the chosen/fixed mode → say so, instead of
  // claiming the calendar is full.
  const noSlotsForMode = noSlots && slots.length > 0 && mode !== null;
  const fixedMode = teacher.lesson_modes.length === 1;
  const inputClass =
    "min-h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-[15px] text-ink outline-none transition-colors focus:border-ink";
  const secondaryBtn =
    "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--r-pill)] border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-ink";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/tutors/${teacher.id}`}
          aria-label="חזרה לפרופיל"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <ChevronRight strokeWidth={1.75} size={20} aria-hidden="true" />
        </Link>
        <Avatar src={teacher.avatar_url} name={name} size={44} />
        <div>
          <h1 className="text-lg font-bold text-ink">קביעת שיעור עם {name}</h1>
          <p className="text-sm text-ink-3">
            {STEPS[step]} · שלב <span className="tnum">{step + 1}</span> מתוך{" "}
            <span className="tnum">{STEPS.length}</span>
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="שלבי קביעת השיעור">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span
              aria-hidden="true"
              className={`block h-1 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`}
            />
            <span className={`mt-1.5 block text-sm ${i === step ? "font-semibold text-ink" : "text-ink-3"}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 min-h-[300px]">
        {/* ===== Step 1: time ===== */}
        {step === 0 && (
          <div>
            {preselect.stale && (
              <p
                role="status"
                className="mb-5 flex items-start gap-2 rounded-[var(--r-sm)] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink"
              >
                <TriangleAlert strokeWidth={1.75} size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                המועד שבחרתם כבר לא פנוי, בחרו מועד אחר
              </p>
            )}

            {misfits.length > 0 && mode && (
              <div
                role="alert"
                className="mb-5 rounded-[var(--r-sm)] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink"
              >
                <ul className="space-y-1">
                  {misfits.map((s) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <TriangleAlert strokeWidth={1.75} size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                      <span>
                        המועד <span className="tnum">{slotWhen(s)}</span> לא זמין לשיעור {lessonModeLabel(mode)}.
                        הסירו אותו ובחרו מועד אחר.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="text-base font-semibold text-ink">מתי נוח לכם?</h2>

            {noSlots ? (
              <div className="mt-5 rounded-[var(--r-md)] border border-line bg-surface p-6 text-center text-sm leading-relaxed text-ink-2">
                {noSlotsForMode && mode
                  ? `אין כרגע מועדים פנויים לשיעור ${lessonModeLabel(mode)}.`
                  : `היומן של ${name} מלא כרגע. שלחו הודעה ותתאמו מועד ישירות.`}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {mode && !fixedMode && (
                    <button type="button" onClick={() => setMode(null)} className={secondaryBtn}>
                      הצגת כל המועדים
                    </button>
                  )}
                  <Link
                    href={`/messages/new?teacher=${teacher.id}`}
                    className="inline-flex min-h-11 items-center rounded-[var(--r-pill)] bg-action px-5 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
                  >
                    שליחת הודעה ל{name}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-3">
                  אפשר לבחור עד 3 מועדים, כל אחד נשלח כבקשה נפרדת
                </p>

                <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pt-2 pb-1 sm:mx-0 sm:px-0">
                  {slotsByDay.map(([day, daySlots]) => {
                    const active = day === dayKey;
                    const picksHere = daySlots.filter((s) => selectedIds.has(s.id)).length;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        aria-pressed={active}
                        className={`relative min-h-11 shrink-0 cursor-pointer rounded-[var(--r-sm)] border px-4 py-2 text-center transition-colors ${
                          active
                            ? "border-ink bg-ink text-canvas"
                            : "border-line bg-surface text-ink hover:border-ink"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {jerusalemWeekday(daySlots[0].start_at)}
                        </span>
                        <span className={`block text-sm ${active ? "opacity-80" : "text-ink-3"}`}>
                          {jerusalemDateShort(daySlots[0].start_at)}
                        </span>
                        {picksHere > 0 && (
                          <span className="tnum absolute -top-1.5 -end-1.5 grid h-5 w-5 place-items-center rounded-full border border-action bg-action-soft text-xs font-bold text-action">
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
                        aria-pressed={selected}
                        className={`tnum min-h-11 cursor-pointer rounded-[var(--r-sm)] border px-3 py-2 text-sm font-medium transition-colors ${
                          selected
                            ? "border-action bg-action-soft text-action"
                            : atCap
                              ? "cursor-not-allowed border-line bg-canvas text-ink-3 opacity-60"
                              : "border-line bg-surface text-ink hover:border-ink"
                        }`}
                      >
                        <span className="ltr-isolate">
                          {availabilityTime(s.start_at)}–{availabilityTime(s.end_at)}
                        </span>
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
                        aria-label={`הסרת המועד ${slotWhen(s)}`}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[var(--r-pill)] border border-line bg-surface ps-4 pe-3 text-sm font-medium text-ink hover:border-ink"
                      >
                        {jerusalemWeekday(s.start_at)} {jerusalemDateShort(s.start_at)} ·{" "}
                        <span className="tnum ltr-isolate">{availabilityTime(s.start_at)}</span>
                        <X strokeWidth={1.75} size={16} aria-hidden="true" className="text-ink-3" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== Step 2: details ===== */}
        {step === 1 && (
          <div className="space-y-8">
            {subjects.length > 1 && (
              <fieldset>
                <legend className="text-base font-semibold text-ink">באיזה מקצוע תרצו שיעור?</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <Option
                      key={s.id}
                      selected={subjectName === s.name_he}
                      onClick={() => setSubjectName(s.name_he)}
                    >
                      {s.name_he}
                    </Option>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="text-base font-semibold text-ink">איך תרצו ללמוד?</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.lesson_modes.map((m) => {
                  const price = lessonModePrice(m, teacher.hourly_rate, teacher.lesson_mode_prices);
                  return (
                    <Option key={m} selected={mode === m} onClick={() => setMode(m)}>
                      {lessonModeLabel(m)}
                      {price != null && (
                        <span className="ltr-isolate tnum opacity-80">· {formatPrice(price)}</span>
                      )}
                    </Option>
                  );
                })}
              </div>
            </fieldset>

            {misfits.length > 0 && mode && (
              <div
                role="alert"
                className="rounded-[var(--r-sm)] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink"
              >
                <ul className="space-y-1">
                  {misfits.map((s) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <TriangleAlert strokeWidth={1.75} size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                      <span>
                        המועד <span className="tnum">{slotWhen(s)}</span> לא זמין לשיעור {lessonModeLabel(mode)}.
                        חזרו לבחור מועד אחר.
                      </span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setStep(0)} className={`${secondaryBtn} mt-3`}>
                  חזרה לבחירת מועד
                </button>
              </div>
            )}

            {mode === "student_home" && (
              <div>
                <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-ink">
                  כתובת לשיעור
                </label>
                <input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="רחוב, מספר בית ועיר"
                  autoComplete="street-address"
                  className={inputClass}
                />
              </div>
            )}

            <fieldset>
              <legend className="text-base font-semibold text-ink">
                למי השיעור? <span className="text-sm font-normal text-ink-3">(לא חובה)</span>
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {LEVEL_CATEGORIES.map((c) => (
                  <Option
                    key={c}
                    selected={levelCategory === c}
                    onClick={() => setLevelCategory(levelCategory === c ? null : c)}
                  >
                    {c}
                  </Option>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROFICIENCIES.map((p) => (
                  <Option
                    key={p}
                    selected={proficiency === p}
                    onClick={() => setProficiency(proficiency === p ? null : p)}
                  >
                    {p}
                  </Option>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* ===== Step 3: summary ===== */}
        {step === 2 && selectedSlots.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-[var(--r-md)] border border-line bg-surface p-5">
              <h2 className="text-base font-semibold text-ink">סיכום</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-3">מקצוע</dt>
                  <dd className="text-end font-medium text-ink">{subjectName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-3">אופן הלימוד</dt>
                  <dd className="text-end font-medium text-ink">{mode ? lessonModeLabel(mode) : ""}</dd>
                </div>
                {mode === "student_home" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-3">כתובת</dt>
                    <dd className="text-end font-medium text-ink">{address}</dd>
                  </div>
                )}

                <div className="border-t border-line pt-2.5">
                  <dt className="mb-2 text-ink-3">
                    {selectedSlots.length > 1 ? `${selectedSlots.length} מועדים` : "מועד"}
                  </dt>
                  {selectedSlots.map((s) => (
                    <dd key={s.id} className="flex justify-between gap-4 py-0.5">
                      <span className="text-ink">
                        {jerusalemWeekday(s.start_at)}, {jerusalemDateShort(s.start_at)} ·{" "}
                        <span className="tnum ltr-isolate">
                          {availabilityTime(s.start_at)}–{availabilityTime(s.end_at)}
                        </span>
                      </span>
                      {hasPrice && (
                        <span className="ltr-isolate tnum font-medium text-ink">
                          {formatPrice(slotPrice(s))}
                        </span>
                      )}
                    </dd>
                  ))}
                </div>

                {hasPrice && (
                  <div className="flex justify-between gap-4 border-t border-line pt-2.5">
                    <dt className="text-ink-3">סה״כ</dt>
                    <dd className="ltr-isolate tnum font-semibold text-ink">{formatPrice(totalPrice)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
                הערה ל{name} <span className="font-normal text-ink-3">(לא חובה)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="ספרו על מה תרצו לעבוד"
                className="w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink"
              />
            </div>

            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-ink">
                התשלום והביטול נקבעים ישירות מול {name}. SkillUp לא גובה מכם כלום.
              </p>
              <p className="text-ink-2">
                בשליחת הבקשה אתם מאשרים את{" "}
                <Link href="/terms" className="font-medium text-ink underline hover:text-action">
                  תנאי השימוש
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--r-sm)] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      {/* Footer nav (hidden when there is nothing to book) */}
      {!(step === 0 && noSlots) && (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-ink-2 underline hover:text-ink disabled:invisible"
          >
            חזרה
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => canContinue && setStep((s) => s + 1)}
              disabled={!canContinue}
              className="min-h-12 cursor-pointer rounded-[var(--r-pill)] bg-action px-8 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              המשך
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canContinue || pending}
              className="min-h-12 cursor-pointer rounded-[var(--r-pill)] bg-action px-6 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "שולחים..." : submitLabel(name, selectedSlots.length)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
