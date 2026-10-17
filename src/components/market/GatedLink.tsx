"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

interface GatedLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Allow teachers too (default: students only, teachers get a hint). */
  allowTeachers?: boolean;
  /** Render the wrapper inline-block (pills in a flex/inline row) instead of block. */
  inline?: boolean;
  /** Accessible name when the visible text alone is ambiguous (e.g. a bare time). */
  ariaLabel?: string;
}

const TEACHER_MESSAGE =
  "קביעת שיעורים זמינה לחשבונות של לומדים. מורים מנהלים שיעורים מהאפליקציה.";

// The login wall for high-intent actions (booking, messaging). Guests are
// sent through /login with `next` preserving the exact action — after
// auth they land where they clicked, not back at the start.
export default function GatedLink({
  href,
  className = "",
  children,
  allowTeachers = false,
  inline = false,
  ariaLabel,
}: GatedLinkProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [notice, setNotice] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!notice) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setNotice(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotice(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notice]);

  function onClick() {
    if (loading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    if (!allowTeachers && profile?.role === "teacher") {
      setNotice(true);
      return;
    }
    router.push(href);
  }

  return (
    <span ref={wrapRef} className={`relative ${inline ? "inline-block" : "block"}`}>
      <button type="button" onClick={onClick} className={className} aria-label={ariaLabel}>
        {children}
      </button>
      {notice && (
        <span
          role="status"
          className="absolute bottom-full end-0 z-30 mb-2 block w-max max-w-[min(280px,calc(100vw-32px))] rounded-[var(--r-sm)] border border-line bg-surface p-3 text-sm leading-relaxed text-ink shadow-[var(--shadow-lift)]"
        >
          {TEACHER_MESSAGE}
        </span>
      )}
    </span>
  );
}
