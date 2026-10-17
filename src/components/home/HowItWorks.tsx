const STEPS = [
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

// Three steps (spec §8.3.4). Step 2 carries the "we don't charge you" line.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-16 border-y border-line bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          איך זה עובד
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="font-ed tnum grid size-11 shrink-0 place-items-center rounded-[var(--r-pill)] bg-canvas text-[22px] font-bold leading-none text-ink"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-ink-2">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
