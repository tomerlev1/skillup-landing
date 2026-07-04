import TeacherDeepLinkContent from "@/components/layout/TeacherDeepLinkContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "פרופיל המורה | SkillUp (Dev)",
  description: "פתחו את אפליקציית SkillUp Dev כדי לראות את פרופיל המורה.",
  robots: { index: false, follow: false },
};

// Universal-Link target for the dev-app teacher share flow. AASA claims this
// path for com.skillupapp.ios.dev so dev share links don't collide with prod
// share links on devices that have both apps installed. Page content matches
// /teacher/[id]; only the URL (and therefore the AASA claim) differs. Do NOT
// redirect to /teacher/<id> — iOS must see a 200 at this path for the dev-app
// AASA intercept to fire.
export default async function DevTeacherDeepLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <TeacherDeepLinkContent />;
}
