"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width on desktop. */
  width?: "sm" | "md" | "lg";
}

const WIDTH = { sm: "sm:max-w-[420px]", md: "sm:max-w-[560px]", lg: "sm:max-w-[720px]" };

// Modal: a centred card on desktop, a bottom sheet on phones. Body scroll is
// locked while open; Esc and the backdrop close it.
export default function Dialog({ open, onClose, title, description, children, footer, width = "md" }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="סגירה" onClick={onClose} className="absolute inset-0 bg-[rgba(15,14,40,0.45)] backdrop-blur-[2px]" />
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-[var(--r-lg)] bg-surface shadow-[var(--shadow-lift)] ring-1 ring-line/60 sm:rounded-[var(--r-lg)] ${WIDTH[width]}`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm leading-relaxed text-ink-2">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="-me-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
          >
            <X strokeWidth={2} size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-line px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
