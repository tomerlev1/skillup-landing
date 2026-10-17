"use client";

import { useMemo, useState } from "react";
import { Lock, Plus, Trash2, Wand2 } from "lucide-react";
import Dialog from "@/components/ui/Dialog";
import { createClient } from "@/lib/supabase/client";
import { hhmm, parseHhmm, span, wallClock } from "@/lib/teacher";
import { holidayOn, isRestDay } from "@/lib/holidays";
import { BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY, INPUT, MODE_LABELS, ModeChecks, TimeRange, durationLabel, rpcError, type Lesson, type Slot } from "./shared";

interface Row {
  key: string;
  start: number;
  end: number;
  modes: string[];
  locked: boolean;
  label?: string;
}

interface DayEditorProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  dateKey: string;
  title: string;
  slots: Slot[];
  lessons: Lesson[];
  duration: number;
  teacherModes: string[];
  onSaved: (message: string) => void;
}

let seq = 0;
const newKey = () => `n${++seq}`;

function initialRows(slots: Slot[], lessons: Lesson[], teacherModes: string[]): Row[] {
  const rows: Row[] = [];
  for (const s of slots) {
    const sp = span(s.start_at, s.end_at);
    if (s.is_booked) continue;
    rows.push({ key: s.id, start: sp.start, end: sp.end, modes: s.allowed_modes?.length ? s.allowed_modes : teacherModes, locked: false });
  }
  for (const l of lessons) {
    const sp = span(l.start_at, l.end_at);
    rows.push({ key: l.id, start: sp.start, end: sp.end, modes: [], locked: true, label: l.studentName });
  }
  return rows.sort((a, b) => a.start - b.start);
}

// Edit one day's open windows (same model as the app's "ניהול יום"): booked
// lessons stay locked, everything else is a plain list of time ranges that is
// saved in one call (upsert_availability_slots replaces the day's open slots).
export default function DayEditor(props: DayEditorProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} title="עריכת שעות" description={props.title} width="md">
      {open && <EditorBody {...props} />}
    </Dialog>
  );
}

