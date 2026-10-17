"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { createClient } from "@/lib/supabase/client";
import { addDays, wallClock } from "@/lib/teacher";
import { BTN_GHOST, BTN_PRIMARY, Field, INPUT, rpcError, type Slot } from "./shared";

interface VacationDialogProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  initialDate: string;
  onDone: (message: string) => void;
}

const MAX_DAYS = 120;

// Vacation / days off: closes every open window in a date range. Lessons that
// were already booked are left alone (the teacher handles them with the student).
export default function VacationDialog(props: VacationDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title="חופשה או ימים חסומים"
      description="סוגרים את כל החלונות הפנויים בטווח התאריכים. תלמידים לא יוכלו לקבוע בו שיעורים."
      width="sm"
    >
      {props.open && <Body {...props} />}
    </Dialog>
  );
}

function Body({ onClose, teacherId, initialDate, onDone }: VacationDialogProps) {
  const supabase = useMemo(() => createClient(), []);
  const today = wallClock(new Date()).date;
  const [from, setFrom] = useState(initialDate < today ? today : initialDate);
  const [to, setTo] = useState(initialDate < today ? today : initialDate);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooLong = to > addDays(from, MAX_DAYS);
  const invalid = to < from ? "תאריך הסיום לפני תאריך ההתחלה" : tooLong ? `עד ${MAX_DAYS} ימים בכל פעם` : null;

  useEffect(() => {
    if (invalid) return;
    let cancelled = false;
    supabase
      .rpc("get_teacher_availability_slots", { p_teacher_id: teacherId, p_start_date: from, p_end_date: to })
      .then(({ data }) => !cancelled && setSlots((data ?? []) as Slot[]));
    return () => {
      cancelled = true;
    };
  }, [supabase, teacherId, from, to, invalid]);

  const open = slots?.filter((s) => !s.is_booked) ?? [];
  const booked = slots?.filter((s) => s.is_booked).length ?? 0;
  const days = [...new Set(open.map((s) => wallClock(s.start_at).date))];

  async function apply() {
    setBusy(true);
    setError(null);
    for (const day of days) {
      const { error: err } = await supabase.rpc("upsert_availability_slots", { p_teacher_id: teacherId, p_date: day, p_slots: [] });
      if (err) {
        setBusy(false);
        return setError(rpcError(err));
      }
    }
    setBusy(false);
    onDone(open.length ? `נסגרו ${open.length} חלונות ב-${days.length} ימים` : "אין חלונות פנויים בטווח הזה");
    onClose();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="מתאריך">
          <input type="date" min={today} value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} className={`${INPUT} w-full`} />
        </Field>
        <Field label="עד תאריך">
          <input type="date" min={from} value={to} onChange={(e) => e.target.value && setTo(e.target.value)} className={`${INPUT} w-full`} />
        </Field>
      </div>

      <div className="rounded-[var(--r-md)] bg-canvas p-4 text-sm ring-1 ring-line/60">
        {invalid ? (
          <p className="font-semibold text-danger-text">{invalid}</p>
        ) : slots === null ? (
          <p className="text-ink-3">בודקים את הטווח…</p>
        ) : (
          <>
            <p className="font-bold text-ink">
              {open.length ? `${open.length} חלונות פנויים ייסגרו` : "אין חלונות פנויים בטווח"}
            </p>
            {booked > 0 && (
              <p className="mt-1 text-[13px] text-warn-text">
                יש {booked} שיעורים שכבר נקבעו בטווח. הם לא יבוטלו, כדאי לתאם אותם מול התלמידים.
              </p>
            )}
          </>
        )}
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
        <button type="button" onClick={apply} disabled={busy || Boolean(invalid) || slots === null || open.length === 0} className={BTN_PRIMARY}>
          {busy ? "סוגרים…" : "סגירת הטווח"}
        </button>
      </div>
    </div>
  );
}
