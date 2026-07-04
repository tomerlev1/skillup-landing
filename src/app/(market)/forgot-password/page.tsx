"use client";

import { useMemo, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { authErrorHe } from "@/lib/auth/ensure-role-row";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    if (resetError) {
      setError(authErrorHe(resetError.message));
      setPending(false);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="איפוס סיסמה"
      subtitle="נשלח אליכם קישור לבחירת סיסמה חדשה."
    >
      {sent ? (
        <p className="rounded-2xl bg-[var(--mk-band)] p-5 text-center text-sm leading-relaxed text-[var(--mk-ink-2)]">
          אם קיים אצלנו חשבון עם האימייל הזה, קישור לאיפוס כבר בדרך לתיבת
          הדואר שלכם.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
              אימייל
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-start text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full cursor-pointer rounded-full bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "שולחים..." : "שליחת קישור איפוס"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
