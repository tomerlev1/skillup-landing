const LABEL = "פרופיל מאומת על ידי SkillUp";

interface VerifiedMarkProps {
  size?: 16 | 18;
  className?: string;
}

// Small indigo check-circle next to a verified teacher's name (spec §7.1).
// Replaces the old "מורה מאומת" pill on the photo.
export default function VerifiedMark({ size = 16, className = "" }: VerifiedMarkProps) {
  return (
    <span
      role="img"
      aria-label={LABEL}
      title={LABEL}
      className={`inline-grid shrink-0 place-items-center rounded-full bg-action ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 12 12"
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        aria-hidden="true"
        fill="none"
        stroke="var(--c-on-action)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.2l2.2 2.2 4.8-4.8" />
      </svg>
    </span>
  );
}
