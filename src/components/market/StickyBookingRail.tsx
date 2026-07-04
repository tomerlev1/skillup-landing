"use client";

import { MessageCircle, ShieldCheck } from "lucide-react";
import GatedLink from "@/components/market/GatedLink";
import RatingStars from "@/components/ui/RatingStars";
import { formatPrice, lessonModeLabel } from "@/lib/format";
import type { LessonMode } from "@/lib/types";

interface StickyBookingRailProps {
  teacherId: string;
  hourlyRate: number | null;
  lessonModes: LessonMode[];
  lessonModePrices: Partial<Record<string, number>> | null;
  ratingAvg: number;
  reviewCount: number;
}

// The conversion element. Desktop: sticky rail beside the content (the
// LEFT column in RTL). Mobile: fixed bottom bar with price + one CTA.
// Mirrors Airbnb's reservation card — price, context, one indigo action.
export default function StickyBookingRail({
  teacherId,
  hourlyRate,
  lessonModes,
  lessonModePrices,
  ratingAvg,
  reviewCount,
}: StickyBookingRailProps) {
  const bookHref = `/tutors/${teacherId}/book`;
  const messageHref = `/messages/new?teacher=${teacherId}`;

  // iOS stores mode prices under legacy keys (teacher_location/student_location).
  const modePrice = (mode: LessonMode): number | null => {
    const p = lessonModePrices ?? {};
    const legacy: Record<LessonMode, string> = {
      online: "online",
      teacher_home: "teacher_location",
      student_home: "student_location",
    };
    return p[mode] ?? p[legacy[mode]] ?? null;
  };

  return (
    <>
      {/* Desktop rail */}
      <div className="mk-shadow hidden rounded-3xl border border-[var(--mk-hairline)] bg-white p-6 lg:block">
        <div className="flex items-baseline justify-between gap-3">
          {hourlyRate != null && (
            <p className="text-[var(--mk-ink)]">
              <span className="ltr-isolate tnum text-2xl font-bold">
                {formatPrice(hourlyRate)}
              </span>
              <span className="text-sm text-[var(--mk-ink-3)]"> לשעה</span>
            </p>
          )}
          <RatingStars value={ratingAvg} count={reviewCount} />
        </div>

        {lessonModes.length > 0 && (
          <ul className="mk-hairline-t mt-4 space-y-2 pt-4">
            {lessonModes.map((mode) => {
              const price = modePrice(mode);
              return (
                <li
                  key={mode}
                  className="flex items-center justify-between text-sm text-[var(--mk-ink-2)]"
                >
                  <span>{lessonModeLabel(mode)}</span>
                  {price != null && (
                    <span className="ltr-isolate tnum font-medium text-[var(--mk-ink)]">
                      {formatPrice(price)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <GatedLink
          href={bookHref}
          className="mt-5 h-12 w-full cursor-pointer rounded-full bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          הזמנת שיעור
        </GatedLink>
        <GatedLink
          href={messageHref}
          className="mt-2.5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--mk-ink)] text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
        >
          <MessageCircle size={16} />
          שליחת הודעה
        </GatedLink>

        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--mk-ink-3)]">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          התיאום נעשה ישירות מול המורה. המורה מאשר כל בקשת שיעור לפני שהיא
          נסגרת.
        </p>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--mk-hairline)] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
          <div>
            {hourlyRate != null && (
              <p className="text-[var(--mk-ink)]">
                <span className="ltr-isolate tnum text-lg font-bold">
                  {formatPrice(hourlyRate)}
                </span>
                <span className="text-xs text-[var(--mk-ink-3)]"> לשעה</span>
              </p>
            )}
            <RatingStars value={ratingAvg} count={reviewCount} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <GatedLink
              href={messageHref}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--mk-ink)] text-[var(--mk-ink)]"
            >
              <MessageCircle size={17} />
              <span className="sr-only">שליחת הודעה</span>
            </GatedLink>
            <GatedLink
              href={bookHref}
              className="h-11 cursor-pointer rounded-full bg-brand-600 px-6 text-sm font-semibold text-white"
            >
              הזמנת שיעור
            </GatedLink>
          </div>
        </div>
      </div>
    </>
  );
}
