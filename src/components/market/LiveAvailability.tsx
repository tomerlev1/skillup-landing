"use client";

import { useCallback, useSyncExternalStore } from "react";
import { availabilityLabel } from "@/lib/availability-label";

/** "יש מקום מחר · 17:00" → day text + LTR-isolated time. */
function AvailabilityText({ label }: { label: string }) {
  const i = label.lastIndexOf(" · ");
  if (i < 0) return <span suppressHydrationWarning>{label}</span>;
  return (
    <>
      <span suppressHydrationWarning>{label.slice(0, i)}</span> ·{" "}
      <span className="ltr-isolate tnum" suppressHydrationWarning>
        {label.slice(i + 3)}
      </span>
    </>
  );
}

// Re-check once a minute so a long-open tab rolls "היום" over after midnight.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/**
 * "יש מקום היום/מחר/ביום X · HH:MM" computed against the browser's clock.
 * Cards are ISR-rendered, so the label baked in at render time can be stale
 * after midnight. Hydration uses the server label (`initialLabel`, no
 * mismatch), then React swaps in the live label if it differs.
 */
function useLiveLabel(startIso: string, initialLabel: string | null): string | null {
  const getSnapshot = useCallback(() => availabilityLabel(startIso, new Date()), [startIso]);
  const getServerSnapshot = useCallback(() => initialLabel, [initialLabel]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface LiveAvailabilityProps {
  startIso: string;
  /** Label computed at server render time (same function, server clock). */
  initialLabel: string | null;
  /** "pill": white pill on the photo. "green": green text line. */
  variant: "pill" | "green";
  className?: string;
}

export default function LiveAvailability({
  startIso,
  initialLabel,
  variant,
  className = "",
}: LiveAvailabilityProps) {
  const label = useLiveLabel(startIso, initialLabel);
  if (!label) return null;

  if (variant === "pill") {
    return (
      // White in both themes on purpose: it sits on a photo.
      <span
        className={`absolute bottom-2.5 start-2.5 inline-flex max-w-[calc(100%-20px)] items-center gap-1.5 whitespace-nowrap rounded-[var(--r-pill)] bg-white/95 py-[5px] ps-2.5 pe-3 text-[13px] font-semibold leading-[18px] text-[#0B7A55] shadow-[0_1px_3px_rgba(0,0,0,0.12)] ${className}`}
      >
        <span
          aria-hidden="true"
          className="size-[7px] shrink-0 rounded-full bg-[#0E9F6E] shadow-[0_0_0_3px_rgba(14,159,110,0.18)]"
        />
        <span className="truncate">
          <AvailabilityText label={label} />
        </span>
      </span>
    );
  }

  return (
    <p
      className={`flex min-w-0 items-center gap-1.5 text-sm font-semibold leading-5 text-ok-text ${className}`}
    >
      <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-ok" />
      <span className="truncate">
        <AvailabilityText label={label} />
      </span>
    </p>
  );
}
