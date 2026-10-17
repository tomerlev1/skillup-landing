"use client";

import { useMemo, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { createClient } from "@/lib/supabase/client";
import { addDays, dayPayload, parseHhmm, wallClock, weekdayOf } from "@/lib/teacher";
import { holidayOn, isRestDay } from "@/lib/holidays";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  DURATIONS,
  Field,
  INPUT,
  ModeChecks,
  Segmented,
  SegmentedMulti,
  WEEKDAYS_SHORT,
  durationLabel,
  rpcError,
  type Slot,
} from "./shared";

interface RecurringDialogProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  duration: number;
  teacherModes: string[];
  onDone: (message: string) => void;
}

const PERIODS = [
  { value: 30, label: "חודש" },
  { value: 91, label: "3 חודשים" },
  { value: 179, label: "חצי שנה" },
];

// Weekly recurring availability (the app's "זמינות קבועה"): weekdays + a
// daily time window, cut into lesson-length windows over a date range.
// apply_weekly_recurrence never deletes; it skips anything that overlaps.
export default function RecurringDialog(props: RecurringDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title="זמינות קבועה"
      description="פותחים חלונות קבועים לכל השבועות הקרובים. חלונות ושיעורים קיימים לא משתנים."
      width="md"
    >
      {props.open && <Body {...props} />}
    </Dialog>
  );
}

function Body({ onClose, teacherId, duration: defaultDuration, teacherModes, onDone }: RecurringDialogProps) {
  const supabase = useMemo(() => createClient(), []);
  const today = wallClock(new Date()).date;
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [from, setFrom] = useState("16:00");
  const [to, setTo] = useState("20:00");
  const [duration, setDuration] = useState(DURATIONS.includes(defaultDuration) ? defaultDuration : 60);
  const [startDate, setStartDate] = useState(today);
  const [period, setPeriod] = useState(91);
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [modes, setModes] = useState<string[]>(teacherModes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endDate = addDays(startDate, period);
  const fromMin = parseHhmm(from);
  const toMin = parseHhmm(to) || 1440;
  const perDay = toMin > fromMin ? Math.floor((toMin - fromMin) / duration) : 0;

  const { days, holidays } = useMemo(() => {
    let d = 0;
    const hs: string[] = [];
    for (let k = startDate; k <= endDate; k = addDays(k, 1)) {
      if (!weekdays.has(weekdayOf(k))) continue;
      if (skipHolidays && isRestDay(holidayOn(k))) hs.push(k);
      else d++;
    }
    return { days: d, holidays: hs };
  }, [startDate, endDate, weekdays, skipHolidays]);

  const invalid = weekdays.size === 0 ? "בחרו לפחות יום אחד" : perDay === 0 ? "טווח השעות קצר מאורך שיעור" : startDate < today ? "תאריך ההתחלה עבר" : null;

  function toggle(d: number) {
    setWeekdays((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  }

  async function apply() {
    setBusy(true);
    setError(null);

    // Snapshot holiday dates first, so we can put them back exactly as they were.
    let before: Slot[] = [];
    if (holidays.length) {
      const { data } = await supabase.rpc("get_teacher_availability_slots", {
        p_teacher_id: teacherId,
        p_start_date: holidays[0],
        p_end_date: holidays.at(-1),
      });
      before = (data ?? []) as Slot[];
    }

    const { data, error: err } = await supabase.rpc("apply_weekly_recurrence", {
      p_teacher_id: teacherId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_weekdays: [...weekdays].sort(),
      p_start_time: from,
      p_end_time: to === "00:00" ? "23:59" : to,
      p_slot_duration: duration,
      p_allowed_modes: modes.length ? modes : null,
    });
    if (err) {
      setBusy(false);
      return setError(rpcError(err));
    }

    for (const day of holidays) {
      const prev = before.filter((s) => wallClock(s.start_at).date === day);
      await supabase.rpc("upsert_availability_slots", {
        p_teacher_id: teacherId,
        p_date: day,
        p_slots: dayPayload(prev, {}),
      });
    }

    setBusy(false);
    const res = (data ?? {}) as { created_count?: number; skipped_count?: number };
    const parts = [`נפתחו ${res.created_count ?? 0} חלונות`];
    if (res.skipped_count) parts.push(`${res.skipped_count} דולגו בגלל חפיפה`);
    if (holidays.length) parts.push(`${holidays.length} ימי חג נשארו סגורים`);
    onDone(parts.join(" · "));
    onClose();
  }

  return (
    <div className="space-y-6">
      <Field label="ימים בשבוע">
        <SegmentedMulti
          label="ימים בשבוע"
          values={weekdays}
          onToggle={toggle}
          options={WEEKDAYS_SHORT.map((l, i) => ({ value: i, label: l, muted: i >= 5 }))}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="שעות ביום">
          <div className="flex items-center gap-2">
            <input type="time" step={900} value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} className={`${INPUT} flex-1`} aria-label="משעה" />
            <span className="text-ink-3">עד</span>
            <input type="time" step={900} value={to} onChange={(e) => e.target.value && setTo(e.target.value)} className={`${INPUT} flex-1`} aria-label="עד שעה" />
          </div>
        </Field>
        <Field label="החל מתאריך">
          <input type="date" min={today} value={startDate} onChange={(e) => e.target.value && setStartDate(e.target.value)} className={`${INPUT} w-full`} />
        </Field>
      </div>

      <Field label="אורך כל שיעור">
        <Segmented label="אורך שיעור" size="sm" value={duration} onChange={setDuration} options={DURATIONS.map((d) => ({ value: d, label: durationLabel(d) }))} />
      </Field>

      <Field label="לכמה זמן קדימה">
        <Segmented label="תקופה" size="sm" value={period} onChange={setPeriod} options={PERIODS} />
      </Field>

      {teacherModes.length > 1 && (
        <Field label="סוגי שיעור בחלונות האלה">
          <ModeChecks modes={teacherModes} value={modes} onChange={setModes} />
        </Field>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-[var(--r-sm)] p-3 ring-1 ring-line">
        <input type="checkbox" checked={skipHolidays} onChange={(e) => setSkipHolidays(e.target.checked)} className="mt-0.5 size-4 accent-[var(--c-action)]" />
        <span>
          <span className="block text-sm font-bold text-ink">לא לפתוח בחגים</span>
          <span className="block text-[12px] text-ink-3">ימי חג וימים לאומיים יישארו כמו שהם היום.</span>
        </span>
      </label>

      {/* Preview */}
      <div className="flex items-center justify-between gap-4 rounded-[var(--r-md)] bg-canvas p-4 ring-1 ring-line/60">
        <div>
          <p className="tnum text-[22px] font-black leading-none text-ink">{invalid ? "—" : perDay * days}</p>
          <p className="mt-1 text-[12px] text-ink-3">חלונות לכל היותר</p>
        </div>
        <p className="tnum text-end text-[13px] leading-relaxed text-ink-2">
          {invalid ?? (
            <>
              {perDay} ביום · {days} ימים
              <br />
              עד {new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" }).format(new Date(endDate))}
            </>
          )}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-danger-text">
          {error}
        </p>
      )}

      <div className="sticky -bottom-5 -mx-6 flex justify-end gap-2 border-t border-line bg-surface px-6 py-4">
        <button type="button" onClick={onClose} className={BTN_GHOST}>
          ביטול
        </button>
        <button type="button" onClick={apply} disabled={busy || Boolean(invalid)} className={BTN_PRIMARY}>
          {busy ? "פותחים…" : "פתיחת הזמינות"}
        </button>
      </div>
    </div>
  );
}
