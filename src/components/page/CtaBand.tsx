import Link from "next/link";

interface CtaBandProps {
  title: string;
  text?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

// Closing call-to-action on the light brand panel with drifting light.
export default function CtaBand({ title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className="reveal mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
      <div className="panel-soft rounded-[var(--r-lg)] px-6 py-12 text-center text-ink sm:px-12 sm:py-14">
        <div aria-hidden="true" className="orb end-[-40px] top-[-60px] size-[280px] bg-brand-200/60" />
        <div aria-hidden="true" className="orb orb--slow bottom-[-80px] start-[-40px] size-[260px] bg-tint-peach" />
        <h2 className="font-ed mx-auto max-w-[680px] text-[28px] font-black leading-tight text-balance text-ink sm:text-[38px]">
          {title}
        </h2>
        {text && (
          <p className="mx-auto mt-3 max-w-[560px] text-base leading-relaxed text-ink-2 sm:text-lg">{text}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primary.href}
            className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-action px-7 text-base font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-transform duration-200 ease-[var(--ease)] hover:-translate-y-0.5"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-surface px-6 text-base font-bold text-ink ring-1 ring-line transition-colors duration-200 hover:ring-brand-200"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
