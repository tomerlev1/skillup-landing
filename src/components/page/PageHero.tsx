import type { LucideIcon } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  icon?: LucideIcon;
  /** Tint class pair for the icon tile, e.g. "bg-tint-peach text-tint-peach-fg". */
  tone?: string;
  /** Extra content under the lead (chips, buttons, breadcrumbs…). */
  children?: React.ReactNode;
  /** Optional slot above the title (breadcrumbs). */
  top?: React.ReactNode;
}

// Shared header for content and landing pages: the same soft brand wash as
// the home hero, a coloured icon tile, eyebrow, display title and lead.
export default function PageHero({
  eyebrow,
  title,
  lead,
  icon: Icon,
  tone = "bg-tint-indigo text-tint-indigo-fg",
  children,
  top,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden" style={{ background: "var(--hero-wash)" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 end-[-100px] -z-10 size-[360px] rounded-full bg-brand-200/40 blur-3xl"
      />
      <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        {top}
        <div className={`max-w-[760px] ${top ? "mt-6" : ""}`}>
          {Icon && (
            <span className={`mb-5 grid size-14 place-items-center rounded-[var(--r-md)] shadow-[var(--shadow-card)] ${tone}`}>
              <Icon size={28} strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          {eyebrow && <p className="text-sm font-semibold text-action">{eyebrow}</p>}
          <h1 className="font-ed mt-1 text-[clamp(34px,5vw,56px)] font-black leading-[1.08] text-balance text-ink">
            {title}
          </h1>
          {lead && <p className="mt-4 text-lg leading-relaxed text-ink-2 sm:text-xl">{lead}</p>}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
