import { Star } from "lucide-react";
import { formatRating } from "@/lib/format";

interface RatingProps {
  value: number;
  count: number;
  size?: "sm" | "md";
  className?: string;
}

// Golden filled star + bold value ("★ 4.9 (127)"), tabular numerals.
// Fill is set inline on the SVG so it can never be lost to CSS generation.
// Teachers with no reviews yet read "חדש" as a soft brand chip.
const GOLD = "#F5A623";

export default function RatingStars({
  value,
  count,
  size = "sm",
  className = "",
}: RatingProps) {
  const starSize = size === "sm" ? 15 : 17;
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (count === 0) {
    return (
      <span
        className={`rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ${className}`}
      >
        חדש
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${textSize} text-[var(--mk-ink)] ${className}`}
    >
      <Star
        size={starSize}
        style={{ fill: GOLD, color: GOLD }}
        aria-hidden="true"
      />
      <span className="tnum font-bold">{formatRating(value)}</span>
      <span className="tnum text-[var(--mk-ink-3)]">({count})</span>
    </span>
  );
}
