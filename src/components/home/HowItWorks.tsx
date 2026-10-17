import { CalendarCheck, MessagesSquare, Search, type LucideIcon } from "lucide-react";

export const HOW_IT_WORKS_STEPS = [
  {
    title: "מוצאים מורה",
    text: "מחפשים לפי מקצוע ועיר, ומשווים פרופילים, ביקורות ומחירים.",
  },
  {
    title: "קובעים מועד",
    text: "שולחים בקשה למורה ביומן שלו. התשלום והביטול נקבעים ישירות מולו, SkillUp לא גובה מכם כלום.",
  },
  {
    title: "לומדים",
    text: "נפגשים אונליין או פנים אל פנים, וממשיכים בצ׳אט ישיר.",
  },
];

const LOOK: { icon: LucideIcon; tone: string }[] = [
  { icon: Search, tone: "bg-tint-indigo text-tint-indigo-fg" },
  { icon: CalendarCheck, tone: "bg-tint-peach text-tint-peach-fg" },
  { icon: MessagesSquare, tone: "bg-tint-mint text-tint-mint-fg" },
];

// Three steps (spec §8.3.4). Step 2 carries the "we don't charge you" line.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-20 bg-brand-50 py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="text-sm font-semibold text-action">פשוט, שקוף, ישיר</p>
        <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-balance text-ink sm:text-[36px]">
          איך זה עובד
        </h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {HOW_IT_WORKS_STEPS.map((s, i) => {
            const { icon: Icon, tone } = LOOK[i] ?? LOOK[0];
            return (
              <li
                key={s.title}
                className="relative rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid size-12 place-items-center rounded-[var(--r-md)] ${tone}`}>
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="tnum text-[44px] font-black leading-none text-brand-100"
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-2">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
