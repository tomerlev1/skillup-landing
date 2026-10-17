import Link from "next/link";

interface ChipProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

// Pill chip (category shortcuts, filters). Rest: white + hairline border.
// Hover: ink border. Selected: ink bg / white text — never indigo (accent
// budget is reserved for the primary action).
export default function Chip({
  children,
  href,
  onClick,
  selected = false,
  size = "md",
  className = "",
  ariaLabel,
}: ChipProps) {
  const sizing =
    size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  const look = selected
    ? "border-ink bg-ink text-surface"
    : "border-line bg-surface text-ink hover:border-ink";
  const classes = `hit-44 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border font-medium transition-colors ${sizing} ${look} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      aria-pressed={selected}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
