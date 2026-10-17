import Link from "next/link";
import GatedLink from "@/components/market/GatedLink";
import { bookHref } from "@/lib/booking";
import { formatDateShort, formatTime, formatWeekday } from "@/lib/format";
import type { AvailabilitySlot } from "@/lib/types";

interface AvailabilityPreviewProps {
  teacherId: string;
  slots: AvailabilitySlot[];
}

const MAX_DAYS = 4;
const MAX_PER_DAY = 5;

// "זמינות קרובה" (spec §8.5): up to 4 days, every time is a pill that goes
// straight to the booking wizard with that slot preselected. Guests are sent
// through login and come back with the same ?slot= (GatedLink keeps it in next).
export default function AvailabilityPreview({ teacherId, slots }: AvailabilityPreviewProps) {
  const byDay = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const day = slot.start_at.slice(0, 10);
    const list = byDay.get(day);
    if (list) list.push(slot);
    else if (byDay.size < MAX_DAYS) byDay.set(day, [slot]);
  }
  if (byDay.size === 0) return null;

  return (
    <section aria-labelledby="availability-h">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="availability-h" className="font-ed text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
          זמינות קרובה
        </h2>
        <Link
          href={bookHref(teacherId)}
          className="inline-flex min-h-11 items-center text-sm font-medium text-action hover:underline"
        >
          לכל המועדים
        </Link>
      </div>
      <div className="mt-3 space-y-3">
        {[...byDay.entries()].map(([day, daySlots]) => (
          <div key={day} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 text-sm sm:w-32 font-medium text-ink">
              {formatWeekday(daySlots[0].start_at)}, {formatDateShort(daySlots[0].start_at)}
            </span>
            <div className="flex flex-wrap gap-2">
              {daySlots.slice(0, MAX_PER_DAY).map((slot) => (
                <GatedLink
                  key={slot.id}
                  inline
                  href={bookHref(teacherId, slot.id)}
                  className="tnum inline-flex h-11 min-w-[72px] cursor-pointer items-center justify-center rounded-[var(--r-pill)] border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-action hover:bg-action-soft"
                >
                  {formatTime(slot.start_at)}
                </GatedLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
