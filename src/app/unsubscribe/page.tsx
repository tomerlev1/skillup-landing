"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLinkShell from "@/components/layout/AppLinkShell";

// Stateless unsubscribe: the link carries a signed token. The /api/unsubscribe
// route (not in this PR) verifies the HMAC and flips marketing_consent=false
// via the service role. Until that route lands, this page shows a status
// based on the API response.

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={<AppLinkShell title="מבטל את הרישום..." subtitle="רק רגע." />}
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("err");
      return;
    }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then((r) => setState(r.ok ? "ok" : "err"))
      .catch(() => setState("err"));
  }, [searchParams]);

  if (state === "loading") {
    return <AppLinkShell title="מבטל את הרישום..." subtitle="רק רגע." />;
  }
  if (state === "ok") {
    return (
      <AppLinkShell
        title="הוסרת מרשימת התפוצה"
        subtitle="לא תקבל עוד מיילים שיווקיים. התראות תפעוליות (שיעורים, תשלומים) ימשיכו לפי ההעדפות שלך באפליקציה."
        tone="ok"
      />
    );
  }
  return (
    <AppLinkShell
      title="לא הצלחנו לבטל את הרישום"
      subtitle="ייתכן שהקישור פג תוקף. אפשר לבטל את ההרשמה ישירות באפליקציה: הגדרות → התראות → חומר שיווקי."
      ctaLabel="פתח את ההגדרות ב-SkillUp"
      ctaHref="https://skillupwebsite.vercel.app/settings/notifications"
      tone="err"
    />
  );
}
