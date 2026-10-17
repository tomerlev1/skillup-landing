"use client";

import Link from "next/link";
import { CalendarPlus, Check } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { buildIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";
import type { AvailabilitySlot } from "@/lib/types";

export interface BookingOutcome {
  /** Slots whose create_booking call succeeded, in time order. */
  createdSlots: AvailabilitySlot[];
  failed: number;
  anyConfirmed: boolean;
  /** Ids of created slots whose booking came back already confirmed. */
  confirmedSlotIds: string[];
}

interface BookingSuccessProps {
  teacher: { id: string; display_name: string; avatar_url: string | null };
  subjectName: string;
  outcome: BookingOutcome;
}

const ICS_FILE_NAME = "skillup-lesson.ics";

/** Download a client-built .ics through a temporary blob: URL. */
function downloadIcs(events: CalendarEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ICS_FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Post-submit screen (spec §8.6): what happens next, add to calendar, and the
// two ways forward. No response-time promise: there is no data behind one.
export default function BookingSuccess({ teacher, subjectName, outcome }: BookingSuccessProps) {
  const name = teacher.display_name;
  const confirmed = new Set(outcome.confirmedSlotIds);
  // Every created booking goes into the one .ics. Until the teacher confirms,
  // the event says it is a request.
  const events: CalendarEvent[] = outcome.createdSlots.map((slot) => ({
    uid: `${slot.id}@skillup`,
    title: confirmed.has(slot.id) ? `שיעור עם ${name}` : `בקשת שיעור עם ${name}`,
    startIso: slot.start_at,
    endIso: slot.end_at,
    description: subjectName
      ? `${subjectName}. התשלום והביטול נקבעים ישירות מול ${name}.`
      : `התשלום והביטול נקבעים ישירות מול ${name}.`,
  }));
  const event = events[0] ?? null;

  const timeline = [
    { label: "נשלח", done: true },
    { label: `${name} מאשר את הבקשה`, done: outcome.anyConfirmed },
    { label: "נעדכן אתכם כאן ובאזור השיעורים שלי", done: false },
  ];

  const secondaryBtn =
    "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--r-pill)] border border-line bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-ink";

  return (
    <div className="rounded-[var(--r-md)] border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <Avatar src={teacher.avatar_url} name={name} size={56} />
        <h1 className="font-ed text-2xl font-bold leading-tight text-ink sm:text-[28px]">
          {outcome.anyConfirmed ? "השיעור נקבע" : `הבקשה אצל ${name}`}
        </h1>
      </div>

      <ol className="mt-6 space-y-0" aria-label="מה קורה עכשיו">
        {timeline.map((item, i) => (
          <li key={item.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < timeline.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-7 bottom-0 start-[13px] w-px bg-line"
              />
            )}
            <span
              aria-hidden="true"
              className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                item.done ? "border-ok bg-ok text-surface" : "border-line bg-surface text-ink-3"
              }`}
            >
              {item.done ? (
                <Check size={16} strokeWidth={1.75} />
              ) : (
                <span className="tnum text-xs font-semibold">{i + 1}</span>
              )}
            </span>
            <span className={`pt-0.5 text-[15px] ${item.done ? "font-medium text-ink" : "text-ink-2"}`}>
              {item.label}
              {item.done && <span className="sr-only"> (הושלם)</span>}
            </span>
          </li>
        ))}
      </ol>

      {outcome.failed > 0 && (
        <p className="mt-5 rounded-[var(--r-sm)] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink">
          <span className="tnum">{outcome.failed}</span> מהמועדים לא נשלחו, כנראה נתפסו בינתיים.
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/bookings"
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--r-pill)] bg-action px-6 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
        >
          לשיעורים שלי
        </Link>
        {event && (
          <button type="button" onClick={() => downloadIcs(events)} className={secondaryBtn}>
            <CalendarPlus strokeWidth={1.75} size={20} aria-hidden="true" />
            הוספה ליומן
          </button>
        )}
        <Link href={`/messages/new?teacher=${teacher.id}`} className={secondaryBtn}>
          שליחת הודעה ל{name}
        </Link>
      </div>

      {event && (
        <p className="mt-4 text-sm text-ink-3">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-medium text-ink-2 underline hover:text-ink"
          >
            {events.length > 1 ? "Google Calendar (המועד הראשון)" : "Google Calendar"}
          </a>
        </p>
      )}
    </div>
  );
}
