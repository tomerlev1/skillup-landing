import { Star } from "lucide-react";
import { formatRating } from "@/lib/format";

interface RatingProps {
  value: number;
  count: number;
  size?: "sm" | "md";
  className?: string;
}

// Calm, ink-colored rating (Airbnb-style: "★ 4.9 (127)"), tabular numerals.
// Teachers with no reviews yet read "חדש" instead of an empty zero.
export default function RatingStars({
  value,
  count,
  size = "sm",
  className = "",
}: RatingProps) {
  const starSize = size === "sm" ? 14 : 16;
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (count === 0) {
    return (
      <span className={`${textSize} font-medium text-[var(--mk-ink-2)] ${className}`}>
        חדש
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${textSize} text-[var(--mk-ink)] ${className}`}
    >
      <Star size={starSize} className="fill-current" aria-hidden="true" />
      <span className="tnum font-medium">{formatRating(value)}</span>
      <span className="tnum text-[var(--mk-ink-3)]">({count})</span>
    </span>
  );
}
