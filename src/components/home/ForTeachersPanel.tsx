import Link from "next/link";
import { BellRing, CalendarDays, MessageCircle, UserRound } from "lucide-react";
import GuestOnly from "@/components/auth/GuestOnly";

const PERKS = [
  { icon: UserRound, text: "פרופיל אחד באתר ובאפליקציה" },
  { icon: CalendarDays, text: "יומן וזמינות במקום אחד" },
  { icon: MessageCircle, text: "צ׳אט ישיר עם תלמידים" },
  { icon: BellRing, text: "התראה על כל בקשה, בזמן אמת" },
];

// Panel for teachers (spec §8.3.7): a light brand panel with slowly drifting
// indigo and peach light, so colour draws the eye without a heavy slab.
export default function ForTeachersPanel() {
  return (
    <section className="reveal mx-auto max-w-[1280px] px-4 pt-4 sm:px-6">
      <div className="panel-soft rounded-[var(--r-lg)] px-6 py-12 text-ink sm:px-12 sm:py-14">
        <div aria-hidden="true" className="orb end-[-40px] top-[-60px] size-[280px] bg-brand-200/60" />
        <div aria-hidden="true" className="orb orb--slow bottom-[-80px] start-[-40px] size-[260px] bg-tint-peach" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-action">למורים</p>
            <h2 className="font-ed mt-1 text-[30px] font-black leading-tight text-balance text-ink sm:text-[40px]">
              אתם מלמדים. אנחנו דואגים לכל השאר.
            </h2>
            <p className="mt-3 max-w-[520px] text-base leading-relaxed text-ink-2 sm:text-lg">
              תלמידים מוצאים אתכם, קובעים מהיומן שלכם ומדברים איתכם ישירות. בלי עמלות על השיעורים.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GuestOnly>
                <Link
                  href="/signup?role=teacher"
                  className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-action px-7 text-base font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-transform duration-200 ease-[var(--ease)] hover:-translate-y-0.5"
                >
                  פתיחת פרופיל מורה
                </Link>
              </GuestOnly>
              <Link
                href="/for-tutors"
                className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-surface px-6 text-base font-bold text-ink ring-1 ring-line transition-colors duration-200 hover:ring-brand-200"
              >
                עוד למורים
              </Link>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PERKS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface/85 p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60 backdrop-blur"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] bg-tint-indigo text-tint-indigo-fg">
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="text-[15px] font-semibold leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
