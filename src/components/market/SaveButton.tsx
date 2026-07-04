"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";

interface SaveButtonProps {
  teacherId: string;
  teacherName: string;
}

// Save-to-list heart on every card/profile — optimistic, guest-friendly
// (localStorage), creates the return-visit list.
export default function SaveButton({ teacherId, teacherName }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

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
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110 active:scale-95"
    >
      <Heart
        size={16}
        className={
          saved ? "fill-red-500 text-red-500" : "fill-black/25 text-white"
        }
      />
    </button>
  );
}
