"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Sticky footer (e.g. the apply button with a live result count). */
  footer?: React.ReactNode;
}

// Mobile bottom sheet: drawer from the bottom, body scroll locked,
// sticky footer keeps the apply action thumb-reachable.
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="סגירה"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[var(--r-md)] bg-surface">
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mk-hairline-t min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="mk-hairline-t bg-surface px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
