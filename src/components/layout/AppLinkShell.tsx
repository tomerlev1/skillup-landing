import type { ReactNode } from "react";

// Centered card layout used by the email-CTA fallback pages
// (/lesson/[id], /chat/[id], /verify-email, /settings/notifications,
// /policy, /unsubscribe). These pages render only when a user without
// the iOS app installed taps an email link — when the app IS installed,
// iOS intercepts the URL via the AASA file at /.well-known/ and opens
// the app directly without ever fetching this page.
//
// Inline styles (rather than Tailwind) keep the shell self-contained
// and visually distinct from the marketing site, matching the original
// drop-in design.

type Tone = "ok" | "warn" | "err";

interface AppLinkShellProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: Tone;
  children?: ReactNode;
}

const TONE: Record<Tone, { accent: string; badge: string }> = {
  ok: { accent: "#16a34a", badge: "✓" },
  warn: { accent: "#d97706", badge: "!" },
  err: { accent: "#dc2626", badge: "×" },
};

export default function AppLinkShell({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  tone,
  children,
}: AppLinkShellProps) {
  const t = tone ? TONE[tone] : null;
  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily:
          "'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 24,
          padding: "40px 32px",
          boxShadow:
            "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(79,70,229,0.06)",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        {t && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `${t.accent}22`,
              color: t.accent,
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            {t.badge}
          </div>
        )}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 12px",
            letterSpacing: "-0.4px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "0 0 24px",
              color: "#64748b",
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
        {ctaHref && ctaLabel && (
          <a
            href={ctaHref}
            style={{
              display: "inline-block",
              marginTop: 8,
              background: "linear-gradient(135deg,#6366f1,#4338ca)",
              color: "#ffffff",
              textDecoration: "none",
              padding: "14px 36px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
            }}
          >
            {ctaLabel}
          </a>
        )}
        <p style={{ marginTop: 32, fontSize: 12, color: "#94a3b8" }}>
          SkillUp · פלטפורמה לחיבור תלמידים ומורים
        </p>
      </section>
    </main>
  );
}
