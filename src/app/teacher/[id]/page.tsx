import AppLinkShell from "@/components/layout/AppLinkShell";
import UAAwareStoreCTAs from "@/components/ui/UAAwareStoreCTAs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "פרופיל המורה — SkillUp",
  description: "פתחו את אפליקציית SkillUp כדי לראות את פרופיל המורה.",
  robots: { index: false, follow: false },
};

// Universal-Link target for teacher share flow. When the iOS app is installed,
// iOS intercepts /teacher/<uuid> via AASA and opens the app directly — this
// page never renders. When the app is NOT installed, the page falls through
// here as a lightweight "open or install" prompt. We deliberately do NOT do a
// Supabase lookup for the teacher: any latency competes with the AASA intercept
// race and risks rendering before iOS hijacks the navigation.
export default async function TeacherDeepLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <AppLinkShell
      title="פותחים את SkillUp..."
      subtitle="פרופיל המורה ייפתח באפליקציה. אם האפליקציה לא מותקנת, הורידו אותה כאן:"
    >
      <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
        <UAAwareStoreCTAs />
      </div>
    </AppLinkShell>
  );
}
