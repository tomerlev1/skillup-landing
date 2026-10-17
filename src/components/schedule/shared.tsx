// Shared types, labels and form primitives for the teacher availability
// calendar. Deliberately quiet: neutral surfaces, one accent for the primary
// action, native time/date inputs, segmented controls instead of chips.

export interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  is_booked: boolean;
  booking_id: string | null;
  allowed_modes: string[] | null;
}

export interface Lesson {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  studentName: string;
  subject: string | null;
}

/** "07:00–08:00", kept left-to-right inside Hebrew text. */
export function TimeRange({ from, to }: { from: string; to: string }) {
  return (
    <bdi dir="ltr" className="tnum">
      {from}–{to}
    </bdi>
  );
}

export const DURATIONS = [30, 45, 60, 90, 120];

export const MODE_LABELS: Record<string, string> = {
  online: "אונליין",
  teacher_home: "אצלי",
  student_home: "אצל התלמיד",
};

export const WEEKDAYS_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
export const WEEKDAYS_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export const LESSON_STATUS: Record<string, string> = {
  pending: "ממתין לאישור",
  awaiting_payment: "ממתין לתיאום",
  confirmed: "מאושר",
  completed: "הסתיים",
};

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} דק׳`;
  if (minutes === 60) return "שעה";
  if (minutes === 90) return "שעה וחצי";
  if (minutes === 120) return "שעתיים";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}:${String(m).padStart(2, "0")} ש׳` : `${h} ש׳`;
}

export const BTN =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[var(--r-sm)] px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_PRIMARY = `${BTN} bg-action text-on-action hover:bg-action-hover`;
export const BTN_SECONDARY = `${BTN} bg-surface text-ink ring-1 ring-line hover:bg-canvas`;
export const BTN_GHOST = `${BTN} text-ink-2 hover:bg-canvas hover:text-ink`;
export const BTN_DANGER = `${BTN} text-danger-text hover:bg-danger/10`;

export const INPUT =
  "tnum h-10 rounded-[var(--r-sm)] border border-line bg-surface px-3 text-[15px] font-semibold text-ink outline-none transition-colors focus:border-action";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-ink">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-ink-3">{hint}</p>}
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
}

/** Joined segmented control — one bordered group, the selected cell filled. */
export function Segmented<T extends string | number>({ value, options, onChange, label, size = "md" }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full overflow-hidden rounded-[var(--r-sm)] border border-line bg-surface">
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`tnum flex-1 cursor-pointer px-2 text-center font-bold transition-colors ${size === "sm" ? "h-9 text-[13px]" : "h-10 text-sm"} ${
              i > 0 ? "border-s border-line" : ""
            } ${active ? "bg-ink text-surface" : "text-ink-2 hover:bg-canvas hover:text-ink"}`}
          >
            {o.label}
            {o.sub && <span className={`block text-[11px] font-medium ${active ? "opacity-70" : "text-ink-3"}`}>{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select variant (weekdays): same joined look, several cells can be on. */
export function SegmentedMulti({
  values,
  options,
  onToggle,
  label,
}: {
  values: Set<number>;
  options: { value: number; label: string; muted?: boolean }[];
  onToggle: (v: number) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex w-full overflow-hidden rounded-[var(--r-sm)] border border-line bg-surface">
      {options.map((o, i) => {
        const on = values.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className={`h-10 flex-1 cursor-pointer text-sm font-bold transition-colors ${i > 0 ? "border-s border-line" : ""} ${
              on ? "bg-ink text-surface" : o.muted ? "bg-canvas text-ink-3 hover:text-ink" : "text-ink-2 hover:bg-canvas hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ModeChecks({
  modes,
  value,
  onChange,
}: {
  modes: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  if (modes.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {modes.map((m) => (
        <label key={m} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-2">
          <input
            type="checkbox"
            className="size-4 accent-[var(--c-action)]"
            checked={value.includes(m)}
            onChange={(e) => {
              const next = e.target.checked ? [...value, m] : value.filter((x) => x !== m);
              if (next.length) onChange(modes.filter((x) => next.includes(x)));
            }}
          />
          {MODE_LABELS[m] ?? m}
        </label>
      ))}
    </div>
  );
}

/** Hebrew message for a Supabase/RPC error. */
export function rpcError(err: { message?: string; code?: string } | null): string {
  const msg = err?.message ?? "";
  if (err?.code === "42501") return "אין הרשאה לפעולה הזאת. נסו להתחבר מחדש.";
  if (/overlap|חופף/i.test(msg)) return "יש חפיפה עם חלון או שיעור קיים. בדקו את השעות.";
  if (/past|עבר/i.test(msg)) return "אי אפשר לשנות זמינות בתאריך שעבר.";
  if (err?.code === "23505") return "יש ביום הזה שיעור שנקבע, ולכן לא ניתן לסגור אותו כולו.";
  return "הפעולה לא הצליחה. נסו שוב.";
}
