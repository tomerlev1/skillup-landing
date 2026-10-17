import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { termsContent } from "@/lib/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שימוש - SkillUp",
  description: "תנאי השימוש של אפליקציית SkillUp",
};

export default function TermsPage() {
  return <LegalPageLayout {...termsContent} />;
}
