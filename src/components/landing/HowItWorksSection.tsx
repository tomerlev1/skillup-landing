"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import RealAppFrame from "@/components/phone/RealAppFrame";

// Each step paired with a real app screen showing exactly that moment in the flow.
const FLOW_STEPS = [
  {
    number: 1,
    title: "חפשו מורה",
    description:
      "פתחו את האפליקציה, בחרו תחום, מסננים לפי אזור ומחיר. רואים מורים זמינים בקליק.",
    src: "/images/app-screens/student_homepage.jpeg",
    alt: "מסך הבית: חיפוש מורה לפי תחום ואזור",
  },
  {
    number: 2,
    title: "בחרו את המתאים",
    description:
      "פרופיל מלא של המורה: ניסיון, ביקורות, מקצועות, מחיר. הכל גלוי, בלי הפתעות.",
    src: "/images/app-screens/teacher_personalpage.jpeg",
    alt: "פרופיל מלא של מורה עם ביקורות",
  },
  {
    number: 3,
    title: "קבעו שיעור",
    description:
      "אשף בן 2 שלבים: בוחרים מקצוע, צורת שיעור (אונליין / אצל המורה / אצלכם), זמן ורמה.",
    src: "/images/app-screens/order_firstpage.jpeg",
    alt: "אשף הזמנת שיעור",
  },
  {
    number: 4,
    title: "התחילו ללמוד!",
    description:
      "אישור מיידי, קישור Zoom אם זה אונליין, תזכורת לפני השיעור. אתם פנויים ללמוד.",
    src: "/images/app-screens/order_confirmation.jpeg",
    alt: "השיעור הוזמן בהצלחה",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <div
      className="section-bloom w-full px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "15%", ["--bloom-y" as string]: "20%" }}
    >
      <ScrollReveal>
        <p
          className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
          dir="ltr"
        >
          03 - איך זה עובד
        </p>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
          איך זה עובד?
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="mx-auto mt-3 mb-16 max-w-xl text-center text-dark-500">
          ארבעה צעדים פשוטים. שיעור פרטי בידיים תוך דקות.
        </p>
      </ScrollReveal>

      {/* 4-phone storyboard. RTL flow — step 1 sits on the right. */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-6">
        {FLOW_STEPS.map((step, i) => (
          <ScrollReveal key={step.number} delay={0.15 + i * 0.1}>
            <div className="relative flex flex-col items-center text-center">
              {/* Soft shared halo behind every phone — single-tint, no rainbow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-4 -z-10 mx-auto h-72 w-56 rounded-full bg-gradient-to-b from-brand-200/25 to-transparent blur-2xl"
              />

              {/* Phone with floating step badge */}
              <div className="relative">
                <RealAppFrame src={step.src} alt={step.alt} width={250} />
                <span className="absolute -top-3 -right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-base font-extrabold text-white shadow-md ring-4 ring-[#FBFAFC]">
                  {step.number}
                </span>
              </div>

              {/* Caption */}
              <h3 className="mt-6 text-lg font-extrabold text-dark-900">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-dark-500">
                {step.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
