"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

interface GatedLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Allow teachers too (default: students only, teachers get a hint). */
  allowTeachers?: boolean;
}

// The login wall for high-intent actions (booking, messaging). Guests are
// sent through /login with `next` preserving the exact action — after
// auth they land where they clicked, not back at the start.
export default function GatedLink({
  href,
  className = "",
  children,
  allowTeachers = false,
}: GatedLinkProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  function onClick() {
    if (loading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    if (!allowTeachers && profile?.role === "teacher") {
      alert("הפעולה הזו זמינה לתלמידים. מורים מנהלים שיעורים דרך האפליקציה.");
      return;
    }
    router.push(href);
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
