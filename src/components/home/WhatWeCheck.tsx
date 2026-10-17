import { BadgeCheck, MessagesSquare, Star } from "lucide-react";

const ITEMS = [
  {
    icon: BadgeCheck,
    title: "פרופיל מאומת",
    text: "הצוות שלנו עובר על פרופילים ומסמן את אלה שאומתו בווי ליד השם.",
  },
  {
    icon: Star,
    title: "ביקורות אמיתיות",
    text: "רק מי שלמד אצל המורה דרך SkillUp יכול לכתוב ביקורת.",
  },
  {
    icon: MessagesSquare,
    title: "קשר ישיר",
    text: "מדברים עם המורה עצמו, בלי מתווכים באמצע.",
  },
];

// Plain explanation of what SkillUp actually checks (spec §8.3.5) — no
// promises beyond what exists.
export default function WhatWeCheck() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-16">
      <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
        מה אנחנו בודקים
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="rounded-[var(--r-md)] border border-line bg-surface p-5 sm:p-6"
          >
            <span className="grid size-10 place-items-center rounded-[var(--r-sm)] bg-canvas text-ink">
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-base leading-relaxed text-ink-2">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
