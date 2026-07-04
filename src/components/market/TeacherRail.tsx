import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TeacherCard from "@/components/market/TeacherCard";
import type { TeacherCard as TeacherCardData } from "@/lib/types";

interface TeacherRailProps {
  title: string;
  teachers: TeacherCardData[];
  moreHref?: string;
  moreLabel?: string;
  priorityImages?: boolean;
}

// Horizontal snap rail on mobile, 4-up grid on desktop. "See all" is a
// quiet text link — the cards are the attention target.
export default function TeacherRail({
  title,
  teachers,
  moreHref,
  moreLabel = "לכל המורים",
  priorityImages = false,
}: TeacherRailProps) {
  if (teachers.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
          {title}
        </h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
          >
            {moreLabel}
            <ChevronLeft size={15} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6">
        {teachers.slice(0, 8).map((t, i) => (
          <div key={t.id} className="w-[70vw] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <TeacherCard teacher={t} priority={priorityImages && i < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
