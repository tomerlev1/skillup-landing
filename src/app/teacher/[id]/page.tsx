import TeacherDeepLinkContent from "@/components/layout/TeacherDeepLinkContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "פרופיל המורה | SkillUp",
  description: "פתחו את אפליקציית SkillUp כדי לראות את פרופיל המורה.",
  robots: { index: false, follow: false },
};

// Universal-Link target for the prod-app teacher share flow. When the app is
// installed, iOS intercepts via AASA and never renders this page. No Supabase
// lookup — any latency would race against the AASA intercept.
export default async function TeacherDeepLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <TeacherDeepLinkContent />;
}
