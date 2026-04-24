import ScrollReveal from "@/components/animations/ScrollReveal";
import StoreButtons from "@/components/ui/StoreButtons";
import {
  TrustCheckIcon,
  ShieldVerifiedIcon,
} from "@/components/icons/CustomIcons";

// Warm-light panel to flow with the rest of the page (matches For Tutors panel).
export default function CTASection() {
  return (
    <div className="w-full px-6 py-20 md:py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="final-cta">
          {/* Brand glyph watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 h-[320px] w-[320px] opacity-[0.08] md:-bottom-16 md:h-[440px] md:w-[440px]"
            style={{
              insetInlineEnd: "-3rem",
              backgroundImage: "url(/images/SkillUp-Splash-Glyph.svg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
          />

          <div className="relative z-10 text-center">
            <ScrollReveal>
              <span
                className="mono-sm panel-sub-muted"
                dir="ltr"
              >
                09 / DOWNLOAD
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2
                className="display mt-6 font-black leading-[0.95] tracking-[-0.04em]"
                style={{
                  fontSize: "clamp(48px, 9vw, 120px)",
                  color: "var(--panel-fg)",
                }}
              >
                מוכנים
                <br />
                <em className="not-italic grad-text">להתחיל?</em>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="panel-muted mx-auto mt-6 max-w-[44ch] text-xl">
                חינם להתחיל, ללא עמלות תיווך לעולם. אתם מוצאים את המורה, ואנחנו
                רק מחברים.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-10 flex justify-center">
                <StoreButtons />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div
                className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                style={{
                  border: "1px solid var(--panel-rule)",
                  background: "var(--panel-surface)",
                  color: "var(--panel-fg)",
                }}
              >
                <span
                  className="inline-block h-[7px] w-[7px] rounded-full"
                  style={{
                    background: "var(--color-accent-500)",
                    boxShadow: "0 0 0 3px rgba(255,112,51,0.3)",
                  }}
                />
                בהשקה! מורים מייסדים מקבלים פרופיל מועדף בחודשי הפתיחה.
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div
                className="panel-sub-muted mt-8 flex flex-wrap items-center justify-center gap-8 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <TrustCheckIcon className="h-4 w-4" />
                  ביטול חינם בהתאם למדיניות הביטולים שלנו
                </span>
                <span className="inline-flex items-center gap-2">
                  <TrustCheckIcon className="h-4 w-4" />
                  0% עמלה
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldVerifiedIcon className="h-4 w-4" />
                  מורים מאומתים
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
