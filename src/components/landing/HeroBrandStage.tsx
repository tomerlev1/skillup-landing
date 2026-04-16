"use client";

import { motion } from "motion/react";
import {
  SubjectBookIcon,
  SubjectAtomIcon,
  SubjectPaletteIcon,
  SubjectRulerIcon,
  SubjectGlobeIcon,
  SubjectLightbulbIcon,
  SubjectMusicIcon,
  SubjectCodeIcon,
  SubjectChefHatIcon,
} from "@/components/icons/CustomIcons";

// Stage dimensions match the previous phone area roughly — keeps hero balance.
const STAGE_W = 460;
const STAGE_H = 640;

/**
 * Each floating subject icon orbits at its own radius/duration so they never sync.
 * Coordinates are relative to the stage center (positive x = right, positive y = down).
 */
const ICONS = [
  { Icon: SubjectBookIcon,       size: 38, x: -130, y: -180, dur: 9.2, delay: 0,   color: "brand-300" },
  { Icon: SubjectAtomIcon,       size: 44, x:  140, y: -160, dur: 11,  delay: 0.4, color: "brand-400" },
  { Icon: SubjectPaletteIcon,    size: 42, x: -180, y:  -40, dur: 10.4,delay: 0.9, color: "brand-200" },
  { Icon: SubjectRulerIcon,      size: 40, x:  180, y:   20, dur: 12.6,delay: 1.1, color: "brand-300" },
  { Icon: SubjectGlobeIcon,      size: 42, x: -160, y:  130, dur: 13.4,delay: 0.6, color: "brand-400" },
  { Icon: SubjectLightbulbIcon,  size: 36, x:  150, y:  150, dur: 9.8, delay: 1.5, color: "brand-300" },
  { Icon: SubjectMusicIcon,      size: 38, x:   60, y: -200, dur: 10.2,delay: 1.8, color: "brand-200" },
  { Icon: SubjectCodeIcon,       size: 40, x:  -70, y:  210, dur: 11.6,delay: 0.2, color: "brand-400" },
  { Icon: SubjectChefHatIcon,    size: 40, x:   80, y:  220, dur: 12,  delay: 1.3, color: "brand-300" },
] as const;

// All orbit icons resolve to muted brand-purple tints — single-palette restraint.
const COLOR_HEX: Record<string, string> = {
  "brand-200": "#DDD6FE",
  "brand-300": "#C4B5FD",
  "brand-400": "#A78BFA",
};

export default function HeroBrandStage() {
  return (
    <motion.div
      className="relative hidden sm:flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: STAGE_W, height: STAGE_H }}
    >
      {/* Soft centered spotlight — gives the glyph presence on the dark hero bg
          without enclosing it in a hard container. Fades into the page background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: STAGE_W * 0.95,
          height: STAGE_H * 0.85,
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(196,181,253,0.35) 0%, rgba(221,214,254,0.15) 45%, transparent 75%)",
        }}
      />

      {/* Floating subject icons orbiting around the central glyph */}
      {ICONS.map(({ Icon, size, x, y, dur, delay, color }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            color: COLOR_HEX[color] ?? "#C4B5FD",
            filter: "drop-shadow(0 2px 8px rgba(106,13,145,0.15))",
          }}
          initial={{ x: x, y: y, opacity: 0, scale: 0.5 }}
          animate={{
            x: [x, x + 14, x - 10, x],
            y: [y, y - 12, y + 8, y],
            opacity: 0.95,
            scale: 1,
          }}
          transition={{
            x: { duration: dur, repeat: Infinity, ease: "easeInOut", delay },
            y: { duration: dur * 1.15, repeat: Infinity, ease: "easeInOut", delay },
            opacity: { duration: 0.8, delay: 0.6 + delay * 0.15, ease: "easeOut" },
            scale: { duration: 0.8, delay: 0.6 + delay * 0.15, ease: "easeOut" },
          }}
        >
          <Icon size={size} className="block" />
        </motion.div>
      ))}

      {/* Central glyph — the SkillUp graduation cap */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative">
          {/* Glow halo — violet-white spotlight behind the glyph */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -m-16 rounded-full animate-glow-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(196,181,253,0.12) 40%, transparent 70%)",
            }}
          />
          <img
            src="/images/SkillUp-Splash-Glyph.svg"
            alt="SkillUp"
            width={180}
            height={154}
            className="relative drop-shadow-[0_2px_20px_rgba(137,86,232,0.25)]"
          />
        </div>
        <span className="mt-4 text-3xl font-black tracking-wide text-dark-900 md:text-4xl">
          SkillUp
        </span>
      </motion.div>

      {/* (scroll-down cue removed per design feedback) */}
    </motion.div>
  );
}
