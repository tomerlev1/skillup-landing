"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight, Lock, PencilLine, Repeat, Trash2 } from "lucide-react";
import Dialog from "@/components/ui/Dialog";
import { createClient } from "@/lib/supabase/client";
import { addDays, dayPayload, hhmm, span, wallClock, weekStart, weekdayOf } from "@/lib/teacher";
import { HOLIDAY_ATTRIBUTION, holidayNote, holidayOn, isRestDay } from "@/lib/holidays";
import DayEditor from "./DayEditor";
import RecurringDialog from "./RecurringDialog";
import VacationDialog from "./VacationDialog";
import {
  BTN_DANGER,
  BTN_GHOST,
  BTN_PRIMARY,
  BTN_SECONDARY,
  DURATIONS,
  LESSON_STATUS,
  MODE_LABELS,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  TimeRange,
  durationLabel,
  rpcError,
  type Lesson,
  type Slot,
} from "./shared";

interface AvailabilityCalendarProps {
  teacherId: string;
  initialDuration: number;
  teacherModes: string[];
}

const MONTH_FMT = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY_FMT = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", timeZone: "UTC" });

const utc = (k: string) => new Date(`${k}T12:00:00Z`);

// Teacher availability calendar. Same backend and the same capabilities as
// the app's calendar (manage day, recurring weeks, close all, holidays),
// laid out for a desktop: month overview + a day panel.
export default function AvailabilityCalendar({ teacherId, initialDuration, teacherModes }: AvailabilityCalendarProps) {
  const supabase = useMemo(() => createClient(), []);
  const today = wallClock(new Date()).date;
  const [month, setMonth] = useState(today.slice(0, 8) + "01");
  const [selected, setSelected] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(initialDuration);
  const [dialog, setDialog] = useState<null | "day" | "recurring" | "vacation" | "closeAll">(null);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error" } | null>(null);

  const gridStart = weekStart(month);
  const gridEnd = addDays(gridStart, 41);

  const load = useCallback(async () => {
    const [slotRes, lessonRes] = await Promise.all([
      supabase.rpc("get_teacher_availability_slots", { p_teacher_id: teacherId, p_start_date: gridStart, p_end_date: gridEnd }),
      supabase
        .from("bookings")
        .select("id, start_at, end_at, status, student:students!bookings_student_id_fkey(first_name, last_name), subject_ref:subjects(name_he)")
        .eq("teacher_id", teacherId)
        .in("status", ["pending", "confirmed", "awaiting_payment", "completed"])
        .gte("start_at", `${addDays(gridStart, -1)}T00:00:00Z`)
        .lte("start_at", `${addDays(gridEnd, 1)}T23:59:59Z`)
        .order("start_at"),
    ]);
    setSlots((slotRes.data ?? []) as Slot[]);
    type Row = { id: string; start_at: string; end_at: string; status: string; student: { first_name: string | null; last_name: string | null } | null; subject_ref: { name_he: string } | null };
    setLessons(
      ((lessonRes.data ?? []) as unknown as Row[]).map((b) => ({
        id: b.id,
        start_at: b.start_at,
        end_at: b.end_at,
        status: b.status,
        studentName: [b.student?.first_name, b.student?.last_name].filter(Boolean).join(" ") || "תלמיד",
        subject: b.subject_ref?.name_he ?? null,
      })),
    );
    setLoading(false);
  }, [supabase, teacherId, gridStart, gridEnd]);

  useEffect(() => {
    load();
  }, [load]);

  // Live sync with the app and with bookings coming in.
  useEffect(() => {
    const channel = supabase
      .channel(`calendar:${teacherId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "availability_slots", filter: `teacher_id=eq.${teacherId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `teacher_id=eq.${teacherId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, teacherId, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const byDay = useMemo(() => {
    const m = new Map<string, { open: Slot[]; all: Slot[]; lessons: Lesson[] }>();
    const get = (k: string) => m.get(k) ?? (m.set(k, { open: [], all: [], lessons: [] }), m.get(k)!);
    for (const s of slots) {
      const d = get(wallClock(s.start_at).date);
      d.all.push(s);
      if (!s.is_booked) d.open.push(s);
    }
    for (const l of lessons) get(wallClock(l.start_at).date).lessons.push(l);
    return m;
  }, [slots, lessons]);

  const notify = (text: string, tone: "ok" | "error" = "ok") => {
    setToast({ text, tone });
    load();
  };

  async function changeDuration(next: number) {
    const prev = duration;
    setDuration(next);
    const { error } = await supabase.from("teachers").update({ default_lesson_duration_minutes: next }).eq("id", teacherId);
    if (error) {
      setDuration(prev);
      setToast({ text: "לא הצלחנו לשמור את אורך השיעור", tone: "error" });
    } else setToast({ text: `אורך שיעור עודכן ל${durationLabel(next)}`, tone: "ok" });
  }

  async function removeSlot(slot: Slot) {
    const day = byDay.get(selected);
    const { error } = await supabase.rpc("upsert_availability_slots", {
      p_teacher_id: teacherId,
      p_date: selected,
      p_slots: dayPayload(day?.all ?? [], { removeStartAt: slot.start_at }),
    });
    if (error) setToast({ text: rpcError(error), tone: "error" });
    else notify("החלון נסגר");
  }

  async function clearDay() {
    const { error } = await supabase.rpc("upsert_availability_slots", { p_teacher_id: teacherId, p_date: selected, p_slots: [] });
    if (error) setToast({ text: rpcError(error), tone: "error" });
    else notify("החלונות הפנויים ביום נסגרו");
  }

  async function closeAll() {
    const { data, error } = await supabase.rpc("close_all_availability", { p_teacher_id: teacherId });
    setDialog(null);
    if (error) return setToast({ text: rpcError(error), tone: "error" });
    notify(`נסגרו ${(data as { deleted_count?: number } | null)?.deleted_count ?? 0} חלונות עתידיים`);
  }

  // Month totals (only days inside the month, from today on).
  const monthKey = month.slice(0, 7);
  let monthOpen = 0;
  let monthLessons = 0;
  for (const [k, d] of byDay) {
    if (!k.startsWith(monthKey)) continue;
    if (k >= today) monthOpen += d.open.filter((s) => s.start_at > new Date().toISOString()).length;
    monthLessons += d.lessons.length;
  }

  const day = byDay.get(selected) ?? { open: [], all: [], lessons: [] };
  const holiday = holidayOn(selected);
  const isPast = selected < today;
  const dayTitle = `יום ${WEEKDAYS_LONG[weekdayOf(selected)]}, ${DAY_FMT.format(utc(selected))}`;
  const timeline = [
    ...day.open.map((s) => ({ kind: "open" as const, key: s.id, ...span(s.start_at, s.end_at), slot: s })),
    ...day.lessons.map((l) => ({ kind: "lesson" as const, key: l.id, ...span(l.start_at, l.end_at), lesson: l })),
  ].sort((a, b) => a.start - b.start);

  function shiftMonth(delta: number) {
    const d = utc(month);
    d.setUTCMonth(d.getUTCMonth() + delta, 1);
    setMonth(d.toISOString().slice(0, 10));
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* ---------- Month ---------- */}
      <section className="overflow-hidden rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="החודש הקודם" className="grid size-10 cursor-pointer place-items-center rounded-[var(--r-sm)] text-ink-2 hover:bg-canvas">
              <ChevronRight size={20} strokeWidth={2} />
            </button>
            <h2 className="min-w-[132px] text-center text-lg font-extrabold text-ink">{MONTH_FMT.format(utc(month))}</h2>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="החודש הבא" className="grid size-10 cursor-pointer place-items-center rounded-[var(--r-sm)] text-ink-2 hover:bg-canvas">
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMonth(today.slice(0, 8) + "01");
                setSelected(today);
              }}
              className={`${BTN_GHOST} min-h-9 px-3`}
            >
              היום
            </button>
          </div>
          <p className="tnum text-[13px] text-ink-2">
            <span className="font-bold text-ink">{monthOpen}</span> חלונות פנויים · <span className="font-bold text-ink">{monthLessons}</span> שיעורים החודש
          </p>
        </header>

        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-line text-center text-[12px] font-bold text-ink-3">
          {WEEKDAYS_SHORT.map((d, i) => (
            <div key={d} className={`py-2.5 ${i >= 5 ? "bg-canvas/70" : ""}`}>
              <span className="sm:hidden">{d}</span>
              <span className="hidden sm:inline">{WEEKDAYS_LONG[i]}</span>
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-7 gap-px bg-line transition-opacity ${loading ? "opacity-60" : ""}`}>
          {Array.from({ length: 42 }, (_, i) => {
            const k = addDays(gridStart, i);
            const d = byDay.get(k);
            const inMonth = k.startsWith(monthKey);
            const h = holidayOn(k);
            const rest = isRestDay(h);
            const weekend = weekdayOf(k) >= 5;
            const past = k < today;
            const isSel = k === selected;
            const open = d?.open.length ?? 0;
            const les = d?.lessons.length ?? 0;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                aria-pressed={isSel}
                aria-label={`${DAY_FMT.format(utc(k))}${h ? `, ${h.title_he}` : ""}, ${open} פנויים, ${les} שיעורים`}
                className={`relative flex min-h-[64px] cursor-pointer flex-col items-stretch p-1.5 text-start transition-colors sm:min-h-[96px] sm:p-2 ${
                  rest ? "bg-[color-mix(in_srgb,var(--c-warn)_7%,var(--c-surface))]" : weekend ? "bg-canvas" : "bg-surface"
                } ${isSel ? "z-10 outline outline-2 -outline-offset-2 outline-action" : "hover:bg-brand-50"}`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span
                    className={`tnum grid size-7 place-items-center rounded-full text-[13px] font-bold ${
                      k === today ? "bg-action text-on-action" : !inMonth ? "text-ink-3/60" : past ? "text-ink-3" : "text-ink"
                    }`}
                  >
                    {Number(k.slice(8))}
                  </span>
                  {h && <span className={`size-1.5 shrink-0 rounded-full sm:hidden ${rest ? "bg-warn" : "bg-ink-3/50"}`} aria-hidden="true" />}
                </span>
                {h && (
                  <span className={`mt-0.5 hidden truncate text-[11px] font-semibold sm:block ${rest ? "text-warn-text" : "text-ink-3"}`}>{h.title_he}</span>
                )}
                <span className={`mt-auto flex flex-col gap-0.5 ${past ? "opacity-50" : ""}`}>
                  {les > 0 && (
                    <span className="tnum flex items-center gap-1 text-[11px] font-bold text-action sm:text-[12px]">
                      <span className="size-1.5 shrink-0 rounded-full bg-action" aria-hidden="true" />
                      <span className="hidden sm:inline">{les} שיעורים</span>
                      <span className="sm:hidden">{les}</span>
                    </span>
                  )}
                  {open > 0 && (
                    <span className="tnum flex items-center gap-1 text-[11px] font-semibold text-ok-text sm:text-[12px]">
                      <span className="size-1.5 shrink-0 rounded-full bg-ok" aria-hidden="true" />
                      <span className="hidden sm:inline">{open} פנויים</span>
                      <span className="sm:hidden">{open}</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend + global actions */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12px] text-ink-2 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-ok" />פנוי</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-action" />שיעור</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-[var(--r-tail)] bg-[color-mix(in_srgb,var(--c-warn)_18%,var(--c-surface))] ring-1 ring-warn/30" />חג</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-[var(--r-tail)] bg-canvas ring-1 ring-line" />שישי ושבת</span>
          </div>
          <span className="text-ink-3">
            נתוני חגים: <bdi dir="ltr">{HOLIDAY_ATTRIBUTION}</bdi>
          </span>
        </footer>
      </section>

      {/* ---------- Side: settings + day ---------- */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        <section className="rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <label htmlFor="lesson-duration" className="block text-[13px] font-bold text-ink">
            אורך שיעור ברירת מחדל
          </label>
          <select
            id="lesson-duration"
            value={duration}
            onChange={(e) => changeDuration(Number(e.target.value))}
            className="mt-2 h-10 w-full cursor-pointer rounded-[var(--r-sm)] border border-line bg-surface px-3 text-[15px] font-semibold text-ink outline-none focus:border-action"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {durationLabel(d)}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[12px] text-ink-3">משמש למילוי מהיר ולזמינות קבועה.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDialog("recurring")} className={BTN_SECONDARY}>
              <Repeat size={16} strokeWidth={2} />
              זמינות קבועה
            </button>
            <button type="button" onClick={() => setDialog("vacation")} className={BTN_SECONDARY}>
              <CalendarOff size={16} strokeWidth={2} />
              חופשה
            </button>
          </div>
        </section>

        <section className="rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <div className="border-b border-line p-5">
            <h3 className="text-base font-extrabold text-ink">{dayTitle}</h3>
            <p className="tnum mt-1 text-[13px] text-ink-2">
              {day.lessons.length} שיעורים · {day.open.length} חלונות פנויים
            </p>
            {holiday && (
              <div className={`mt-3 rounded-[var(--r-sm)] px-3 py-2 text-[13px] ${isRestDay(holiday) ? "bg-warn/10 text-warn-text" : "bg-canvas text-ink-2"}`}>
                <span className="font-bold">{holiday.title_he}.</span> {holidayNote(holiday)}
              </div>
            )}
          </div>

          <ul className="max-h-[380px] divide-y divide-line overflow-y-auto">
            {timeline.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-3">{isPast ? "לא היו שיעורים ביום הזה." : "אין זמינות ביום הזה."}</li>
            )}
            {timeline.map((t) =>
              t.kind === "lesson" ? (
                <li key={t.key} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-9 w-1 shrink-0 rounded-full bg-action" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tnum text-sm font-bold text-ink">
                      <TimeRange from={hhmm(t.start)} to={hhmm(t.end)} /> · {t.lesson.studentName}
                    </p>
                    <p className="truncate text-[12px] text-ink-3">
                      {[t.lesson.subject, LESSON_STATUS[t.lesson.status]].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Lock size={14} strokeWidth={2} className="shrink-0 text-ink-3" aria-label="שיעור שנקבע" />
                </li>
              ) : (
                <li key={t.key} className="group flex items-center gap-3 px-5 py-3">
                  <span className="h-9 w-1 shrink-0 rounded-full bg-ok" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tnum text-sm font-bold text-ink">
                      <TimeRange from={hhmm(t.start)} to={hhmm(t.end)} /> <span className="font-semibold text-ok-text">· פנוי</span>
                    </p>
                    <p className="truncate text-[12px] text-ink-3">
                      {durationLabel(t.end - t.start)}
                      {t.slot.allowed_modes?.length ? ` · ${t.slot.allowed_modes.map((m) => MODE_LABELS[m] ?? m).join(", ")}` : ""}
                    </p>
                  </div>
                  {!isPast && (
                    <button
                      type="button"
                      onClick={() => removeSlot(t.slot)}
                      aria-label={`סגירת החלון ${hhmm(t.start)}`}
                      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[var(--r-sm)] text-ink-3 transition-colors hover:bg-danger/10 hover:text-danger-text sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  )}
                </li>
              ),
            )}
          </ul>

          {!isPast && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-4">
              <button type="button" onClick={() => setDialog("day")} className={`${BTN_PRIMARY} flex-1`}>
                <PencilLine size={16} strokeWidth={2} />
                עריכת שעות
              </button>
              {day.open.length > 0 && (
                <button type="button" onClick={clearDay} className={BTN_DANGER}>
                  ניקוי היום
                </button>
              )}
            </div>
          )}
        </section>

        <button type="button" onClick={() => setDialog("closeAll")} className={`${BTN_DANGER} w-full justify-center text-[13px]`}>
          סגירת כל הזמינות העתידית
        </button>
      </aside>

      <DayEditor
        open={dialog === "day"}
        onClose={() => setDialog(null)}
        teacherId={teacherId}
        dateKey={selected}
        title={dayTitle}
        slots={day.all}
        lessons={day.lessons}
        duration={duration}
        teacherModes={teacherModes}
        onSaved={(m) => notify(m)}
      />
      <RecurringDialog open={dialog === "recurring"} onClose={() => setDialog(null)} teacherId={teacherId} duration={duration} teacherModes={teacherModes} onDone={(m) => notify(m)} />
      <VacationDialog open={dialog === "vacation"} onClose={() => setDialog(null)} teacherId={teacherId} initialDate={selected} onDone={(m) => notify(m)} />
      <Dialog
        open={dialog === "closeAll"}
        onClose={() => setDialog(null)}
        title="לסגור את כל הזמינות?"
        description="כל החלונות הפנויים מהיום והלאה יימחקו. שיעורים שכבר נקבעו לא ישתנו."
        width="sm"
        footer={
          <>
            <button type="button" onClick={() => setDialog(null)} className={BTN_GHOST}>
              ביטול
            </button>
            <button type="button" onClick={closeAll} className={`${BTN_PRIMARY} bg-danger hover:bg-danger`}>
              כן, לסגור הכל
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-2">אפשר לפתוח זמינות מחדש בכל רגע, יום-יום או בזמינות קבועה.</p>
      </Dialog>

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-6 z-[80] mx-auto w-fit max-w-[calc(100%-32px)] rounded-[var(--r-sm)] px-4 py-3 text-sm font-semibold shadow-[var(--shadow-lift)] ${
            toast.tone === "error" ? "bg-danger text-white" : "bg-ink text-surface"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
