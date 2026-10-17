import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import RatingStars from "@/components/ui/RatingStars";
import VerifiedMark from "@/components/ui/VerifiedMark";
import { monogram } from "@/components/ui/Avatar";
import LiveAvailability from "@/components/market/LiveAvailability";
import SaveButton from "@/components/market/SaveButton";
import { availabilityLabel } from "@/lib/availability-label";
import { teacherCardLines } from "@/lib/teacher-card";
import type { AvailabilitySlot, TeacherCard as TeacherCardData } from "@/lib/types";

/**
 * "list": horizontal marketplace row (search, city, category, saved).
 * "card": compact vertical card for rails.
 * "wall": small floating profile card for the home hero.
 * "auto": legacy alias of "list".
 */
export type TeacherCardVariant = "card" | "list" | "auto" | "wall";

interface TeacherCardProps {
  teacher: TeacherCardData;
  /** First open slot in the next 7 days; drives the "יש מקום…" label. */
  nextSlot?: AvailabilitySlot | null;
  variant?: TeacherCardVariant;
  /** Set on above-the-fold items so LCP images load eagerly. */
  priority?: boolean;
}

const NUM = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });

function Photo({
  teacher,
  sizes,
  priority,
  monoSize,
}: {
  teacher: TeacherCardData;
  sizes: string;
  priority: boolean;
  monoSize: string;
}) {
  if (teacher.avatar_url) {
    return (
      <Image
        src={teacher.avatar_url}
        alt={`${teacher.display_name}, מורה ל${teacher.subjects[0] ?? "שיעורים פרטיים"}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 ease-[var(--ease)] group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={teacher.display_name}
      className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-100 to-tint-peach"
    >
      <span aria-hidden="true" className={`font-black leading-none text-action ${monoSize}`}>
        {monogram(teacher.display_name)}
      </span>
    </div>
  );
}

function Price({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span className="whitespace-nowrap text-sm text-ink-3">
      <span
        className={`ltr-isolate tnum font-extrabold text-ink ${big ? "text-[22px]" : "text-lg"}`}
      >
        ₪{NUM.format(value)}
      </span>{" "}
      לשעה
    </span>
  );
}

function SubjectChips({ subjects, max = 3 }: { subjects: string[]; max?: number }) {
  if (subjects.length === 0) return null;
  return (
    <ul className="flex min-w-0 flex-wrap gap-1.5">
      {subjects.slice(0, max).map((s, i) => (
        <li
          key={s}
          className={`max-w-full truncate rounded-[var(--r-pill)] px-2.5 py-1 text-[13px] font-semibold leading-none ${
            i === 0 ? "bg-tint-indigo text-tint-indigo-fg" : "bg-canvas text-ink-2"
          }`}
        >
          {s}
        </li>
      ))}
      {subjects.length > max && (
        <li className="rounded-[var(--r-pill)] bg-canvas px-2.5 py-1 text-[13px] font-semibold leading-none text-ink-3">
          +{subjects.length - max}
        </li>
      )}
    </ul>
  );
}

// The marketplace's most-seen component. The whole card is one link to the
// profile; the save heart sits outside it so it never navigates.
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
  const kind = variant === "auto" ? "list" : variant;

  /* ---------- Hero mini card ---------- */
  if (kind === "wall") {
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-[var(--r-md)] bg-surface p-3 pe-4 shadow-[var(--shadow-lift)] ring-1 ring-line/60 transition-transform duration-200 ease-[var(--ease)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-canvas ring-2 ring-surface">
          <Photo teacher={teacher} priority={priority} sizes="56px" monoSize="text-2xl" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5 text-[15px] font-bold leading-tight text-ink">
            <span className="truncate">{name}</span>
            {teacher.is_verified && <VerifiedMark size={16} />}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-2">
            {teacher.subjects[0] ?? "שיעורים פרטיים"}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
          </span>
        </span>
        {lines.price != null && (
          <span className="shrink-0 self-start rounded-[var(--r-sm)] bg-tint-indigo px-2 py-1 text-[13px] font-bold text-tint-indigo-fg">
            <span className="ltr-isolate tnum">₪{NUM.format(lines.price)}</span>
          </span>
        )}
      </Link>
    );
  }

  /* ---------- Horizontal list row ---------- */
  if (kind === "list") {
    return (
      <article className="group relative rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[box-shadow,transform] duration-200 ease-[var(--ease)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <Link
          href={href}
          className="flex gap-4 rounded-[var(--r-lg)] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:gap-5 sm:p-5"
        >
          {/* Photo */}
          <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[var(--r-md)] bg-canvas sm:size-[132px]">
            <Photo
              teacher={teacher}
              priority={priority}
              sizes="(max-width: 640px) 88px, 132px"
              monoSize="text-4xl sm:text-5xl"
            />
          </div>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3 max-md:pe-9">
              <div className="min-w-0">
                <h3 className="flex min-w-0 items-center gap-1.5 text-lg font-extrabold leading-tight text-ink sm:text-xl">
                  <span className="truncate" title={name}>
                    {name}
                  </span>
                  {teacher.is_verified && <VerifiedMark size={18} />}
                </h3>
                <div className="mt-1.5">
                  <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
                </div>
              </div>
              {/* Price — top end on wide screens */}
              {lines.price != null && (
                <div className="hidden shrink-0 text-end md:block">
                  <Price value={lines.price} big />
                </div>
              )}
            </div>

            <div className="mt-3">
              <SubjectChips subjects={teacher.subjects} />
            </div>

            {teacher.bio && (
              <p className="mt-3 hidden text-[15px] leading-relaxed text-ink-2 sm:line-clamp-2">
                {teacher.bio}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-sm text-ink-2">
              {lines.where && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-ink-3" />
                  <span className="truncate">{lines.where}</span>
                </span>
              )}
              {lines.credentials && <span className="text-ink-3">{lines.credentials}</span>}
              {nextSlot && (
                <LiveAvailability startIso={nextSlot.start_at} initialLabel={available} variant="green" />
              )}
            </div>

            {/* Mobile footer: price + go */}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 md:hidden">
              {lines.price != null ? <Price value={lines.price} /> : <span />}
              <span className="inline-flex items-center gap-0.5 text-sm font-bold text-action">
                לפרופיל
                <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
              </span>
            </div>
          </div>

          {/* Desktop CTA column */}
          <div className="hidden w-[150px] shrink-0 flex-col items-stretch justify-end gap-2 border-s border-line ps-5 md:flex">
            <span className="inline-flex h-11 items-center justify-center rounded-[var(--r-pill)] bg-action text-sm font-bold text-on-action shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] transition-colors group-hover:bg-action-hover">
              צפייה בפרופיל
            </span>
            <span className="text-center text-[13px] text-ink-3">קביעה ישירה מול המורה</span>
          </div>
        </Link>

        {/* Top-left (RTL end): above the CTA column on desktop, card corner on mobile */}
        <div className="absolute end-3 top-3 sm:end-4 sm:top-4">
          <SaveButton teacherId={teacher.id} teacherName={name} variant="plain" />
        </div>
      </article>
    );
  }

  /* ---------- Compact vertical card (rails) ---------- */
  return (
    <article className="group relative h-full overflow-hidden rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link
        href={href}
        className="flex h-full flex-col rounded-[var(--r-lg)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-action"
      >
        <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-canvas">
          <Photo
            teacher={teacher}
            priority={priority}
            monoSize="text-6xl"
            sizes="(max-width: 640px) 72vw, (max-width: 1200px) 33vw, 290px"
          />
          {nextSlot && <LiveAvailability startIso={nextSlot.start_at} initialLabel={available} variant="pill" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex min-w-0 items-center gap-1.5 text-base font-extrabold leading-tight text-ink">
              <span className="truncate" title={name}>
                {name}
              </span>
              {teacher.is_verified && <VerifiedMark />}
            </h3>
            <RatingStars value={teacher.rating_avg} count={teacher.review_count} />
          </div>
          <div className="mt-2.5">
            <SubjectChips subjects={teacher.subjects} max={2} />
          </div>
          <div className="min-h-3 flex-1" />
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <span className="min-w-0 truncate text-[13px] text-ink-3">{lines.where}</span>
            {lines.price != null && <Price value={lines.price} />}
          </div>
        </div>
      </Link>

      <div className="absolute end-3 top-3">
        <SaveButton teacherId={teacher.id} teacherName={name} />
      </div>
    </article>
  );
}
