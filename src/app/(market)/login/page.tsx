import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "התחברות | SkillUp",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="טוב לראות אתכם שוב"
      subtitle="מתחברים עם אותו חשבון כמו באפליקציית SkillUp."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
