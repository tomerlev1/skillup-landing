import SearchPill from "@/components/market/SearchPill";
import TeacherCard from "@/components/market/TeacherCard";
import type { AvailabilitySlot, Category, TeacherCard as TeacherCardData } from "@/lib/types";

interface HeroWallProps {
  categories: Category[];
  stats: { teachers: number; categories: number };
  wall: TeacherCardData[];
  nextSlots: Record<string, AvailabilitySlot>;
}

const NUM = new Intl.NumberFormat("he-IL");

function Num({ value }: { value: number }) {
  return <b className="ltr-isolate tnum font-semibold text-ink">{NUM.format(value)}</b>;
}

// Hero, direction C (spec §8.3.1): text + search on the start side, a wall of
// four real teachers on the end side. Without a full wall it collapses to a
// single centred column.
export default function HeroWall({ categories, stats, wall, nextSlots }: HeroWallProps) {
  const hasWall = wall.length === 4;

  return (
    <section className="border-b border-line bg-surface">
      <div
        className={`mx-auto px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:pb-16 ${
          hasWall
            ? "grid max-w-[1280px] items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
            : "max-w-[760px] text-center"
        }`}
      >
        <div>
          <h1 className="font-ed text-[clamp(36px,5vw,56px)] font-black leading-[1.1] text-balance text-ink">
            ללמוד עם הטובים <span className="text-spark-text">באמת.</span>
          </h1>
          <p
            className={`mt-4 max-w-[520px] text-base leading-relaxed text-ink-2 sm:text-lg ${
              hasWall ? "" : "mx-auto"
            }`}
          >
            מורים שבדקנו, מחירים ברורים וזמינות אמיתית. קובעים ישירות מול המורה.
          </p>

          {/* z-20 keeps the suggestions panel above the wall on mobile */}
          <div className={`relative z-20 mt-7 max-w-[620px] sm:mt-8 ${hasWall ? "" : "mx-auto"}`}>
            <SearchPill categories={categories} />
          </div>

          <p className="mt-5 text-sm text-ink-2">
            {stats.teachers > 0 && (
              <>
                <Num value={stats.teachers} /> מורים ·{" "}
              </>
            )}
            {stats.categories > 0 && (
              <>
                <Num value={stats.categories} /> תחומים ·{" "}
              </>
            )}
            כל הארץ
          </p>
        </div>

        {hasWall && (
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:w-full lg:max-w-[440px] lg:grid-cols-2 lg:gap-4 lg:justify-self-end lg:overflow-visible lg:px-0 lg:pb-[18px]">
            {wall.map((t, i) => (
              <div
                key={t.id}
                className="w-[44vw] max-w-[220px] shrink-0 snap-start lg:w-auto lg:max-w-none lg:even:translate-y-[18px]"
              >
                <TeacherCard
                  teacher={t}
                  variant="wall"
                  nextSlot={nextSlots[t.id] ?? null}
                  priority={i < 2}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
