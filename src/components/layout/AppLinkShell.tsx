import type { ReactNode } from "react";
import { Check, CircleAlert, X, type LucideIcon } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

// Centered card layout used by the email-CTA fallback pages
// (/lesson/[id], /chat/[id], /verify-email, /settings/notifications,
// /unsubscribe, /teacher/[id]). These pages render only when a user without
// the iOS app installed taps an email link — when the app IS installed,
// iOS intercepts the URL via the AASA file at /.well-known/ and opens
// the app directly without ever fetching this page.
//
// Lives outside the (market) shell, so it carries its own logo and uses the
// v2 tokens directly (follows light/dark like the rest of the site).

type Tone = "ok" | "warn" | "err";

interface AppLinkShellProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: Tone;
  children?: ReactNode;
  /**
   * Rendered inside a shell that already has its own <main> and logo (e.g.
   * the (market) layout): drop the outer <main> and the card logo.
   */
  bare?: boolean;
}

const TONE: Record<Tone, { Icon: LucideIcon; className: string }> = {
  ok: { Icon: Check, className: "bg-ok/15 text-ok-text" },
  warn: { Icon: CircleAlert, className: "bg-warn/15 text-warn-text" },
  err: { Icon: X, className: "bg-danger/15 text-danger-text" },
};

export default function AppLinkShell({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  tone,
  children,
  bare = false,
}: AppLinkShellProps) {
  const t = tone ? TONE[tone] : null;
  const Outer = bare ? "div" : "main";
  return (
    <Outer
      dir="rtl"
      className={`flex items-center justify-center bg-canvas p-6 text-ink ${
        bare ? "py-14 sm:py-20" : "min-h-dvh"
      }`}
    >
      <section className="w-full max-w-[520px] rounded-[var(--r-md)] border border-line bg-surface px-6 py-10 text-center sm:px-8">
        {!bare && <BrandLogo className="mx-auto mb-6 h-9 w-auto" />}
        {t && (
          <div
            aria-hidden="true"
            className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full ${t.className}`}
          >
            <t.Icon size={24} strokeWidth={1.75} />
          </div>
        )}
        <h1 className="mb-3 font-ed text-[28px] font-bold leading-tight text-balance text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mb-6 text-[15px] leading-relaxed text-ink-2">{subtitle}</p>
        )}
        {children}
        {ctaHref && ctaLabel && (
          <a
            href={ctaHref}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-action px-8 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
          >
            {ctaLabel}
          </a>
        )}
        <p className="mt-8 text-sm text-ink-3">SkillUp · פלטפורמה לחיבור לומדים ומורים</p>
      </section>
    </Outer>
  );
}
