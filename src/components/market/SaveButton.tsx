"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";

interface SaveButtonProps {
  teacherId: string;
  teacherName: string;
  /** "overlay" sits on a photo (cards); "plain" sits on the page surface. */
  variant?: "overlay" | "plain";
}

// Save-to-list heart on every card/profile — optimistic, guest-friendly
// (localStorage), creates the return-visit list.
export default function SaveButton({ teacherId, teacherName, variant = "overlay" }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const plain = variant === "plain";

  useEffect(() => {
    const sync = () => setSaved(isFavorite(teacherId));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, [teacherId]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleFavorite(teacherId));
      }}
      aria-label={saved ? `הסרת ${teacherName} מהשמורים` : `שמירת ${teacherName}`}
      aria-pressed={saved}
      className={`relative grid cursor-pointer place-items-center rounded-full transition-transform hover:scale-110 active:scale-95 ${
        plain
          ? "h-11 w-11 border border-line bg-surface"
          : "h-[34px] w-[34px] bg-white/90 shadow-sm after:absolute after:-inset-[5px] after:content-['']"
      }`}
    >
      <Heart
        size={16}
        className={
          saved
            ? "fill-red-500 text-red-500"
            : plain
              ? "text-ink-2"
              : "fill-black/25 text-white"
        }
      />
    </button>
  );
}
