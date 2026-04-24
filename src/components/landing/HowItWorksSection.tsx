"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import RealAppFrame from "@/components/phone/RealAppFrame";

const FLOW_STEPS = [
  {
    number: 1,
    title: "חפשו מורה",
    description:
      "פתחו את האפליקציה, בחרו תחום, מסננים לפי אזור ומחיר. רואים מורים זמינים בקליק.",
    src: "/images/app-screens/student_homepage.jpeg",
    alt: "מסך הבית: חיפוש מורה לפי תחום ואזור",
    yOffset: 0,
  },
  {
    number: 2,
    title: "בחרו את המתאים",
    description:
      "פרופיל מלא של המורה: ניסיון, ביקורות, מקצועות, מחיר. הכל גלוי, בלי הפתעות.",
    src: "/images/app-screens/teacher_personalpage.jpeg",
    alt: "פרופיל מלא של מורה עם ביקורות",
    yOffset: 32,
  },
  {
    number: 3,
    title: "קבעו שיעור",
    description:
      "אשף בן 2 שלבים: בוחרים מקצוע, צורת שיעור (אונליין / אצל המורה / אצלכם), זמן ורמה.",
    src: "/images/app-screens/order_firstpage.jpeg",
    alt: "אשף הזמנת שיעור",
    yOffset: 14,
  },
  {
    number: 4,
    title: "התחילו ללמוד!",
    description:
      "אישור מיידי, קישור Zoom אם זה אונליין, תזכורת לפני השיעור. אתם פנויים ללמוד.",
    src: "/images/app-screens/order_confirmation.jpeg",
    alt: "השיעור הוזמן בהצלחה",
    yOffset: 48,
  },
] as const;

export default function HowItWorksSection() {
  return (
    <div className="w-full px-6 py-20 md:py-28 md:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header row */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <ScrollReveal>
              <Eyebrow n="03 / HOW IT WORKS">איך זה עובד</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="display display-lg mt-6 max-w-[14ch]">
                ארבעה צעדים.
                <br />
                <em className="not-italic grad-text">שיעור תוך דקות.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="max-w-[38ch] text-[15px] leading-[1.7] text-[var(--fg-muted)]">
              פתיחת האפליקציה, בחירת מורה, הזמנת שיעור, התחלת למידה. הכל מסך
              אחד, אחד מהטלפון.
            </p>
          </ScrollReveal>
        </div>

        {/* Storyboard */}
        <div className="relative">
          {/* Connecting dashed hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[180px] left-[5%] right-[5%] hidden h-px lg:block"
            style={{
              background:
                "repeating-linear-gradient(to right, var(--rule-strong) 0 6px, transparent 6px 14px)",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {FLOW_STEPS.map((step, i) => (
              <ScrollReveal key={step.number} delay={0.15 + i * 0.12}>
                <div
                  className="flex flex-col items-center text-center lg:block"
                  style={{
                    transform: `translateY(${step.yOffset}px)`,
                  }}
                >
                  <div className="relative mx-auto inline-block">
                    <RealAppFrame
                      src={step.src}
                      alt={step.alt}
                      width={180}
                    />
                    <span
                      className="absolute -top-3.5 -right-3.5 grid h-12 w-12 place-items-center rounded-full font-display text-lg font-black text-white shadow-[0_10px_20px_-8px_rgba(10,10,15,0.3)] ring-4 ring-[var(--bg)]"
                      style={{
                        background: "var(--color-ink-1000)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3 className="display display-md mt-6 text-xl font-extrabold">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[24ch] mx-auto text-[13px] leading-[1.6] text-[var(--fg-muted)]">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Flatten offsets on narrow layouts */}
      <style>{`
        @media (max-width: 1023px) {
          [data-storyboard-step] { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
