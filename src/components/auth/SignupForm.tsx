"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authErrorHe, ensureRoleRow } from "@/lib/auth/ensure-role-row";
import { useAuth } from "@/components/auth/AuthProvider";
import GoogleButton from "@/components/auth/GoogleButton";
import { safeNextPath } from "@/lib/safe-next";
import type { UserRole } from "@/lib/types";

// Signup collects the same fields as the iOS app (role, name, phone, email,
// password; metadata: role + display_name + phone), and creates the same
// role row — so the account works identically in the app and on the web.
export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const next = safeNextPath(searchParams.get("next"));

  const [role, setRole] = useState<UserRole>(
    searchParams.get("role") === "teacher" ? "teacher" : "student",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const { user: currentUser } = useAuth();

  // Middleware already redirects logged-in users away; this covers client
  // navigations that never touch the server.
  if (currentUser && !pending && !confirmEmailSent) {
    return (
      <p className="rounded-[var(--r-md)] bg-canvas p-6 text-center text-sm leading-relaxed text-ink-2">
        אתם כבר מחוברים לחשבון SkillUp.{" "}
        <Link href="/account" className="inline-block py-0.5 font-semibold text-action hover:underline">
          לפרופיל שלי
        </Link>
      </p>
    );
  }

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
          role,
          display_name: displayName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (signUpError) {
      setError(authErrorHe(signUpError.message));
      setPending(false);
      return;
    }

    if (data.session && data.user) {
      await ensureRoleRow(supabase, data.user);
      // New teachers land on their profile page to complete it; students
      // resume whatever they were doing.
      router.push(role === "teacher" ? "/account?welcome=1" : next);
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
      <div className="rounded-[var(--r-md)] bg-canvas p-6 text-center">
        <h2 className="text-base font-semibold text-ink">
          נשלח אליכם מייל אימות
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          פתחו את הקישור במייל כדי להשלים את ההרשמה, ואז חזרו לכאן להתחברות.
        </p>
      </div>
    );
  }

  const inputClass =
    "h-12 w-full rounded-[var(--r-sm)] border border-line bg-surface px-4 text-[15px] outline-none transition-colors focus:border-action";

  return (
    <div className="space-y-5">
      <GoogleButton next={next} label="המשך עם Google" />

      <div className="flex items-center gap-3 text-sm text-ink-3">
        <span className="h-px flex-1 bg-line" />
        או עם אימייל
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Role selection — same first step as the app */}
      <div
        role="radiogroup"
        aria-label="סוג החשבון"
        className="grid grid-cols-2 gap-1 rounded-[var(--r-pill)] border border-line bg-canvas p-1"
      >
        {(
          [
            { value: "student", label: "אני רוצה ללמוד" },
            { value: "teacher", label: "אני רוצה ללמד" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={role === opt.value}
            onClick={() => setRole(opt.value)}
            className={`h-11 cursor-pointer rounded-[var(--r-pill)] text-sm font-semibold transition-colors ${
              role === opt.value
                ? "bg-action text-on-action"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first-name" className="mb-1.5 block text-sm font-medium text-ink">
              שם פרטי
            </label>
            <input
              id="first-name"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="last-name" className="mb-1.5 block text-sm font-medium text-ink">
              שם משפחה
            </label>
            <input
              id="last-name"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink">
            טלפון
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            required
            pattern="0[0-9]{8,9}"
            title="מספר טלפון ישראלי, למשל 0501234567"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputClass} text-start`}
          />
        </div>
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
            className={`${inputClass} text-start`}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
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
            className={`${inputClass} text-start`}
          />
          <p className="mt-1 text-sm text-ink-3">לפחות 8 תווים</p>
        </div>

        {error && (
          <p role="alert" className="rounded-[var(--r-sm)] bg-danger/10 px-4 py-3 text-sm text-danger-text">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full cursor-pointer rounded-[var(--r-pill)] bg-action text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {pending
            ? "נרשמים..."
            : role === "teacher"
              ? "פתיחת חשבון מורה"
              : "הרשמה"}
        </button>

        {role === "teacher" && (
          <p className="rounded-[var(--r-sm)] bg-canvas px-4 py-3 text-center text-sm leading-relaxed text-ink-2">
            אחרי ההרשמה ממלאים את פרטי הפרופיל, והוא יופיע מול תלמידים באתר
            ובאפליקציה. אותו חשבון עובד בשניהם.
          </p>
        )}

        <p className="text-center text-sm leading-relaxed text-ink-3">
          ההרשמה מהווה הסכמה{" "}
          <Link href="/terms" className="inline-block py-0.5 underline hover:text-ink">
            לתנאי השימוש
          </Link>{" "}
          ו
          <Link href="/privacy" className="inline-block py-0.5 underline hover:text-ink">
            למדיניות הפרטיות
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-ink-2">
        כבר יש לכם חשבון?{" "}
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="inline-block py-0.5 font-semibold text-action hover:underline"
        >
          התחברות
        </Link>
      </p>
    </div>
  );
}
