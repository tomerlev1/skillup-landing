"use client";

import { useEffect, useState } from "react";
import { Moon, MonitorSmartphone, Sun } from "lucide-react";
import { resolveTheme, THEME_STORAGE_KEY, type ThemePref } from "@/lib/theme";

// Physical order (left → right): dark, auto, light. Like a light switch:
// right is "on" (light), left is "off" (dark), the middle follows the device.
const STOPS: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "מצב כהה", icon: Moon },
  { value: "system", label: "לפי המכשיר", icon: MonitorSmartphone },
  { value: "light", label: "מצב בהיר", icon: Sun },
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
  document.documentElement.setAttribute("data-theme", resolveTheme(pref, systemDark));
}

const STOP = 30; // px between stops: track 98 = 3×30 + 8 padding

// Compact, tactile three-way switch for the navbar: a recessed track and a
// raised knob that slides between the stops. Neutral by design — the brand
// colour stays reserved for actions.
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

  function onKeyDown(e: React.KeyboardEvent) {
    const i = STOPS.findIndex((s) => s.value === pref);
    if (e.key === "ArrowLeft" && i > 0) choose(STOPS[i - 1].value);
    if (e.key === "ArrowRight" && i < STOPS.length - 1) choose(STOPS[i + 1].value);
  }

  const index = STOPS.findIndex((s) => s.value === pref);
  const Active = STOPS[index].icon;

  return (
    <div
      role="radiogroup"
      aria-label="מצב תצוגה"
      title={STOPS[index].label}
      dir="ltr"
      onKeyDown={onKeyDown}
      className="theme-track relative h-[38px] w-[98px] shrink-0 rounded-pill p-1"
    >
      {/* Raised knob */}
      <span
        aria-hidden="true"
        className="theme-knob absolute start-1 top-1 grid size-[30px] place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ transform: `translateX(${index * STOP}px)` }}
      >
        <Active key={pref} size={16} strokeWidth={2.25} className="theme-knob-icon text-ink" />
      </span>

      {/* Stops (hit targets) */}
      <div className="relative grid h-full grid-cols-3">
        {STOPS.map((s) => (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={pref === s.value}
            aria-label={s.label}
            title={s.label}
            tabIndex={pref === s.value ? 0 : -1}
            onClick={() => choose(s.value)}
            className="hit-44 grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-action"
          >
            {pref !== s.value && (
              <s.icon size={14} strokeWidth={2} aria-hidden="true" className="text-ink-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
