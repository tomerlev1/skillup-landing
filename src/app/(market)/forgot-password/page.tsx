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
        <p className="rounded-[var(--r-sm)] bg-ok/10 p-5 text-center text-[15px] leading-relaxed text-ink">
          אם קיים אצלנו חשבון עם האימייל הזה, קישור לאיפוס כבר בדרך לתיבת
          הדואר שלכם.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
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
              className="h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-start text-[15px] text-ink outline-none transition-colors focus:border-action"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-[var(--r-sm)] bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 w-full cursor-pointer rounded-full bg-action text-[15px] font-semibold text-on-action transition-colors hover:bg-action-hover disabled:opacity-60"
          >
            {pending ? "שולחים..." : "שליחת קישור איפוס"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
