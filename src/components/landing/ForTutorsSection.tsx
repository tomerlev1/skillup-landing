"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import Button from "@/components/ui/Button";
import RealAppFrame from "@/components/phone/RealAppFrame";

// Three real tutor-side app screens, tilted magazine-style.
const TUTOR_SCREENS = [
  {
    src: "/images/app-screens/teacher_personalpage.jpeg",
    alt: "הפרופיל הציבורי של המורה",
    width: 180,
    rotate: -4,
    yOffset: 10,
  },
  {
    src: "/images/app-screens/teacher-earnings.png",
    alt: "דשבורד הכנסות למורים",
    width: 200,
    rotate: 2,
    yOffset: 0,
  },
  {
    src: "/images/app-screens/teacher_crmpage.jpeg",
    alt: "ניהול תלמידים ב-SkillUp",
    width: 180,
    rotate: -2,
    yOffset: 30,
  },
] as const;

export default function ForTutorsSection() {
  return (
    <section
      id="for-tutors"
      className="panel-section w-full px-6 py-20 md:py-28 md:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* Copy side */}
          <div>
            <ScrollReveal>
              <div className="flex items-center gap-4">
                <span
                  className="mono-sm panel-sub-muted"
                  dir="ltr"
                >
                  05 / FOR TUTORS
                </span>
                <span
                  className="h-px w-8"
                  style={{ background: "var(--panel-rule)" }}
                  aria-hidden="true"
                />
                <span
                  className="eyebrow"
                  style={{ color: "var(--panel-muted)" }}
                >
                  למורים
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2
                className="display display-lg mt-6"
                style={{ color: "var(--panel-fg)" }}
              >
                אתם צומחים,
                <br />
                <em className="not-italic grad-text">
                  ואנחנו צומחים יחד איתכם.
                </em>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="panel-muted mt-6 max-w-[44ch] text-base leading-[1.7]">
                SkillUp מחבר אתכם ישירות לתלמידים באזור שלכם. אתם קובעים את
                המחיר, את הזמינות, ואת המקצועות. בלי טלפונים ל-20 הורים, בלי
                מתווכים, בלי ניירת. הרשמה לוקחת 5 דקות.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button variant="primary" arrow href="#download">
                  הצטרפו כמורים
                </Button>
                <a
                  href="#features"
                  className="text-sm font-semibold transition-colors hover:text-[var(--accent)]"
                  style={{ color: "var(--panel-fg)" }}
                >
                  ראו את היכולות ←
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Visual side — 3 tilted phones */}
          <ScrollReveal delay={0.2}>
            <div className="flex items-center justify-center gap-4">
              {TUTOR_SCREENS.map((s) => (
                <div
                  key={s.src}
                  style={{
                    transform: `rotate(${s.rotate}deg) translateY(${s.yOffset}px)`,
                  }}
                >
                  <RealAppFrame src={s.src} alt={s.alt} width={s.width} />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
