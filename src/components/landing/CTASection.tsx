"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import StoreButtons from "@/components/ui/StoreButtons";
import {
  TrustCheckIcon,
  ShieldVerifiedIcon,
} from "@/components/icons/CustomIcons";

export default function CTASection() {
  return (
    <div className="w-full px-6 py-20 md:py-28 md:px-16">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] px-8 py-14 text-center shadow-2xl shadow-brand-900/20 md:px-16 md:py-20"
        style={{
          background: "linear-gradient(135deg, #6A0D91 0%, #4C0966 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Brand glyph watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-12 h-[320px] w-[320px] opacity-[0.06] md:-bottom-16 md:-right-16 md:h-[440px] md:w-[440px]"
          style={{
            backgroundImage: "url(/images/SkillUp-Splash-Glyph.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />

        <div className="relative z-10">
          <ScrollReveal>
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70"
              dir="ltr"
            >
              10 - להורדה
            </p>
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              מוכנים להתחיל?
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-lg text-white/80 md:text-xl">
              חינם להתחיל, ללא עמלות תיווך לעולם.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-2 mb-9 text-sm text-white/60 md:text-base">
              אתם מוצאים את המורה, ואנחנו רק מחברים.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex justify-center">
              <StoreButtons />
            </div>
          </ScrollReveal>

          {/* Launch line */}
          <ScrollReveal delay={0.25}>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              בהשקה! מורים מייסדים מקבלים פרופיל מועדף בחודשי הפתיחה.
            </p>
          </ScrollReveal>

          {/* Trust badges */}
          <ScrollReveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              <span className="flex items-center gap-1.5 text-sm text-white/75">
                <TrustCheckIcon className="h-4 w-4" />
                ביטול חינם עד 24 שעות
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/75">
                <TrustCheckIcon className="h-4 w-4" />
                0% עמלה. תמיד.
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/75">
                <ShieldVerifiedIcon className="h-4 w-4" />
                מורים מאומתים
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
