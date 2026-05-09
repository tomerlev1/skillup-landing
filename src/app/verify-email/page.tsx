"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLinkShell from "@/components/layout/AppLinkShell";

const COPY: Record<
  string,
  { title: string; subtitle: string; tone: "ok" | "warn" | "err" }
> = {
  verified: {
    title: "האימייל אומת בהצלחה",
    subtitle:
      "החשבון שלך פעיל. אפשר לחזור לאפליקציה ולהתחיל לקבל תלמידים.",
    tone: "ok",
  },
  already: {
    title: "האימייל כבר אומת",
    subtitle:
      "החשבון שלך כבר פעיל. אפשר לפתוח את האפליקציה ולהמשיך.",
    tone: "ok",
  },
  not_found: {
    title: "קישור לא תקף",
    subtitle:
      "ייתכן שהקישור פג תוקף. בקשו מהצוות קישור חדש או פנו לתמיכה.",
    tone: "err",
  },
  error: {
    title: "אירעה שגיאה באימות",
    subtitle: "נסו שוב בעוד רגע. אם זה חוזר, פנו לתמיכה.",
    tone: "err",
  },
};

// Fallback target: prod Supabase. The 99% case is iOS Universal Links
// intercepting before this page renders and calling verify-teacher /
// verify-student on the correct (dev or prod) backend via the iOS
// app's AppConfig. This page only runs when the app isn't installed.
const SUPABASE_URL = "https://ntofcpjwulypvjcsytqv.supabase.co";

export default function VerifyEmailPage() {
  // useSearchParams forces client rendering; Next 16 requires a Suspense
  // boundary around components that read it so static prerender works.
  return (
    <Suspense
      fallback={<AppLinkShell title="מאמת את האימייל..." subtitle="רק רגע." />}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Path A: the URL already carries ?status=… (legacy 302 from the
    // edge function). Render it directly.
    const queryStatus = searchParams.get("status");
    if (queryStatus) {
      setStatus(queryStatus);
      return;
    }

    // Path B: the URL carries ?token=… (email CTA points here directly
    // so iOS Mail can hand off to the installed app). If we're in the
    // browser, the app isn't installed — call the edge function.
    const token = searchParams.get("token");
    const role = (searchParams.get("role") ?? "teacher").toLowerCase();
    if (!token) {
      setStatus("not_found");
      return;
    }
    const fn = role === "student" ? "verify-student" : "verify-teacher";
    fetch(
      `${SUPABASE_URL}/functions/v1/${fn}?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    )
      .then(async (r) => {
        const json = (await r.json().catch(() => null)) as
          | { status?: string }
          | null;
        setStatus(json?.status ?? "error");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (!status) {
    return <AppLinkShell title="מאמת את האימייל..." subtitle="רק רגע." />;
  }
  const copy = COPY[status] ?? COPY.not_found;
  return (
    <AppLinkShell
      title={copy.title}
      subtitle={copy.subtitle}
      ctaLabel="חזרה ל-SkillUp"
      ctaHref="https://skillupwebsite.vercel.app/"
      tone={copy.tone}
    />
  );
}
