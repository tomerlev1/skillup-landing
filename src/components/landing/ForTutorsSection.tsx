"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import Button from "@/components/ui/Button";
import RealAppFrame from "@/components/phone/RealAppFrame";

const TEACHER_SCREENS = [
  {
    src: "/images/app-screens/teacher-earnings.png",
    alt: "דשבורד הכנסות למורים: מגמת הכנסות שבועית",
    title: "דשבורד הכנסות",
    caption: "גרפי מגמה, יעדים, השוואה שבועית וחודשית.",
  },
  {
    src: "/images/app-screens/teacher_calendar.jpeg",
    alt: "יומן השיעורים והזמינות של המורה",
    title: "יומן ושיעורים",
    caption: "ניהול זמינות, אישור הזמנות, מעקב אחרי כל יום.",
  },
  {
    src: "/images/app-screens/teacher_crmpage.jpeg",
    alt: "מעקב תלמידים פעילים",
    title: "התלמידים שלכם",
    caption: "סטטיסטיקות נוכחות, קשר ישיר, פילטרים.",
  },
  {
    src: "/images/app-screens/teacher_personalpage.jpeg",
    alt: "פרופיל ציבורי של המורה",
    title: "הפרופיל הציבורי שלכם",
    caption: "תצוגה מקדימה כפי שתלמידים רואים אתכם.",
  },
] as const;

const FREE_TIER = [
  "פרופיל ציבורי באפליקציה",
  "יומן ושיעורים",
  "צ׳אט עם תלמידים קיימים",
  "תזכורות אוטומטיות",
  "0% עמלת תיווך",
];

const PRO_TIER = [
  "תלמידים ללא הגבלה",
  "לידים חמים מתלמידים חדשים",
  "הודעות מתלמידים חדשים נכנסות אליכם",
  "עדיפות בתוצאות החיפוש",
  "תג PRO זהב על הפרופיל",
  "דשבורד הכנסות מורחב",
  "0% עמלת תיווך, תמיד",
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.18" />
      <path
        d="M5 8.2 L7 10 L11 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ForTutorsSection() {
  return (
    <section
      id="for-tutors"
      className="section-bloom relative w-full overflow-hidden px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "50%", ["--bloom-y" as string]: "50%" }}
    >
      {/* Stronger localized violet bloom — the color moment of the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(196,181,253,0.22), transparent 70%)",
        }}
      />

      {/* Decorative SkillUp glyph watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-[420px] w-[420px] opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage: "url(/images/SkillUp-Splash-Glyph.svg)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
              dir="ltr"
            >
              06 - למורים
            </p>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white/70 px-3.5 py-1 text-xs font-semibold text-dark-700 backdrop-blur-sm">
              מודל מנויים ממוקד צמיחה
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
              אתם צומחים, ואנחנו צומחים יחד איתכם.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-dark-600 md:text-lg">
              SkillUp מחבר אתכם ישירות לתלמידים באזור שלכם. אתם קובעים את המחיר,
              את הזמינות, ואת המקצועות. בלי טלפונים ל-20 הורים, בלי מתווכים, בלי
              ניירת. הרשמה לוקחת 5 דקות.
            </p>
          </ScrollReveal>
        </div>

        {/* Teacher screens gallery */}
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {TEACHER_SCREENS.map((screen, i) => (
            <ScrollReveal key={screen.src} delay={0.15 + i * 0.08}>
              <div className="flex flex-col items-center text-center">
                <RealAppFrame src={screen.src} alt={screen.alt} width={240} />
                <h3 className="mt-5 text-base font-bold text-dark-900">
                  {screen.title}
                </h3>
                <p className="mt-1.5 text-sm text-dark-500">{screen.caption}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Tier comparison: Free vs Pro */}
        <ScrollReveal delay={0.4}>
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-extrabold tracking-tight text-dark-900 md:text-3xl">
              שתי דרגות. דרך אחת לצמוח.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-dark-600 md:text-base">
              התחילו חינם. כשהפעילות שלכם גדלה, Pro פותח לכם את הברז של תלמידים
              חדשים. כשאתם צומחים, אנחנו צומחים יחד איתכם.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Free tier */}
          <ScrollReveal delay={0.45}>
            <div className="flex h-full flex-col rounded-3xl border border-dark-200 bg-white p-7 shadow-sm transition-colors hover:border-brand-300 md:p-8">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-dark-500">
                  Free
                </span>
                <span className="text-xs font-semibold text-dark-500">
                  להתחלה
                </span>
              </div>
              <h4 className="mt-2 text-2xl font-extrabold text-dark-900 md:text-3xl">
                חינם · עד 4 תלמידים
              </h4>
              <p className="mt-2 text-sm text-dark-600">
                כל מה שצריך כדי לבדוק שהפלטפורמה עובדת לכם, בלי להוציא שקל.
              </p>
              <ul className="mt-6 space-y-3">
                {FREE_TIER.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-dark-800"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#download"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-dark-300 bg-white px-5 py-3 text-sm font-bold text-dark-800 transition-colors hover:bg-dark-50"
              >
                התחילו חינם
              </a>
            </div>
          </ScrollReveal>

          {/* Pro tier */}
          <ScrollReveal delay={0.55}>
            <div className="relative flex h-full flex-col rounded-3xl border border-brand-200 bg-white p-7 shadow-md transition-shadow hover:shadow-lg md:p-8">
              {/* Recommended badge */}
              <span className="absolute -top-3 right-7 rounded-full bg-accent-500 px-3 py-1 text-xs font-extrabold text-white shadow-md">
                לצמיחה אמיתית
              </span>

              <div className="mb-1 flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1l2 5 5 .5-3.7 3.4 1.1 4.9L8 12l-4.4 2.8 1.1-4.9L1 6.5 6 6z" />
                  </svg>
                  PRO
                </span>
                <span className="text-xs font-semibold text-brand-600">
                  לצמיחה
                </span>
              </div>
              <h4 className="mt-2 text-2xl font-extrabold text-dark-900 md:text-3xl">
                Pro · ללא הגבלה
              </h4>
              <p className="mt-2 text-sm text-dark-700">
                כדי להגיע לתלמידים חדשים, לקבל לידים חמים, ולגדל את העסק שלכם
                באמת. התשלום שלכם זז רק כשהעסק שלכם זז.
              </p>
              <ul className="mt-6 space-y-3">
                {PRO_TIER.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-dark-800"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                    <span className="font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#download"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-accent-600 to-accent-500 px-5 py-3 text-sm font-extrabold text-white shadow-md transition-shadow hover:shadow-lg"
              >
                שדרגו ל-Pro כשתהיו מוכנים
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={0.7}>
          <div className="mt-14 flex flex-col items-center gap-3">
            <Button variant="primary" href="#download" arrow>
              הצטרפו כמורים
            </Button>
            <p className="max-w-md text-center text-xs leading-relaxed text-dark-500">
              0% עמלת תיווך, תמיד. אנחנו לא לוקחים חתיכה מהשיעור שלכם.
              ההכנסה שלכם מ-Pro זזה רק כשאתם מחליטים לצמוח.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
