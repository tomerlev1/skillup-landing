import AppLinkShell from "@/components/layout/AppLinkShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות ותנאי שימוש — SkillUp",
  description: "מסמכי המדיניות זמינים באפליקציית SkillUp.",
  robots: { index: false, follow: false },
};

// Note: this is the email-CTA fallback page targeting the AASA path
// `/policy`. The full marketing-side privacy + terms pages live at
// `/privacy` and `/terms` respectively, served by their own routes.
export default function PolicyDeepLinkPage() {
  return (
    <AppLinkShell
      title="מדיניות ותנאי שימוש"
      subtitle="מסמכי המדיניות המעודכנים זמינים באפליקציה תחת הגדרות → מידע משפטי."
      ctaLabel="פתח ב-SkillUp"
      ctaHref="https://skillupwebsite.vercel.app/policy"
    />
  );
}
