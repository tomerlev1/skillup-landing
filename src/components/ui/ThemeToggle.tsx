"use client";

import { useEffect, useState } from "react";
import {
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePref,
} from "@/lib/theme";

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "light", label: "בהיר" },
  { value: "dark", label: "כהה" },
  { value: "system", label: "לפי המכשיר" },
];

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "system";
}

function apply(pref: ThemePref) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute(
    "data-theme",
    resolveTheme(pref, systemDark),
  );
}

export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    // Sync with storage after hydration (SSR can't know the stored value).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPref(readPref());
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  function choose(next: ThemePref) {
    setPref(next);
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    apply(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="מצב תצוגה"
      className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface p-1"
    >
      {OPTIONS.map((o) => {
        const active = pref === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(o.value)}
            className={`min-h-11 rounded-pill px-3 text-sm font-medium transition-colors duration-150 ${
              active
                ? "bg-action-soft text-action"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
