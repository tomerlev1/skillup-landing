import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  GraduationCap,
  Lightbulb,
  PencilLine,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { GoalTile } from "@/lib/data/home";

// Each goal gets its own soft tint so the row reads at a glance.
const STYLE: Record<string, { icon: LucideIcon; tone: string; sub: string }> = {
  "בגרות": { icon: GraduationCap, tone: "bg-tint-indigo text-tint-indigo-fg", sub: "כל המקצועות והיחידות" },
  "פסיכומטרי": { icon: PencilLine, tone: "bg-tint-peach text-tint-peach-fg", sub: "כמותי, מילולי ואנגלית" },
  "לשפר ציון": { icon: TrendingUp, tone: "bg-tint-mint text-tint-mint-fg", sub: "מתמטיקה, מדעים ועוד" },
  "ללמוד משהו חדש": { icon: Lightbulb, tone: "bg-tint-sun text-tint-sun-fg", sub: "מוזיקה, בישול, תכנות" },
  "למבוגרים": { icon: Coffee, tone: "bg-tint-lilac text-tint-lilac-fg", sub: "שפות ומיומנויות" },
};

// "מה המטרה?" — entry by need, not by category.
export default function GoalTiles({ goals }: { goals: GoalTile[] }) {
  if (goals.length === 0) return null;
  return (
    <section className="reveal mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 sm:pt-8">
      <p className="text-sm font-semibold text-action">מתחילים מהמטרה</p>
      <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-balance text-ink sm:text-[36px]">
        מה המטרה שלכם?
      </h2>
      <ul className="mt-7 grid grid-cols-2 gap-3 min-[900px]:grid-cols-5 lg:gap-4">
        {goals.map((g, i) => {
          const s = STYLE[g.label] ?? { icon: Lightbulb, tone: "bg-tint-indigo text-tint-indigo-fg", sub: "" };
          const Icon = s.icon;
          return (
            <li key={g.label} className={i === goals.length - 1 ? "max-[899px]:col-span-2" : ""}>
              <Link
                href={g.href}
                className="group flex h-full flex-col gap-4 rounded-[var(--r-lg)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:p-5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className={`grid size-12 place-items-center rounded-[var(--r-md)] ${s.tone}`}>
                  <Icon size={24} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-lg font-bold leading-snug text-ink">{g.label}</span>
                    {s.sub && <span className="mt-0.5 block text-sm text-ink-3">{s.sub}</span>}
                  </span>
                  <ArrowLeft
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mb-0.5 shrink-0 text-ink-3 transition-[transform,color] duration-200 ease-[var(--ease)] group-hover:-translate-x-1 group-hover:text-action"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