function EditorBody({ onClose, teacherId, dateKey, slots, lessons, duration, teacherModes, onSaved }: DayEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Row[]>(() => initialRows(slots, lessons, teacherModes));
  const [fillFrom, setFillFrom] = useState("09:00");
  const [fillTo, setFillTo] = useState("17:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmHoliday, setConfirmHoliday] = useState(false);

  const holiday = holidayOn(dateKey);
  const now = wallClock(new Date());
  const isToday = now.date === dateKey;
  const originalOpen = slots.filter((s) => !s.is_booked).length;

  const locked = rows.filter((r) => r.locked);
  const editable = rows.filter((r) => !r.locked);

  function problem(r: Row): string | null {
    if (r.locked) return null;
    if (r.end <= r.start) return "שעת הסיום צריכה להיות אחרי שעת ההתחלה";
    if (isToday && r.start < now.minutes) return "השעה הזאת כבר עברה";
    const clash = rows.find((o) => o.key !== r.key && r.start < o.end && o.start < r.end);
    if (clash) return clash.locked ? `חופף לשיעור עם ${clash.label}` : "חופף לחלון אחר";
    return null;
  }
  const hasProblems = editable.some((r) => problem(r));

  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)).sort((a, b) => a.start - b.start));
  }

  function addRow() {
    const last = rows.at(-1);
    let start = last ? last.end : 9 * 60;
    if (isToday) start = Math.max(start, Math.ceil((now.minutes + 1) / 15) * 15);
    start = Math.min(start, 1440 - duration);
    setRows((rs) => [...rs, { key: newKey(), start, end: start + duration, modes: teacherModes, locked: false }].sort((a, b) => a.start - b.start));
  }

  // Back-to-back windows of the lesson length, skipping booked lessons.
  function fill() {
    const from = parseHhmm(fillFrom);
    const to = parseHhmm(fillTo) || 1440;
    const out: Row[] = [];
    for (let t = from; t + duration <= to; t += duration) {
      if (isToday && t < now.minutes) continue;
      if (locked.some((l) => t < l.end && l.start < t + duration)) continue;
      out.push({ key: newKey(), start: t, end: t + duration, modes: teacherModes, locked: false });
    }
    setRows([...locked, ...out].sort((a, b) => a.start - b.start));
  }

  async function save() {
    setError(null);
    if (isRestDay(holiday) && editable.length > originalOpen && !confirmHoliday) {
      setConfirmHoliday(true);
      return;
    }
    setSaving(true);
    const payload = editable.map((r) => ({
      start_time: hhmm(r.start),
      end_time: hhmm(r.end),
      ...(r.modes.length ? { allowed_modes: r.modes } : {}),
    }));
    const { error: err } = await supabase.rpc("upsert_availability_slots", {
      p_teacher_id: teacherId,
      p_date: dateKey,
      p_slots: payload,
    });
    setSaving(false);
    if (err) return setError(rpcError(err));
    onSaved(payload.length ? `נשמרו ${payload.length} חלונות פנויים` : "החלונות הפנויים ביום נסגרו");
    onClose();
  }

  return (
    <>
      {/* Quick fill */}
      <div className="rounded-[var(--r-md)] bg-canvas p-4 ring-1 ring-line/60">
        <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <Wand2 size={15} strokeWidth={2} aria-hidden="true" />
          מילוי מהיר
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="time" step={900} value={fillFrom} onChange={(e) => setFillFrom(e.target.value)} className={INPUT} aria-label="משעה" />
          <span className="text-ink-3">עד</span>
          <input type="time" step={900} value={fillTo} onChange={(e) => setFillTo(e.target.value)} className={INPUT} aria-label="עד שעה" />
          <button type="button" onClick={fill} className={BTN_SECONDARY}>
            מילוי בחלונות של {durationLabel(duration)}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-ink-3">מחליף את החלונות הפנויים ביום. שיעורים שנקבעו נשארים במקומם.</p>
      </div>

      {/* Rows */}
      <ul className="mt-5 divide-y divide-line">
        {rows.length === 0 && <li className="py-8 text-center text-sm text-ink-3">אין חלונות ביום הזה. הוסיפו חלון או השתמשו במילוי המהיר.</li>}
        {rows.map((r) => {
          const err = problem(r);
          return (
            <li key={r.key} className="py-3">
              {r.locked ? (
                <div className="flex items-center gap-3 text-sm">
                  <Lock size={15} strokeWidth={2} className="shrink-0 text-ink-3" aria-hidden="true" />
                  <span className="font-bold text-ink">
                    <TimeRange from={hhmm(r.start)} to={hhmm(r.end)} />
                  </span>
                  <span className="truncate text-ink-2">שיעור עם {r.label}</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      step={300}
                      value={hhmm(r.start)}
                      onChange={(e) => e.target.value && update(r.key, { start: parseHhmm(e.target.value) })}
                      className={`${INPUT} ${err ? "border-danger" : ""}`}
                      aria-label="שעת התחלה"
                    />
                    <span className="text-ink-3">–</span>
                    <input
                      type="time"
                      step={300}
                      value={hhmm(r.end)}
                      onChange={(e) => e.target.value && update(r.key, { end: parseHhmm(e.target.value) || 1440 })}
                      className={`${INPUT} ${err ? "border-danger" : ""}`}
                      aria-label="שעת סיום"
                    />
                    <span className="tnum min-w-16 text-[13px] text-ink-3">{r.end > r.start ? durationLabel(r.end - r.start) : ""}</span>
                    <button
                      type="button"
                      onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      aria-label="הסרת החלון"
                      className="ms-auto grid size-10 cursor-pointer place-items-center rounded-[var(--r-sm)] text-ink-3 transition-colors hover:bg-danger/10 hover:text-danger-text"
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </div>
                  {teacherModes.length > 1 && (
                    <div className="mt-2.5">
                      <ModeChecks modes={teacherModes} value={r.modes} onChange={(modes) => update(r.key, { modes })} />
                    </div>
                  )}
                  {err && <p className="mt-1.5 text-[12px] font-semibold text-danger-text">{err}</p>}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={addRow} className={`${BTN_GHOST} mt-2 -ms-2`}>
        <Plus size={16} strokeWidth={2.25} />
        הוספת חלון
      </button>

      {teacherModes.length === 1 && (
        <p className="mt-3 text-[12px] text-ink-3">כל החלונות פתוחים לשיעור {MODE_LABELS[teacherModes[0]] ?? ""}.</p>
      )}

      {confirmHoliday && holiday && (
        <div role="alert" className="mt-4 rounded-[var(--r-sm)] bg-warn/10 p-3 text-sm text-warn-text ring-1 ring-warn/30">
          <span className="font-bold">{holiday.title_he}.</span> זה יום חג. לשמור בכל זאת את החלונות החדשים?
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-danger-text">
          {error}
        </p>
      )}

      <div className="sticky -bottom-5 -mx-6 mt-6 flex justify-end gap-2 border-t border-line bg-surface px-6 py-4">
        <button type="button" onClick={onClose} className={BTN_GHOST}>
          ביטול
        </button>
        <button type="button" onClick={save} disabled={saving || hasProblems} className={BTN_PRIMARY}>
          {saving ? "שומרים…" : confirmHoliday ? "כן, לשמור" : "שמירה"}
        </button>
      </div>
    </>
  );
}
