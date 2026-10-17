import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/ui/RatingStars";
import VerifiedMark from "@/components/ui/VerifiedMark";
import { monogram } from "@/components/ui/Avatar";
import LiveAvailability from "@/components/market/LiveAvailability";
import SaveButton from "@/components/market/SaveButton";
import { availabilityLabel } from "@/lib/availability-label";
import { teacherCardLines } from "@/lib/teacher-card";
import type { AvailabilitySlot, TeacherCard as TeacherCardData } from "@/lib/types";

export type TeacherCardVariant = "card" | "auto" | "wall";

interface TeacherCardProps {
  teacher: TeacherCardData;
  /** First open slot in the next 7 days; drives the "יש מקום…" label. */
  nextSlot?: AvailabilitySlot | null;
  /**
   * "card": grid card (§8.2). "auto": compact row below md (768px), card from
   * md up — one DOM tree, responsive classes. "wall": photo + name + subject.
   */
  variant?: TeacherCardVariant;
  /** Set on above-the-fold rails so LCP images load eagerly. */
  priority?: boolean;
}

const NUM = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });

/** Photo, or a serif monogram on the soft action tint (spec §7.4). */
function Photo({
  teacher,
  sizes,
  priority,
  monoClass = "",
}: {
  teacher: TeacherCardData;
  sizes: string;
  priority: boolean;
  monoClass?: string;
}) {
  if (teacher.avatar_url) {
    return (
      <Image
        src={teacher.avatar_url}
        alt={`${teacher.display_name}, מורה ל${teacher.subjects[0] ?? "שיעורים פרטיים"}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[250ms] ease-[var(--ease)] group-hover:scale-[1.035]"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={teacher.display_name}
      className="absolute inset-0 grid place-items-center bg-action-soft"
    >
      <span
        aria-hidden="true"
        className={`font-ed relative text-[80px] font-black leading-none text-action ${monoClass}`}
      >
        {monogram(teacher.display_name)}
      </span>
    </div>
  );
}

// The marketplace's most-seen component. Information order mirrors how people
// decide: face → availability → name + verified + rating → what they teach →
// experience → where + price. The whole card is one link; the save heart sits
// outside it (absolutely positioned) so it never navigates.
export default function TeacherCard({
  teacher,
  nextSlot = null,
  variant = "card",
  priority = false,
}: TeacherCardProps) {
  const lines = teacherCardLines(teacher);
  const available = nextSlot ? availabilityLabel(nextSlot.start_at, new Date()) : null;
  const href = `/tutors/${teacher.id}`;
  const name = teacher.display_name;

  if (variant === "wall") {
    return (
      <article className="group relative rounded-[var(--r-lg)] bg-surface p-2 shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
        <Link
          href={href}
          className="block rounded-[var(--r-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--r-md)] bg-canvas">
            <Photo
              teacher={teacher}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            />
          </div>
          <div className="px-2 pb-2">
          <h3 className="mt-3 flex min-w-0 items-center gap-1.5 text-base font-bold leading-snug text-ink">
            <span className="min-w-0 truncate" title={name}>
              {name}
            </span>
            {teacher.is_verified && <VerifiedMark />}
          </h3>
          {teacher.subjects[0] && (
            <p className="mt-0.5 truncate text-sm text-ink-2">{teacher.subjects[0]}</p>
          )}
          {nextSlot && (
            <LiveAvailability
              startIso={nextSlot.start_at}
              initialLabel={available}
              variant="green"
              className="mt-1"
            />
          )}
          </div>
        </Link>
        <div className="absolute end-4 top-4">
          <SaveButton teacherId={teacher.id} teacherName={name} />
        </div>
      </article>
    );
  }

  // "auto" adds the below-md row layout; "card" never gets those classes.
  const auto = variant === "auto";
  const row = (cls: string) => (auto ? cls : "");

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${row("max-md:rounded-[var(--r-md)] max-md:p-2.5")}`}
    >
      <Link
        href={href}
        className={`flex h-full flex-col rounded-[var(--r-lg)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-action ${row("max-md:flex-row max-md:gap-3 max-md:rounded-[var(--r-sm)]")}`}
      >
        {/* Photo 4:5 (row: 96×120). Card top corners come from the article clip. */}
        <div
          className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-canvas ${row("max-md:aspect-auto max-md:h-[120px] max-md:w-24 max-md:rounded-[var(--r-sm)]")}`}
        >
          <Photo
            teacher={teacher}
            priority={priority}
            monoClass={row("max-md:text-[40px]")}
            sizes={
              auto
                ? "(max-width: 767px) 96px, (max-width: 1200px) 33vw, 300px"
                : "(max-width: 640px) 72vw, (max-width: 1200px) 33vw, 300px"
            }
          />
          {nextSlot && (
            <LiveAvailability
              startIso={nextSlot.start_at}
              initialLabel={available}
              variant="pill"
              className={row("max-md:hidden")}
            />
          )}
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col px-4 pb-4 pt-3.5 ${row("max-md:p-0 max-md:py-0.5")}`}
        >
          {/* Line 1: name + verified ⟷ rating, sharing one baseline */}
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={`flex min-w-0 items-center gap-1.5 text-[17px] font-bold leading-[1.3] text-ink ${row("max-md:text-base")}`}
            >
              <span className="min-w-0 truncate" title={name}>
                {name}
              </span>
              {teacher.is_verified && <VerifiedMark />}
            </h3>
            <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
          </div>

          {teacher.subjects.length > 0 && (
            <ul className="mt-2 flex min-w-0 flex-wrap gap-1.5 overflow-hidden" style={{ maxHeight: 28 }}>
              {teacher.subjects.slice(0, 3).map((s, i) => (
                <li
                  key={s}
                  className={`truncate rounded-[var(--r-pill)] px-2.5 py-0.5 text-[13px] font-medium leading-6 ${
                    i === 0 ? "bg-tint-indigo text-tint-indigo-fg" : "bg-canvas text-ink-2"
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
          {lines.credentials && (
            <p className="mt-2 truncate text-sm leading-5 text-ink-3">{lines.credentials}</p>
          )}

          {/* Row layout: availability as green text instead of the photo pill */}
          {auto && nextSlot && (
            <LiveAvailability
              startIso={nextSlot.start_at}
              initialLabel={available}
              variant="green"
              className="mt-1 md:hidden"
            />
          )}

          {/* Flexible gap keeps the price row pinned to the bottom */}
          <div className={`min-h-3 flex-1 ${row("max-md:min-h-1")}`} />

          <div
            className={`mt-auto flex items-baseline justify-between gap-2 border-t border-dashed border-line pt-3 ${row("max-md:border-t-0 max-md:pt-1")}`}
          >
            <span className="min-w-0 truncate text-sm text-ink-2">{lines.where}</span>
            {lines.price != null && (
              <span className="shrink-0 whitespace-nowrap text-sm text-ink-3">
                <span
                  className={`ltr-isolate tnum text-xl font-extrabold text-brand-800 ${row("max-md:text-lg")}`}
                >
                  ₪{NUM.format(lines.price)}
                </span>{" "}
                לשעה
              </span>
            )}
          </div>
        </div>
      </Link>

      <div
        className={`absolute end-2.5 top-2.5 ${row("max-md:end-auto max-md:start-[14px] max-md:top-[14px]")}`}
      >
        <SaveButton teacherId={teacher.id} teacherName={name} />
      </div>
    </article>
  );
}
