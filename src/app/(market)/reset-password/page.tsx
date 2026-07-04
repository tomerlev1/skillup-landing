"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { authErrorHe } from "@/lib/auth/ensure-role-row";

// Landed from the recovery-link email (Supabase establishes the session
// on arrival); the user just picks a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(authErrorHe(updateError.message));
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell title="בחירת סיסמה חדשה">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
            סיסמה חדשה
          </label>
          <input
            id="password"
            type="password"
            dir="ltr"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-start text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
          />
          <p className="mt-1 text-xs text-[var(--mk-ink-3)]">לפחות 8 תווים</p>
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
          {pending ? "שומרים..." : "שמירת הסיסמה"}
        </button>
      </form>
    </AuthShell>
  );
}
