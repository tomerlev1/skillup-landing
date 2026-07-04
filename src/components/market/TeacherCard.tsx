import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import RatingStars from "@/components/ui/RatingStars";
import SaveButton from "@/components/market/SaveButton";
import { formatPrice, lessonModeLabel } from "@/lib/format";
import type { TeacherCard as TeacherCardData } from "@/lib/types";

interface TeacherCardProps {
  teacher: TeacherCardData;
  /** Set on above-the-fold rails so LCP images load eagerly. */
  priority?: boolean;
}

// Marketplace listing card (Airbnb anatomy): 4:5 portrait, borderless at
// rest, image zoom on hover, badge pill top-start, save heart top-end,
// then name / subjects / city / rating+price meta lines.
export default function TeacherCard({ teacher, priority = false }: TeacherCardProps) {
  const image = teacher.card_image_url ?? teacher.avatar_url;
  const subjectsLine = teacher.subjects.slice(0, 3).join(" · ");
  const modesLine = (teacher.lesson_modes ?? [])
    .map(lessonModeLabel)
    .join(" · ");

  return (
    <article className="mk-card group relative">
      <Link
        href={`/tutors/${teacher.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-50">
          {image ? (
            <Image
              src={image}
              alt={`${teacher.display_name} — מורה ל${teacher.subjects[0] ?? "שיעורים פרטיים"}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="mk-card-img object-cover"
              priority={priority}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-brand-50 font-display text-5xl font-bold text-brand-300">
              {teacher.display_name.slice(0, 1)}
            </div>
          )}

          {teacher.is_verified && (
            <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[var(--mk-ink)] shadow-sm">
              <BadgeCheck size={12} className="text-[var(--mk-ink)]" />
              מורה מאומת
            </span>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-[var(--mk-ink)]">
              {teacher.display_name}
            </h3>
            <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
          </div>

          {subjectsLine && (
            <p className="truncate text-sm text-[var(--mk-ink-3)]">{subjectsLine}</p>
          )}

          <p className="flex items-center gap-1 truncate text-sm text-[var(--mk-ink-3)]">
            {teacher.city_name && (
              <>
                <MapPin size={13} aria-hidden="true" />
                <span>{teacher.city_name}</span>
              </>
            )}
            {teacher.city_name && modesLine && <span aria-hidden="true"> · </span>}
            {modesLine && <span className="truncate">{modesLine}</span>}
          </p>

          {teacher.hourly_rate != null && (
            <p className="pt-0.5 text-sm text-[var(--mk-ink)]">
              <span className="ltr-isolate tnum font-semibold">
                {formatPrice(teacher.hourly_rate)}
              </span>{" "}
              לשעה
            </p>
          )}
        </div>
      </Link>

      <div className="absolute top-3 end-3">
        <SaveButton teacherId={teacher.id} teacherName={teacher.display_name} />
      </div>
    </article>
  );
}
