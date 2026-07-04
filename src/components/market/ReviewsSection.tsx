import { Star } from "lucide-react";
import { formatDateShort, formatRating } from "@/lib/format";
import type { PublicReview } from "@/lib/data/reviews";

interface ReviewsSectionProps {
  stats: {
    avg: number;
    count: number;
    distribution: { star: number; count: number }[];
  };
  reviews: PublicReview[];
}

// Reviews per Baymard: graphical distribution bars (only above ~5 ratings —
// small counts read better as plain cards), 2-col excerpt grid, outcomes
// over adjectives. Reviewer identity stays anonymous by design (students
// are not publicly exposed).
export default function ReviewsSection({ stats, reviews }: ReviewsSectionProps) {
  if (stats.count === 0) return null;

  return (
    <section id="reviews" aria-label="ביקורות תלמידים">
      <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">
        מה תלמידים מספרים
      </h2>

      <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Big numeral + stars */}
        <div className="shrink-0 text-center sm:w-40">
          <p className="tnum font-display text-5xl font-extrabold text-[var(--mk-ink)]">
            {formatRating(stats.avg)}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={
                  i <= Math.round(stats.avg)
                    ? "fill-amber-400 text-amber-400"
                    : "text-ink-300"
                }
              />
            ))}
          </div>
          <p className="tnum mt-1 text-sm text-[var(--mk-ink-3)]">
            {stats.count} ביקורות
          </p>
        </div>

        {/* Distribution bars (hidden for tiny counts) */}
        {stats.count >= 5 && (
          <div className="w-full max-w-sm space-y-1.5">
            {stats.distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="tnum w-3 shrink-0 text-[var(--mk-ink-2)]">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-150">
                  <div
                    className="h-full rounded-full bg-[var(--mk-ink)]"
                    style={{ width: `${stats.count ? (count / stats.count) * 100 : 0}%` }}
                  />
                </div>
                <span className="tnum w-6 shrink-0 text-end text-xs text-[var(--mk-ink-3)]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {reviews
          .filter((r) => r.text)
          .map((review) => (
            <blockquote
              key={review.id}
              className="rounded-2xl border border-[var(--mk-hairline)] bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {review.reviewer_name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--mk-ink)]">
                    {review.reviewer_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-ink-300"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--mk-ink)]">
                {review.text}
              </p>
              <footer className="mt-3 text-xs text-[var(--mk-ink-3)]">
                {formatDateShort(review.written_at)}
              </footer>
            </blockquote>
          ))}
      </div>
    </section>
  );
}
