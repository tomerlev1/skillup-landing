"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorHe, ensureStudentRow } from "@/lib/auth/ensure-role-row";
import GoogleButton from "@/components/auth/GoogleButton";
import { APP_STORE_URL } from "@/lib/constants";

// Student signup. Mirrors the iOS flow: auth signup with role metadata,
// then the client creates the `students` row itself (no DB trigger).
// Teachers onboard in the app; here they only log in.
export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = searchParams.get("next") || "/";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role: "student",
          display_name: displayName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (signUpError) {
      setError(authErrorHe(signUpError.message));
      setPending(false);
      return;
    }

    if (data.session && data.user) {
      await ensureStudentRow(supabase, data.user);
      router.push(next);
      router.refresh();
      return;
    }

    // Email confirmation required by project settings — the role row is
    // created on first authenticated visit via /auth/callback.
    setConfirmEmailSent(true);
    setPending(false);
  }

  if (confirmEmailSent) {
    return (
      <div className="rounded-2xl bg-[var(--mk-band)] p-6 text-center">
        <h2 className="text-base font-semibold text-[var(--mk-ink)]">
          נשלח אליכם מייל אימות
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--mk-ink-2)]">
          פתחו את הקישור במייל כדי להשלים את ההרשמה, ואז חזרו לכאן להתחברות.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first-name" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
              שם פרטי
            </label>
            <input
              id="first-name"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
              שם משפחה
            </label>
            <input
              id="last-name"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--mk-hairline)] bg-white px-4 text-[15px] outline-none transition-colors focus:border-[var(--mk-ink)]"
            />
          </div>
        </div>
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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--mk-ink)]">
            סיסמה
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
          {pending ? "נרשמים..." : "יצירת חשבון"}
        </button>

        <p className="text-center text-xs leading-relaxed text-[var(--mk-ink-3)]">
          ההרשמה מהווה הסכמה{" "}
          <Link href="/terms" className="underline hover:text-[var(--mk-ink)]">
            לתנאי השימוש
          </Link>{" "}
          ו
          <Link href="/privacy" className="underline hover:text-[var(--mk-ink)]">
            למדיניות הפרטיות
          </Link>
          .
        </p>
      </form>

      <div className="flex items-center gap-3 text-xs text-[var(--mk-ink-3)]">
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
        או
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
      </div>

      <GoogleButton next={next} label="הרשמה עם Google" />

      <p className="text-center text-sm text-[var(--mk-ink-2)]">
        כבר יש לכם חשבון?{" "}
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          התחברות
        </Link>
      </p>

      <p className="rounded-2xl bg-[var(--mk-band)] px-4 py-3 text-center text-[13px] leading-relaxed text-[var(--mk-ink-2)]">
        מלמדים ורוצים להצטרף כמורים?{" "}
        <a href={APP_STORE_URL} className="font-semibold text-brand-700 hover:underline">
          נרשמים דרך אפליקציית SkillUp
        </a>{" "}
        — והפרופיל שלכם יופיע גם כאן באתר.
      </p>
    </div>
  );
}
