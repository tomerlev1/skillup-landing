import AppLinkShell from "@/components/layout/AppLinkShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "פרטי השיעור — SkillUp",
  description: "פתחו את אפליקציית SkillUp כדי לראות את פרטי השיעור.",
  robots: { index: false, follow: false },
};

export default async function LessonDeepLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppLinkShell
      title="פרטי השיעור"
      subtitle="השיעור שלך נמצא באפליקציית SkillUp. לחצו על הכפתור כדי לפתוח את האפליקציה או להתקין אותה."
      ctaLabel="פתח ב-SkillUp"
      ctaHref={`https://skillupwebsite.vercel.app/lesson/${id}`}
    />
  );
}
