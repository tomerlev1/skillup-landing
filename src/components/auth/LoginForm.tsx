"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorHe } from "@/lib/auth/ensure-role-row";
import GoogleButton from "@/components/auth/GoogleButton";
import { safeNextPath } from "@/lib/safe-next";

// `next` carries the gated action the user was trying to perform —
// after login they resume exactly there, not on the homepage.
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError(authErrorHe(signInError.message));
      setPending(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-3.5">
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
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-[var(--mk-ink)]">
              סיסמה
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] text-[var(--mk-ink-3)] hover:text-[var(--mk-ink)] hover:underline"
            >
              שכחתם סיסמה?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            dir="ltr"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {pending ? "מתחברים..." : "התחברות"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-[var(--mk-ink-3)]">
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
        או
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
      </div>

      <GoogleButton next={next} label="התחברות עם Google" />

      <p className="text-center text-sm text-[var(--mk-ink-2)]">
        עדיין אין לכם חשבון?{" "}
        <Link
          href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          הרשמה
        </Link>
      </p>
    </div>
  );
}
