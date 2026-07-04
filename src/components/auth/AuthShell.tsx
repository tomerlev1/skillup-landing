interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// Centered auth card — calm, single-column, nothing competing with the form.
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-[var(--mk-band)] px-4 py-14">
      <div className="w-full max-w-[420px]">
        <div className="rounded-3xl border border-[var(--mk-hairline)] bg-white p-7 sm:p-9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/SkillUpLoginLogo-Light.svg"
            alt="SkillUp"
            className="mx-auto h-10 w-auto"
          />
          <h1 className="mt-5 text-center font-display text-xl font-bold text-[var(--mk-ink)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-center text-sm leading-relaxed text-[var(--mk-ink-2)]">
              {subtitle}
            </p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
