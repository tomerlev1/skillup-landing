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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
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
            className="h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-start text-[15px] text-ink outline-none transition-colors focus:border-action"
          />
          <p className="mt-1 text-sm text-ink-3">לפחות 8 תווים</p>
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
          {pending ? "שומרים..." : "שמירת הסיסמה"}
        </button>
      </form>
    </AuthShell>
  );
}
