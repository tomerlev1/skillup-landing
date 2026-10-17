import { BadgeCheck, CalendarClock, MapPin } from "lucide-react";
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

// Hero, direction C (spec §8.3.1): headline + search on the start side, a wall
// of four real teachers on the end side, on a soft brand wash (light, never a
// dark slab). Without a full wall it collapses to a single centred column.
export default function HeroWall({ categories, stats, wall, nextSlots }: HeroWallProps) {
  const hasWall = wall.length === 4;

  const proof = [
    stats.teachers > 0 && {
      icon: BadgeCheck,
      tone: "bg-tint-mint text-tint-mint-fg",
      text: (
        <>
          <b className="ltr-isolate tnum font-bold text-ink">{NUM.format(stats.teachers)}</b> מורים
          פעילים
        </>
      ),
    },
    stats.categories > 0 && {
      icon: CalendarClock,
      tone: "bg-tint-sky text-tint-sky-fg",
      text: (
        <>
          <b className="ltr-isolate tnum font-bold text-ink">{NUM.format(stats.categories)}</b> תחומי
          לימוד
        </>
      ),
    },
    {
      icon: MapPin,
      tone: "bg-tint-peach text-tint-peach-fg",
      text: <>אונליין או פנים אל פנים, בכל הארץ</>,
    },
  ].filter(Boolean) as { icon: typeof MapPin; tone: string; text: React.ReactNode }[];

  return (
    <section className="relative isolate overflow-hidden" style={{ background: "var(--hero-wash)" }}>
      {/* Soft decorative orbs — brand indigo + spark, light enough to stay calm */}
      <div aria-hidden="true" className="orb end-[-60px] top-[-80px] size-[380px] bg-brand-200/45" />
      <div aria-hidden="true" className="orb orb--slow start-[10%] top-[30%] size-[300px] bg-tint-peach/80" />

      <div
        className={`relative mx-auto px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:pb-20 ${
          hasWall
            ? "grid max-w-[1280px] items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16"
            : "max-w-[780px] text-center"
        }`}
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-surface/80 px-3.5 py-1.5 text-sm font-medium text-ink-2 shadow-[var(--shadow-card)] ring-1 ring-line/60 backdrop-blur">
            <span className="size-2 rounded-full bg-ok" aria-hidden="true" />
            שיעורים פרטיים בכל תחום, בעברית
          </span>

          <h1 className="font-ed mt-5 text-[clamp(40px,6vw,68px)] font-black leading-[1.05] text-balance text-ink">
            ללמוד עם הטובים{" "}
            <span className="relative isolate inline-block text-action">
              באמת.
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.34em] rounded-[var(--r-pill)] bg-tint-peach"
              />
            </span>
          </h1>
          <p
            className={`mt-5 max-w-[540px] text-lg leading-relaxed text-ink-2 sm:text-xl ${
              hasWall ? "" : "mx-auto"
            }`}
          >
            מורים שבדקנו, מחירים ברורים וזמינות אמיתית. קובעים ישירות מול המורה.
          </p>

          {/* z-20 keeps the suggestions panel above the wall on mobile */}
          <div className={`relative z-20 mt-8 max-w-[640px] ${hasWall ? "" : "mx-auto"}`}>
            <SearchPill categories={categories} />
          </div>

          <ul
            className={`mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-ink-2 ${
              hasWall ? "" : "justify-center"
            }`}
          >
            {proof.map(({ icon: Icon, tone, text }, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className={`grid size-8 shrink-0 place-items-center rounded-[var(--r-pill)] ${tone}`}>
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {hasWall && (
          <div className="relative mx-auto w-full max-w-[460px] lg:me-0">
            {/* Brand disc behind the floating cards */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-6 bottom-6 -z-10 rounded-[var(--r-lg)] bg-[linear-gradient(160deg,var(--c-brand-100)_0%,var(--c-brand-50)_45%,var(--c-tint-peach)_100%)] shadow-[var(--shadow-card)] ring-1 ring-brand-200/70 lg:inset-x-10"
            />
            <div
              aria-hidden="true"
              className="float-y absolute -top-3 end-10 -z-10 size-14 rotate-12 rounded-[var(--r-md)] bg-tint-peach"
            />
            <div
              aria-hidden="true"
              className="float-y absolute -bottom-2 start-8 -z-10 size-11 rounded-full bg-tint-mint [animation-delay:-3s]"
            />
            <ul className="flex flex-col gap-3 pt-12 pb-[68px]">
              {wall.map((t, i) => (
                <li
                  key={t.id}
                  className={`w-[88%] ${i % 2 === 0 ? "self-start" : "self-end"}`}
                >
                  <TeacherCard
                    teacher={t}
                    variant="wall"
                    nextSlot={nextSlots[t.id] ?? null}
                    priority={i < 2}
                  />
                </li>
              ))}
            </ul>
            <p className="absolute inset-x-0 bottom-[30px] text-center text-[13px] font-semibold text-tint-indigo-fg">
              חלק מהמורים שמחכים לכם
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
