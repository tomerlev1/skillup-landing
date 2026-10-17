import { BadgeCheck, MessagesSquare, Star } from "lucide-react";

const ITEMS = [
  {
    icon: BadgeCheck,
    tone: "bg-tint-mint text-tint-mint-fg",
    title: "פרופיל מאומת",
    text: "הצוות שלנו עובר על פרופילים ומסמן את אלה שאומתו בווי ליד השם.",
  },
  {
    icon: Star,
    tone: "bg-tint-sun text-tint-sun-fg",
    title: "ביקורות אמיתיות",
    text: "רק מי שלמד אצל המורה דרך SkillUp יכול לכתוב ביקורת.",
  },
  {
    icon: MessagesSquare,
    tone: "bg-tint-sky text-tint-sky-fg",
    title: "קשר ישיר",
    text: "מדברים עם המורה עצמו, בלי מתווכים באמצע.",
  },
];

// Plain explanation of what SkillUp actually checks (spec §8.3.5) — no
// promises beyond what exists.
export default function WhatWeCheck() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-action">למה לסמוך עלינו</p>
          <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-balance text-ink sm:text-[36px]">
            מה אנחנו בודקים
          </h2>
          <p className="mt-3 max-w-[380px] text-base leading-relaxed text-ink-2">
            בלי הבטחות ריקות. אלה הדברים שאנחנו באמת עושים כדי שתבחרו בביטחון.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {ITEMS.map(({ icon: Icon, tone, title, text }) => (
            <li
              key={title}
              className="rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60"
            >
              <span className={`grid size-12 place-items-center rounded-[var(--r-md)] ${tone}`}>
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
