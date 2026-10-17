"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import GatedLink from "@/components/market/GatedLink";
import RatingStars from "@/components/ui/RatingStars";
import { formatPrice, lessonModeLabel, lessonModePrice } from "@/lib/format";
import { bookHref } from "@/lib/booking";
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
  const bookUrl = bookHref(teacherId);
  const messageHref = `/messages/new?teacher=${teacherId}`;

  // Lift the support launcher above the mobile bottom bar while it exists.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      if (mq.matches) document.body.style.setProperty("--sticky-bar-h", "76px");
      else document.body.style.removeProperty("--sticky-bar-h");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.body.style.removeProperty("--sticky-bar-h");
    };
  }, []);

  // Full per-mode price = base hourly rate + mode surcharge.
  const modePrice = (mode: LessonMode): number | null =>
    lessonModePrice(mode, hourlyRate, lessonModePrices);

  // Headline "from" price = cheapest available mode (falls back to base).
  const modeFullPrices = lessonModes
    .map(modePrice)
    .filter((p): p is number => p != null);
  const fromPrice = modeFullPrices.length
    ? Math.min(...modeFullPrices)
    : hourlyRate;
  const hasRange =
    modeFullPrices.length > 1 &&
    Math.min(...modeFullPrices) !== Math.max(...modeFullPrices);

  return (
    <>
      {/* Desktop rail */}
      <div className="hidden rounded-[var(--r-md)] border border-line bg-surface p-6 shadow-[var(--shadow-lift)] lg:block">
        <div className="flex items-baseline justify-between gap-3">
          {fromPrice != null && (
            <p className="flex items-baseline gap-1.5 text-ink">
              {hasRange && (
                <span className="text-sm text-ink-3">החל מ־</span>
              )}
              <span className="ltr-isolate tnum text-2xl font-bold">
                {formatPrice(fromPrice)}
              </span>
              <span className="text-sm text-ink-3">לשעה</span>
            </p>
          )}
          <RatingStars value={ratingAvg} count={reviewCount} />
        </div>

        {lessonModes.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {lessonModes.map((mode) => {
              const price = modePrice(mode);
              return (
                <li
                  key={mode}
                  className="flex items-center justify-between text-sm text-ink-2"
                >
                  <span>{lessonModeLabel(mode)}</span>
                  {price != null && (
                    <span className="ltr-isolate tnum font-medium text-ink">
                      {formatPrice(price)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <GatedLink
          href={bookUrl}
          className="mt-5 h-12 w-full cursor-pointer rounded-[var(--r-pill)] bg-action text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
        >
          קביעת שיעור
        </GatedLink>
        <GatedLink
          href={messageHref}
          className="mt-2.5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--r-pill)] border border-ink text-sm font-semibold text-ink transition-colors hover:bg-action-soft"
        >
          <MessageCircle strokeWidth={1.75} size={16} />
          שליחת הודעה
        </GatedLink>

        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          התשלום והביטול נקבעים ישירות מול המורה. SkillUp לא גובה מכם כלום.
        </p>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
          <div>
            {fromPrice != null && (
              <p className="flex items-baseline gap-1 text-ink">
                {hasRange && (
                  <span className="text-sm text-ink-3">החל מ־</span>
                )}
                <span className="ltr-isolate tnum text-lg font-bold">
                  {formatPrice(fromPrice)}
                </span>
                <span className="text-sm text-ink-3">לשעה</span>
              </p>
            )}
            <RatingStars value={ratingAvg} count={reviewCount} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <GatedLink
              href={messageHref}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-[var(--r-pill)] border border-ink text-ink"
            >
              <MessageCircle strokeWidth={1.75} size={16} />
              <span className="sr-only">שליחת הודעה</span>
            </GatedLink>
            <GatedLink
              href={bookUrl}
              className="h-11 cursor-pointer rounded-[var(--r-pill)] bg-action px-6 text-sm font-semibold text-on-action"
            >
              קביעת שיעור
            </GatedLink>
          </div>
        </div>
      </div>
    </>
  );
}
