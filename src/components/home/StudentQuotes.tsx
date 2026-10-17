import { Quote, Star } from "lucide-react";
import type { HomeQuote } from "@/lib/home-picks";

const TONES = [
  "bg-tint-indigo text-tint-indigo-fg",
  "bg-tint-peach text-tint-peach-fg",
  "bg-tint-mint text-tint-mint-fg",
];

// Three real 5-star quotes from three different teachers (spec §8.3.6).
// Hidden when there aren't three.
export default function StudentQuotes({ quotes }: { quotes: HomeQuote[] }) {
  if (quotes.length < 3) return null;
  return (
    <section className="reveal band-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="text-sm font-semibold text-action">מהתלמידים שלנו</p>
        <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-balance text-ink sm:text-[36px]">
          מה תלמידים מספרים
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map((q, i) => (
            <figure
              key={`${q.teacherName}-${q.text.slice(0, 16)}`}
              className="flex flex-col rounded-[var(--r-lg)] bg-canvas p-6 ring-1 ring-line/60 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className={`grid size-11 place-items-center rounded-[var(--r-md)] ${TONES[i % 3]}`}>
                  <Quote size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="flex gap-0.5 text-star" role="img" aria-label="5 כוכבים">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <Star key={k} size={16} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
                  ))}
                </span>
              </div>
              <blockquote className="mt-5 flex-1 text-xl font-semibold leading-snug text-ink">
                {q.text}
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4 text-sm text-ink-2">
                <span className="font-bold text-ink">{q.reviewer}</span> · על {q.teacherName}
                {q.subject ? `, ${q.subject}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
