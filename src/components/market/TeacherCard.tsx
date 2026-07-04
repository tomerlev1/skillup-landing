import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, MapPin } from "lucide-react";
import RatingStars from "@/components/ui/RatingStars";
import SaveButton from "@/components/market/SaveButton";
import { formatPrice, lessonModeLabel } from "@/lib/format";
import type { TeacherCard as TeacherCardData } from "@/lib/types";

interface TeacherCardProps {
  teacher: TeacherCardData;
  /** Set on above-the-fold rails so LCP images load eagerly. */
  priority?: boolean;
}

// Marketplace listing card. Information order mirrors how people decide:
// face → name + rating → what they teach → where → how (mode chips) →
// price + profile action. Icon fills are inline styles — never utility
// classes — so they can't be dropped by CSS generation.
export default function TeacherCard({ teacher, priority = false }: TeacherCardProps) {
  // Cards show the tutor's FACE (avatar). Cover/background images belong
  // only to the profile-page header.
  const image = teacher.avatar_url;
  const subjectsLine = teacher.subjects.slice(0, 3).join(" · ");
  const modes = teacher.lesson_modes ?? [];

  return (
    <article className="mk-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--mk-hairline)] bg-white shadow-[var(--mk-shadow-soft)] transition-[box-shadow,border-color] duration-300 hover:border-brand-200 hover:shadow-[var(--mk-shadow)]">
      <Link
        href={`/tutors/${teacher.id}`}
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
      >
        {/* Inline aspect-ratio: geometry must survive any CSS caching issue */}
        <div
          className="relative w-full overflow-hidden bg-paper-50"
          style={{ aspectRatio: "1 / 1" }}
        >
          {image ? (
            <Image
              src={image}
              alt={`${teacher.display_name}, מורה ל${teacher.subjects[0] ?? "שיעורים פרטיים"}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="mk-card-img object-cover"
              priority={priority}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 via-paper-25 to-accent-50">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white/75 font-display text-3xl font-bold text-brand-500 shadow-sm ring-1 ring-black/[0.03]">
                {teacher.display_name.slice(0, 1)}
              </span>
            </div>
          )}

          {teacher.is_verified && (
            <span className="absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1.5 ps-2.5 pe-3 text-[11px] font-bold text-emerald-700 shadow-sm">
              <BadgeCheck
                size={16}
                strokeWidth={2.25}
                style={{ fill: "#10b981", color: "#ffffff" }}
                aria-hidden="true"
              />
              מורה מאומת
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          {/* Identity + quality */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-[var(--mk-ink)]">
              {teacher.display_name}
            </h3>
            <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
          </div>

          {/* What they teach */}
          {subjectsLine && (
            <p className="mt-0.5 truncate text-sm text-[var(--mk-ink-3)]">
              {subjectsLine}
            </p>
          )}

          {/* Where */}
          {teacher.city_name && (
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-[var(--mk-ink-3)]">
              <MapPin size={13} className="shrink-0" aria-hidden="true" />
              {teacher.city_name}
            </p>
          )}

          {/* How — lesson modes as their own chip row, not mixed with the address */}
          {modes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {modes.map((mode) => (
                <span
                  key={mode}
                  className="rounded-md bg-paper-50 px-1.5 py-0.5 text-[11px] font-medium text-[var(--mk-ink-2)]"
                >
                  {lessonModeLabel(mode)}
                </span>
              ))}
            </div>
          )}

          {/* Spacer: keeps the price row pinned to the bottom on short cards */}
          <div className="min-h-3.5 flex-1" />

          {/* Price + action — bottom row, vertically centered */}
          <div className="mk-hairline-t flex items-center justify-between gap-2 pt-3.5">
            {teacher.hourly_rate != null ? (
              <span className="inline-flex h-9 items-center rounded-full bg-brand-50 px-3.5 text-sm text-brand-800">
                <span className="ltr-isolate tnum font-bold">
                  {formatPrice(teacher.hourly_rate)}
                </span>
                <span className="ms-1 font-medium">לשעה</span>
              </span>
            ) : (
              <span />
            )}
            <span className="hidden h-9 items-center gap-0.5 rounded-full border border-brand-200 px-3.5 text-[13px] font-semibold text-brand-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-50 min-[400px]:inline-flex">
              לפרופיל
              <ChevronLeft size={14} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute top-3 end-3">
        <SaveButton teacherId={teacher.id} teacherName={teacher.display_name} />
      </div>
    </article>
  );
}
