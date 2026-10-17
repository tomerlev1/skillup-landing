"use client";

import { useEffect, useState } from "react";
import { Moon, MonitorSmartphone, Sun } from "lucide-react";
import { resolveTheme, THEME_STORAGE_KEY, type ThemePref } from "@/lib/theme";

// Physical order of the switch (left → right): dark, auto, light.
// Like a light switch: right is "on" (light), left is "off" (dark), and the
// middle follows the device.
const STOPS: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "כהה", icon: Moon },
  { value: "system", label: "לפי המכשיר", icon: MonitorSmartphone },
  { value: "light", label: "בהיר", icon: Sun },
];

const CAPTION: Record<ThemePref, string> = {
  light: "מצב בהיר",
  dark: "מצב כהה",
  system: "לפי המכשיר",
};

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

const STOP = 40; // px between stops (track 128 = 3×40 + 8 padding)

export default function ThemeToggle({ showCaption = true }: { showCaption?: boolean }) {
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

  const track =
    pref === "light"
      ? "bg-[linear-gradient(90deg,#C9E6FF,#FFE9B8)]"
      : pref === "dark"
        ? "bg-[linear-gradient(90deg,#1E1B4B,#3B3486)]"
        : "bg-[linear-gradient(90deg,#2B2766,#C9C3FF_50%,#FFE9B8)]";

  return (
    <div className="inline-flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label="מצב תצוגה"
        dir="ltr"
        onKeyDown={onKeyDown}
        className={`relative h-12 w-[128px] shrink-0 rounded-pill p-1 shadow-[inset_0_1px_3px_rgba(20,19,31,0.25)] ring-1 ring-line/60 transition-[background] duration-500 ${track}`}
      >
        {/* Stars appear at night */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${pref === "dark" ? "opacity-100" : "opacity-0"}`}
        >
          <span className="absolute start-[56px] top-[12px] size-[3px] rounded-full bg-white/90" />
          <span className="absolute start-[78px] top-[26px] size-[2px] rounded-full bg-white/70" />
          <span className="absolute start-[100px] top-[14px] size-[2px] rounded-full bg-white/80" />
          <span className="absolute start-[112px] top-[30px] size-[3px] rounded-full bg-white/60" />
        </span>

        {/* Knob */}
        <span
          aria-hidden="true"
          className="absolute top-1 start-1 grid size-10 place-items-center rounded-full bg-white shadow-[0_4px_10px_-2px_rgba(20,19,31,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: `translateX(${index * STOP}px)` }}
        >
          <Active
            key={pref}
            size={20}
            strokeWidth={2.25}
            className={`theme-knob-icon ${
              pref === "light" ? "text-[#E08A00]" : pref === "dark" ? "text-[#4338CA]" : "text-action"
            }`}
          />
        </span>

        {/* Hit targets */}
        <div className="relative grid h-full grid-cols-3">
          {STOPS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={pref === s.value}
              aria-label={s.label}
              tabIndex={pref === s.value ? 0 : -1}
              onClick={() => choose(s.value)}
              className="grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-action"
            >
              {pref !== s.value && (
                <s.icon
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={pref === "dark" ? "text-white/70" : "text-ink/45"}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      {showCaption && (
        <span className="text-sm font-semibold text-ink-2" aria-live="polite">
          {CAPTION[pref]}
        </span>
      )}
    </div>
  );
}
