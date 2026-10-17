import Link from "next/link";
import { BellRing, CalendarDays, MessageCircle, UserRound } from "lucide-react";
import GuestOnly from "@/components/auth/GuestOnly";

const PERKS = [
  { icon: UserRound, text: "פרופיל אחד באתר ובאפליקציה" },
  { icon: CalendarDays, text: "יומן וזמינות במקום אחד" },
  { icon: MessageCircle, text: "צ׳אט ישיר עם תלמידים" },
  { icon: BellRing, text: "התראה על כל בקשה, בזמן אמת" },
];

// Panel for teachers (spec §8.3.7) — the page's one bold brand moment: a
// bright indigo gradient with white text and white perk tiles. Light and
// saturated, not the dark slab the owner rejected.
export default function ForTeachersPanel() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-l from-[#4F46E5] via-[#5A4FF0] to-[#7C6CF6] px-6 py-12 text-white shadow-[var(--shadow-lift)] sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -top-20 start-[-60px] -z-10 size-[320px] rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 end-[-40px] -z-10 size-[280px] rounded-full bg-[#F97316]/30 blur-3xl"
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/80">למורים</p>
            <h2 className="font-ed mt-1 text-[30px] font-black leading-tight text-balance sm:text-[40px]">
              אתם מלמדים. אנחנו דואגים לכל השאר.
            </h2>
            <p className="mt-3 max-w-[520px] text-base leading-relaxed text-white/85 sm:text-lg">
              תלמידים מוצאים אתכם, קובעים מהיומן שלכם ומדברים איתכם ישירות. בלי עמלות על השיעורים.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GuestOnly>
                <Link
                  href="/signup?role=teacher"
                  className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-white px-7 text-base font-bold text-[#3F37C9] shadow-[var(--shadow-card)] transition-transform duration-200 ease-[var(--ease)] hover:-translate-y-0.5"
                >
                  פתיחת פרופיל מורה
                </Link>
              </GuestOnly>
              <Link
                href="/for-tutors"
                className="inline-flex h-12 items-center rounded-[var(--r-pill)] border border-white/40 px-6 text-base font-semibold text-white transition-colors duration-200 ease-[var(--ease)] hover:bg-white/10"
              >
                עוד למורים
              </Link>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PERKS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[var(--r-md)] bg-white/10 p-4 ring-1 ring-white/20"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] bg-white text-[#4F46E5]">
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
