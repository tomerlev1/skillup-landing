import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "הרשמה | SkillUp",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="נעים להכיר"
      subtitle="חשבון אחד לאתר ולאפליקציה: קובעים שיעורים, מדברים עם מורים ועוקבים אחרי ההתקדמות."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
