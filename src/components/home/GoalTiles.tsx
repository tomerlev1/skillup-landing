import Link from "next/link";
import {
  ChevronLeft,
  Coffee,
  GraduationCap,
  Lightbulb,
  PencilLine,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { GoalTile } from "@/lib/data/home";

const ICONS: Record<string, LucideIcon> = {
  "בגרות": GraduationCap,
  "פסיכומטרי": PencilLine,
  "לשפר ציון": TrendingUp,
  "ללמוד משהו חדש": Lightbulb,
  "למבוגרים": Coffee,
};

// "מה המטרה?" — five quiet tiles (ink on canvas, no category colours).
export default function GoalTiles({ goals }: { goals: GoalTile[] }) {
  if (goals.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-14 sm:px-6 sm:pt-16">
      <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
        מה המטרה?
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {goals.map((g, i) => {
          const Icon = ICONS[g.label] ?? Lightbulb;
          return (
            <li key={g.label} className={i === goals.length - 1 ? "max-sm:col-span-2" : ""}>
              <Link
                href={g.href}
                className="group flex h-full min-h-[64px] items-center gap-2.5 rounded-[var(--r-md)] border border-line bg-surface px-3 py-3 sm:gap-3 sm:px-4 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="grid size-9 shrink-0 sm:size-10 place-items-center rounded-[var(--r-sm)] bg-canvas text-ink">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-balance text-ink sm:text-base">{g.label}</span>
                <ChevronLeft
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="shrink-0 text-ink-3 transition-transform max-sm:hidden duration-200 ease-[var(--ease)] group-hover:-translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
