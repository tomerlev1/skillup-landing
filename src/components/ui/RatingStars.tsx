import { Star } from "lucide-react";
import { formatRating } from "@/lib/format";

interface RatingProps {
  value: number;
  count: number;
  size?: "sm" | "md";
  /** Hide the "(12)" review count (compact rows). */
  hideCount?: boolean;
  className?: string;
}

// "★ 4.9 (127)" — one star color (--c-star, #F5A623), tabular numerals.
// Rendered as an inline (not flex) run so it shares the text baseline with
// whatever sits next to it (the teacher name on cards).
// No reviews yet → a small "חדש ב-SkillUp" tag (spark on a warm tint).
export default function RatingStars({
  value,
  count,
  size = "sm",
  hideCount = false,
  className = "",
}: RatingProps) {
  const starSize = size === "sm" ? 14 : 17;
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (count === 0) {
    return (
      <span
        className={`inline-block shrink-0 whitespace-nowrap rounded-[var(--r-pill)] px-2 py-0.5 text-xs font-semibold leading-[18px] ${className}`}
        style={{
          // #FFF1E6 in light; a warm tint of the surface in dark.
          background:
            "light-dark(#FFF1E6, color-mix(in srgb, var(--c-spark) 14%, var(--c-surface)))",
          // Spark, deepened toward ink so 12px text stays readable (AA).
          color: "color-mix(in srgb, var(--c-spark) 78%, var(--c-ink))",
        }}
      >
        חדש ב-SkillUp
      </span>
    );
  }

  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap ${textSize} text-ink ${className}`}
      role="img"
      aria-label={`דירוג ${formatRating(value)} מתוך 5, ${count} ביקורות`}
    >
      <Star
        size={starSize}
        strokeWidth={1.75}
        className="inline-block align-[-2px]"
        style={{ fill: "var(--c-star)", color: "var(--c-star)" }}
        aria-hidden="true"
      />
      <span className="tnum ms-1 font-semibold" aria-hidden="true">
        {formatRating(value)}
      </span>
      {!hideCount && (
        <span className="tnum ms-1 text-ink-3" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}
