import { Star } from "lucide-react";
import { formatDateShort, formatRating } from "@/lib/format";
import type { PublicReview } from "@/lib/data/reviews";
import { displayReviewerName } from "@/lib/home-picks";
import Avatar from "@/components/ui/Avatar";

interface ReviewsSectionProps {
  stats: {
    avg: number;
    count: number;
    distribution: { star: number; count: number }[];
  };
  reviews: PublicReview[];
}

// Big serif average, distribution bars from 5 reviews, plain-body quotes with
// first name + date. Stars use the single star yellow. Reviewer identity stays
// minimal by design (first name only).
export default function ReviewsSection({ stats, reviews }: ReviewsSectionProps) {
  if (stats.count === 0) return null;

  return (
    <section id="reviews" aria-label="ביקורות תלמידים">
      <h2 className="font-ed text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
        מה תלמידים מספרים
      </h2>

      <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Big numeral + stars */}
        <div className="shrink-0 text-center sm:w-40">
          <p className="tnum font-ed text-6xl font-black leading-none text-ink">
            {formatRating(stats.avg)}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={
                  i <= Math.round(stats.avg)
                    ? "fill-star text-star"
                    : "text-line"
                }
              />
            ))}
          </div>
          <p className="tnum mt-1 text-sm text-ink-3">
            {stats.count} ביקורות
          </p>
        </div>

        {/* Distribution bars (hidden for tiny counts) */}
        {stats.count >= 5 && (
          <div className="w-full max-w-sm space-y-1.5">
            {stats.distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="tnum w-3 shrink-0 text-ink-2">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${stats.count ? (count / stats.count) * 100 : 0}%` }}
                  />
                </div>
                <span className="tnum w-6 shrink-0 text-end text-xs text-ink-3">
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
              className="rounded-[var(--r-md)] border border-line bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <Avatar src={null} name={displayReviewerName(review.reviewer_name)} size={36} />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {displayReviewerName(review.reviewer_name)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i <= review.rating
                            ? "fill-star text-star"
                            : "text-line"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                {review.text}
              </p>
              <footer className="mt-3 text-sm text-ink-3">
                {formatDateShort(review.written_at)}
              </footer>
            </blockquote>
          ))}
      </div>
    </section>
  );
}
