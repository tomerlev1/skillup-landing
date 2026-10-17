import Link from "next/link";

interface CtaBandProps {
  title: string;
  text?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

// Closing call-to-action: the brand's bright indigo gradient moment.
export default function CtaBand({ title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative isolate overflow-hidden rounded-[var(--r-lg)] bg-gradient-to-l from-[#4F46E5] via-[#5A4FF0] to-[#7C6CF6] px-6 py-12 text-center text-white shadow-[var(--shadow-lift)] sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -top-20 start-[-60px] -z-10 size-[300px] rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 end-[-40px] -z-10 size-[280px] rounded-full bg-[#F97316]/30 blur-3xl"
        />
        <h2 className="font-ed mx-auto max-w-[680px] text-[28px] font-black leading-tight text-balance sm:text-[38px]">
          {title}
        </h2>
        {text && (
          <p className="mx-auto mt-3 max-w-[560px] text-base leading-relaxed text-white/85 sm:text-lg">{text}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primary.href}
            className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-white px-7 text-base font-bold text-[#3F37C9] shadow-[var(--shadow-card)] transition-transform duration-200 ease-[var(--ease)] hover:-translate-y-0.5"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-12 items-center rounded-[var(--r-pill)] border border-white/40 px-6 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
