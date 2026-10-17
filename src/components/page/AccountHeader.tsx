import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface AccountHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon: LucideIcon;
  tone?: string;
  back?: { href: string; label: string };
  /** Right-aligned actions / stats. */
  aside?: React.ReactNode;
  wide?: boolean;
}

// Compact header for signed-in pages (lessons, messages, saved, schedule):
// soft brand wash that fades into the page, coloured icon tile, title.
export default function AccountHeader({
  title,
  subtitle,
  icon: Icon,
  tone = "bg-tint-indigo text-tint-indigo-fg",
  back,
  aside,
  wide = false,
}: AccountHeaderProps) {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[260px]" style={{ background: "var(--hero-wash)" }} />
      <div className={`mx-auto ${wide ? "max-w-[1180px]" : "max-w-[960px]"} px-4 pb-6 pt-8 sm:px-6 sm:pt-12`}>
        {back && (
          <Link
            href={back.href}
            className="mb-5 inline-flex min-h-9 items-center gap-1 rounded-pill bg-surface/80 px-3 text-sm font-semibold text-ink-2 shadow-[var(--shadow-card)] ring-1 ring-line/60 backdrop-blur transition-colors hover:text-ink"
          >
            <ChevronRight strokeWidth={2} size={16} />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`grid size-14 shrink-0 place-items-center rounded-[var(--r-md)] shadow-[var(--shadow-card)] ${tone}`}>
              <Icon size={28} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-ed text-[28px] font-black leading-tight text-ink sm:text-[36px]">{title}</h1>
              {subtitle && <p className="mt-1 text-[15px] text-ink-2">{subtitle}</p>}
            </div>
          </div>
          {aside}
        </div>
      </div>
    </div>
  );
}
