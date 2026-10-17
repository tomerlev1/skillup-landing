import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TeacherCard from "@/components/market/TeacherCard";
import type { AvailabilitySlot, TeacherCard as TeacherCardData } from "@/lib/types";

interface TeacherRailProps {
  title: string;
  teachers: TeacherCardData[];
  /** Next open slot per teacher id (availability labels). */
  nextSlots?: Record<string, AvailabilitySlot>;
  moreHref?: string;
  moreLabel?: string;
  priorityImages?: boolean;
  /** Hide the rail when there are fewer teachers than this (default 4). */
  minCount?: number;
}

// Horizontal snap rail of cards on mobile, 3/4-up grid from sm. "See all" is
// a quiet text link — the cards are the attention target.
export default function TeacherRail({
  title,
  teachers,
  nextSlots,
  moreHref,
  moreLabel = "לכל המורים",
  priorityImages = false,
  minCount = 4,
}: TeacherRailProps) {
  if (teachers.length < minCount) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          {title}
        </h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink hover:underline"
          >
            {moreLabel}
            <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-5">
        {teachers.slice(0, 8).map((t, i) => (
          <div key={t.id} className="w-[72vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <TeacherCard
              teacher={t}
              variant="card"
              nextSlot={nextSlots?.[t.id] ?? null}
              priority={priorityImages && i < 4}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
