import type { HomeQuote } from "@/lib/home-picks";

// Three real 5-star quotes from three different teachers (spec §8.3.6).
// Hidden when there aren't three.
export default function StudentQuotes({ quotes }: { quotes: HomeQuote[] }) {
  if (quotes.length < 3) return null;
  return (
    <section className="border-t border-line bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          מה תלמידים מספרים
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
          {quotes.map((q) => (
            <figure
              key={`${q.teacherName}-${q.text.slice(0, 16)}`}
              className="flex flex-col rounded-[var(--r-md)] border border-line bg-canvas p-6"
            >
              <span aria-hidden="true" className="font-ed text-[40px] font-black leading-none text-spark">
                ”
              </span>
              <blockquote className="font-ed mt-1 flex-1 text-[22px] font-bold leading-snug text-ink">
                {q.text}
              </blockquote>
              <figcaption className="mt-5 text-sm text-ink-2">
                {q.reviewer} · על {q.teacherName}
                {q.subject ? `, ${q.subject}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
