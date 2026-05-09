import AppLinkShell from "@/components/layout/AppLinkShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הודעה חדשה — SkillUp",
  description: "פתחו את אפליקציית SkillUp כדי לקרוא את ההודעה.",
  robots: { index: false, follow: false },
};

export default async function ChatDeepLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppLinkShell
      title="הודעה חדשה ממתינה"
      subtitle="פתחו את אפליקציית SkillUp כדי להמשיך את השיחה."
      ctaLabel="פתח ב-SkillUp"
      ctaHref={`https://skillupwebsite.vercel.app/chat/${id}`}
    />
  );
}
