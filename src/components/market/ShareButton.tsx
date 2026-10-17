"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  teacherName: string;
  className?: string;
}

// Share the tutor profile: native share sheet where available (mobile),
// clipboard copy fallback (desktop) with a brief "הועתק" confirmation.
export default function ShareButton({ teacherName, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${teacherName} | SkillUp`,
      text: `מורה פרטי ב-SkillUp: ${teacherName}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing more we can do gracefully */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="שיתוף הפרופיל"
      className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--r-pill)] border border-line bg-surface sm:w-auto sm:px-4 text-[13px] font-semibold text-ink transition-colors hover:border-ink ${className}`}
    >
      {copied ? (
        <>
          <Check size={15} className="text-ok-text" />
          <span className="hidden sm:inline">הקישור הועתק</span>
        </>
      ) : (
        <>
          <Share2 size={15} />
          <span className="hidden sm:inline">שיתוף</span>
        </>
      )}
    </button>
  );
}
