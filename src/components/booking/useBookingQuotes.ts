"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchQuote,
  neededQuoteKeys,
  wizardPricing,
  type QuoteEntry,
  type RpcClient,
  type WizardPricing,
} from "@/lib/quote";
import type { AvailabilitySlot, LessonMode } from "@/lib/types";

/**
 * Fetches one quote_booking quote per distinct (mode, duration) in the
 * selection and keeps them cached for the life of the wizard. Missing entries
 * read as "loading"; `retry` clears failed ones so they are fetched again.
 */
export function useBookingQuotes(
  client: RpcClient,
  teacherId: string,
  mode: LessonMode | null,
  slots: AvailabilitySlot[],
): { pricing: WizardPricing; retry: () => void } {
  const [quotes, setQuotes] = useState<Record<string, QuoteEntry>>({});
  const inFlight = useRef(new Set<string>());
  const needed = useMemo(() => neededQuoteKeys(slots, mode), [slots, mode]);

  useEffect(() => {
    if (!mode) return;
    for (const { key, durationMinutes } of needed) {
      if (quotes[key] || inFlight.current.has(key)) continue;
      inFlight.current.add(key);
      fetchQuote(client, { teacherId, durationMinutes, mode }).then(
        (quote) => {
          inFlight.current.delete(key);
          setQuotes((q) => ({ ...q, [key]: { status: "ok", quote } }));
        },
        () => {
          inFlight.current.delete(key);
          setQuotes((q) => ({ ...q, [key]: { status: "error" } }));
        },
      );
    }
  }, [client, teacherId, mode, needed, quotes]);

  const retry = useCallback(() => {
    setQuotes((q) =>
      Object.fromEntries(Object.entries(q).filter(([, e]) => e.status === "ok")),
    );
  }, []);

  const pricing = useMemo(() => wizardPricing(slots, mode, quotes), [slots, mode, quotes]);
  return { pricing, retry };
}
