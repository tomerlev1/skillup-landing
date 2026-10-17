import Link from "next/link";
import { Award, CalendarCheck, Clock, Lock, Sparkles, Trophy, Users } from "lucide-react";
import type { Progress } from "@/lib/progress";

interface ProgressPanelProps {
  progress: Progress;
  role: "student" | "teacher";
  nextLesson: { when: string; peerName: string; subject: string | null } | null;
}

const NUM = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 });

// The learner's (or teacher's) dashboard: four stat tiles, a 6-month bar chart,
// the next lesson and milestone badges. Everything is derived from bookings.
export default function ProgressPanel({ progress, role, nextLesson }: ProgressPanelProps) {
  const isTeacher = role === "teacher";
  const max = Math.max(1, ...progress.monthly.map((m) => m.count));
  const thisMonth = progress.monthly.at(-1)?.count ?? 0;
  const lastMonth = progress.monthly.at(-2)?.count ?? 0;

  const tiles = [
    { icon: CalendarCheck, tone: "bg-tint-indigo text-tint-indigo-fg", value: NUM.format(progress.completed), label: isTeacher ? "שיעורים שלימדתי" : "שיעורים שהושלמו" },
    { icon: Clock, tone: "bg-tint-peach text-tint-peach-fg", value: NUM.format(progress.hours), label: isTeacher ? "שעות הוראה" : "שעות למידה" },
    { icon: Users, tone: "bg-tint-mint text-tint-mint-fg", value: NUM.format(progress.peers), label: isTeacher ? "תלמידים" : "מורים" },
    { icon: Sparkles, tone: "bg-tint-sky text-tint-sky-fg", value: NUM.format(progress.upcoming), label: "שיעורים קרובים" },
  ];

  const next = progress.nextMilestone;
  const prevTarget = [...progress.milestones].reverse().find((m) => m.achieved)?.target ?? 0;
  const toNext = next ? next.target - progress.completed : 0;
  const nextPct = next ? Math.round(((progress.completed - prevTarget) / (next.target - prevTarget)) * 100) : 100;

  return (
    <section className="rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-line/60 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-action">{isTeacher ? "ההוראה שלי" : "ההתקדמות שלי"}</p>
          <h2 className="font-ed mt-1 text-[24px] font-black leading-tight text-ink">
            {progress.completed === 0
              ? isTeacher
                ? "השיעור הראשון בדרך"
                : "המסע שלכם מתחיל כאן"
              : isTeacher
                ? "עבודה יפה, ממשיכים"
                : "כל הכבוד, אתם בתנופה"}
          </h2>
        </div>
        {thisMonth > 0 && thisMonth >= lastMonth && (
          <span className="rounded-pill bg-tint-mint px-3 py-1 text-[13px] font-bold text-tint-mint-fg">
            החודש: <span className="tnum">{thisMonth}</span> שיעורים
          </span>
        )}
      </div>

      {/* Stat tiles */}
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(({ icon: Icon, tone, value, label }) => (
          <li key={label} className="rounded-[var(--r-md)] bg-canvas p-4 ring-1 ring-line/50">
            <span className={`grid size-9 place-items-center rounded-[var(--r-sm)] ${tone}`}>
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="tnum mt-3 text-[26px] font-black leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-ink-2">{label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* 6-month chart */}
        <figure className="rounded-[var(--r-md)] bg-canvas p-5 ring-1 ring-line/50">
          <figcaption className="text-sm font-bold text-ink">שיעורים בחצי השנה האחרונה</figcaption>
          <div
            className="mt-5 flex h-40 items-end justify-between gap-2"
            role="img"
            aria-label={progress.monthly.map((m) => `${m.label}: ${m.count}`).join(", ")}
          >
            {progress.monthly.map((m, i) => {
              const h = m.count === 0 ? 4 : Math.max(10, Math.round((m.count / max) * 100));
              const current = i === progress.monthly.length - 1;
              return (
                <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className={`tnum text-[13px] font-bold ${m.count ? "text-ink" : "text-ink-3"}`}>
                    {m.count}
                  </span>
                  <span
                    className={`progress-bar w-full max-w-[44px] rounded-t-[var(--r-sm)] rounded-b-[4px] ${
                      current
                        ? "bg-[linear-gradient(180deg,#7C6CF6,#4F46E5)] shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)]"
                        : m.count
                          ? "bg-brand-200"
                          : "bg-line"
                    }`}
                    style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                  />
                  <span className={`text-[12px] ${current ? "font-bold text-action" : "text-ink-3"}`}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </figure>

        {/* Next lesson + milestone */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[var(--r-md)] bg-brand-50 p-5 ring-1 ring-brand-100">
            <p className="text-sm font-bold text-ink">השיעור הבא</p>
            {nextLesson ? (
              <>
                <p className="mt-2 text-lg font-extrabold leading-snug text-ink">{nextLesson.when}</p>
                <p className="mt-0.5 text-sm text-ink-2">
                  עם {nextLesson.peerName}
                  {nextLesson.subject ? ` · ${nextLesson.subject}` : ""}
                </p>
                <Link href="/bookings" className="mt-3 inline-flex text-sm font-bold text-action hover:underline">
                  לכל השיעורים
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-[15px] text-ink-2">
                  {isTeacher ? "אין כרגע שיעורים מתוכננים." : "עוד לא קבעתם את השיעור הבא."}
                </p>
                {!isTeacher && (
                  <Link
                    href="/search"
                    className="mt-3 inline-flex min-h-10 items-center rounded-pill bg-action px-5 text-sm font-bold text-on-action shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] hover:bg-action-hover"
                  >
                    למציאת מורה
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="rounded-[var(--r-md)] bg-canvas p-5 ring-1 ring-line/50">
            <div className="flex items-center gap-2">
              <Trophy size={18} strokeWidth={2} className="text-tint-sun-fg" aria-hidden="true" />
              <p className="text-sm font-bold text-ink">
                {next ? (
                  <>
                    עוד <span className="tnum">{toNext}</span> {toNext === 1 ? "שיעור" : "שיעורים"} להישג &quot;{next.title}&quot;
                  </>
                ) : (
                  "השגתם את כל ההישגים. מרשים."
                )}
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-pill bg-line">
              <div
                className="h-full rounded-pill bg-[linear-gradient(90deg,#F5A623,#F97316)] transition-[width] duration-700"
                style={{ width: `${Math.max(4, Math.min(100, nextPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone badges */}
      <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="הישגים">
        {progress.milestones.map((m) => (
          <li
            key={m.target}
            className={`inline-flex items-center gap-2 rounded-pill py-1.5 ps-1.5 pe-3.5 text-[13px] font-bold ${
              m.achieved
                ? "bg-tint-sun text-tint-sun-fg ring-1 ring-[#F5A623]/40"
                : "bg-canvas text-ink-3 ring-1 ring-line"
            }`}
          >
            <span
              className={`grid size-7 place-items-center rounded-full ${
                m.achieved ? "bg-[linear-gradient(160deg,#FCD34D,#F5A623)] text-white shadow-[0_4px_10px_-4px_rgba(245,158,11,0.8)]" : "bg-surface text-ink-3"
              }`}
            >
              {m.achieved ? <Award size={15} strokeWidth={2.25} /> : <Lock size={13} strokeWidth={2.25} />}
            </span>
            {m.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
