"use client";

import { motion } from "motion/react";
import Button from "@/components/ui/Button";
import HeroBrandStage from "@/components/landing/HeroBrandStage";

export default function HeroSection() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-6 px-6 pt-24 pb-12 md:flex-row md:gap-20 md:px-16 md:pb-0 md:pt-20">
        {/* Text side */}
        <div className="flex max-w-xl flex-col items-center text-center md:items-start md:text-right">
          {/* Eyebrow */}
          <motion.p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            dir="ltr"
          >
            00 - SkillUp
          </motion.p>

          {/* Title */}
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-dark-900 md:text-6xl lg:text-7xl">
            <motion.span
              className="block text-dark-900"
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              המורה הפרטי הנכון לכם נמצא כאן,
            </motion.span>
            <motion.span
              className="gradient-text mt-2 block"
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              כל מקצוע, כל גיל, כל מקום בישראל.
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 mb-8 max-w-xl text-base leading-relaxed text-dark-600 md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            9 תחומים, 3 דרכי לימוד, אלפי שילובים. אתם בוחרים את המורה, את השעה
            ואת המקום, ואנחנו דואגים שהכל יעבוד חלק - בלי עמלות תיווך, בלי
            רדיפה בוואטסאפ, בעברית מלאה.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row md:items-center md:justify-start">
              <Button variant="primary" arrow href="#download">
                זמין עכשיו בחנות האפליקציות
              </Button>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-dark-700 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
              >
                ראו איך זה עובד ↓
              </a>
            </div>
          </motion.div>
        </div>

        {/* Brand stage — animated splash recreation, no phones */}
        <HeroBrandStage />
      </div>
    </div>
  );
}
