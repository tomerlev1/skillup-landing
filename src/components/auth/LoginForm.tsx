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
      <GoogleButton next={next} label="המשך עם Google" />

      <div className="flex items-center gap-3 text-sm text-ink-3">
        <span className="h-px flex-1 bg-line" />
        או עם אימייל
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
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
            className="h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-start text-[15px] outline-none transition-colors focus:border-action"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              סיסמה
            </label>
            <Link
              href="/forgot-password"
              className="inline-block py-0.5 text-sm text-ink-3 hover:text-ink hover:underline"
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
            className="h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-start text-[15px] outline-none transition-colors focus:border-action"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-[var(--r-sm)] bg-danger/10 px-4 py-3 text-sm text-danger-text">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full cursor-pointer rounded-[var(--r-pill)] bg-action text-sm font-semibold text-on-action transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {pending ? "מתחברים..." : "התחברות"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-2">
        עדיין אין לכם חשבון?{" "}
        <Link
          href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="inline-block py-0.5 font-semibold text-action hover:underline"
        >
          הרשמה
        </Link>
      </p>
    </div>
  );
}
