import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { privacyContent } from "@/lib/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות - SkillUp",
  description: "מדיניות הפרטיות של אפליקציית SkillUp",
};

export default function PrivacyPage() {
  return <LegalPageLayout {...privacyContent} />;
}
