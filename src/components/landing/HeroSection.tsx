"use client";

import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import RealAppFrameCycling from "@/components/phone/RealAppFrameCycling";
import {
  VideoIcon,
  DashboardIcon,
  ShieldVerifiedIcon,
} from "@/components/icons/CustomIcons";

const HERO_SCREENS = [
  {
    src: "/images/app-screens/student_homepage.jpeg",
    alt: "מסך הבית: חיפוש מורה לפי תחום ואזור",
  },
  {
    src: "/images/app-screens/teacher_personalpage.jpeg",
    alt: "פרופיל מלא של מורה עם ביקורות",
  },
  {
    src: "/images/app-screens/order_firstpage.jpeg",
    alt: "אשף הזמנת שיעור",
  },
  {
    src: "/images/app-screens/order_confirmation.jpeg",
    alt: "השיעור הוזמן בהצלחה",
  },
] as const;

export default function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-28 pb-16 md:grid-cols-[1.2fr_1fr] md:px-16 md:pt-24">
        {/* Text side */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow n="00 / SKILLUP">Intro</Eyebrow>
          </motion.div>

          <motion.h1
            className="display mt-5 text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[-0.04em] text-[var(--fg)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            המורה הפרטי
            <br />
            הנכון לכם <em className="not-italic grad-text">נמצא כאן</em>,<br />
            <span className="block text-[0.5em] font-semibold tracking-[-0.01em] leading-tight text-[var(--fg-muted)]">
              כל מקצוע · כל גיל · כל מקום בישראל
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[44ch] text-base leading-relaxed text-[var(--fg-muted)] md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            9 תחומים, 3 דרכי לימוד, אלפי שילובים. אתם בוחרים את המורה, את השעה
            ואת המקום, ואנחנו דואגים שהכל יעבוד חלק - בלי עמלות תיווך, בלי
            רדיפה בוואטסאפ, בעברית מלאה.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button variant="primary" arrow href="#download">
              זמין בחנות האפליקציות
            </Button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] transition-colors hover:text-[var(--accent)]"
            >
              ראו איך זה עובד ↓
            </a>
          </motion.div>

          {/* Hero stat strip */}
          <motion.div
            className="mt-12 grid max-w-[560px] grid-cols-3 gap-6 border-t border-[var(--rule)] pt-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <div className="font-display text-[32px] font-black tracking-tight text-[var(--fg)]">
                <span className="font-mono-lc">0%</span>
              </div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">עמלה</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-black tracking-tight text-[var(--fg)]">
                9
              </div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">
                תחומי לימוד
              </div>
            </div>
            <div>
              <div className="font-display text-[26px] font-black leading-tight tracking-tight text-[var(--fg)]">
                גמיש
              </div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">
                ביטול לפי מדיניות הביטולים
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual side: phone + floating chips */}
        <div className="relative flex min-h-[520px] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, rotate: -4, y: 20 }}
            animate={{ opacity: 1, rotate: -2.5, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "center" }}
            whileHover={{ rotate: -1, y: -6, transition: { duration: 0.4 } }}
          >
            <RealAppFrameCycling screens={HERO_SCREENS} width={280} />
          </motion.div>

          {/* Floating chip: Zoom */}
          <motion.div
            className="pointer-events-none absolute top-[10%] right-[-30px] z-10 flex items-center gap-2 rounded-[14px] border border-[var(--rule)] bg-white px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] shadow-[0_20px_40px_-16px_rgba(10,10,15,0.2)] animate-float-y"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{ animationDelay: "0.2s" }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <VideoIcon size={14} />
            </span>
            לינק Zoom אוטומטי
          </motion.div>

          {/* Floating chip: Tutor management tools */}
          <motion.div
            className="pointer-events-none absolute bottom-[12%] left-[-40px] z-10 flex items-center gap-2 rounded-[14px] border border-[var(--rule)] bg-white px-3.5 py-2.5 text-xs font-semibold text-[var(--fg)] shadow-[0_20px_40px_-16px_rgba(10,10,15,0.2)] animate-float-y"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ animationDelay: "1.2s" }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <DashboardIcon size={14} />
            </span>
            כלי ניהול למורה
          </motion.div>

          {/* Floating chip: Verified tutor (dark) */}
          <motion.div
            className="pointer-events-none absolute top-[44%] left-[-56px] z-10 flex items-center gap-2 rounded-[14px] bg-[var(--color-ink-1000)] px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_20px_40px_-16px_rgba(10,10,15,0.35)] animate-float-y"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ animationDelay: "2.1s" }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent)] text-white">
              <ShieldVerifiedIcon size={14} />
            </span>
            מורה מאומת
          </motion.div>

        </div>
      </div>
    </div>
  );
}
