import AppLinkShell from "@/components/layout/AppLinkShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ניהול התראות — SkillUp",
  description: "העדפות ההתראות מנוהלות באפליקציית SkillUp.",
  robots: { index: false, follow: false },
};

export default function NotificationSettingsDeepLinkPage() {
  return (
    <AppLinkShell
      title="ניהול התראות"
      subtitle="העדפות ההתראות מנוהלות באפליקציה. פתחו את SkillUp והיכנסו להגדרות → התראות."
      ctaLabel="פתח את ההגדרות ב-SkillUp"
      ctaHref="https://skillupwebsite.vercel.app/settings/notifications"
    />
  );
}
