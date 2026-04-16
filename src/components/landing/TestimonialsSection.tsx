import ScrollReveal from "@/components/animations/ScrollReveal";

const STUDENT_PERKS = [
  "גישה מוקדמת לכל 9 התחומים, מבגרות ועד מיומנויות חיים",
  'פתיחת טייר "צעד ראשון" כבר מהשיעור הראשון',
  "ללא דמי רישום. אי פעם.",
];

const TEACHER_PERKS = [
  "פרופיל מועדף בתוצאות החיפוש בחודשי ההשקה",
  "ללא עמלת תיווך. התלמיד משלם לכם ישירות.",
  "תג PRO ודשבורד הכנסות מלא, מהיום הראשון",
];

function CheckBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-dark-700">
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
        <path
          d="M5 8.2 L7 10 L11 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="section-bloom w-full px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "15%", ["--bloom-y" as string]: "40%" }}
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            dir="ltr"
          >
            05 - קהילת הפתיחה
          </p>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
            אנחנו רק מתחילים, והאמת חשובה לנו.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-3 mb-12 max-w-2xl text-center text-dark-500">
            אין לנו עדיין אלפי ביקורות מזויפות. יש לנו חזון, אפליקציה מוכנה,
            וקהילה שאתם מוזמנים לבנות איתנו מהיום הראשון.
          </p>
        </ScrollReveal>

        {/* Founder's letter */}
        <ScrollReveal delay={0.15}>
          <div className="mb-8 rounded-3xl border border-dark-200 bg-white p-7 shadow-sm md:p-10">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-dark-500">
              מכתב מהמייסדים
            </span>
            <p className="text-base leading-relaxed text-dark-800 md:text-lg">
              בנינו את SkillUp כי מצאנו את עצמנו, כמו כל הורה ותלמיד בישראל,
              רודפים אחרי המלצות בקבוצות וואטסאפ, מתאמים שעות בטלפון, ומשלמים
              במזומן בלי שום שקיפות. בלי שום הגיון. רצינו שיהיה מקום אחד
              בעברית, על הטלפון, שבו רואים מורה, רואים מחיר, רואים שעות,
              ולוחצים. בלי תיווך. בלי עמלות. בלי הפתעות. SkillUp כאן, עכשיו,
              ואתם מוזמנים להיות חלק מההתחלה שלנו.
            </p>
            <p className="mt-4 text-sm font-semibold text-dark-600">
              צוות SkillUp
            </p>
          </div>
        </ScrollReveal>

        {/* Founding members — 2 cards, unified chrome */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ScrollReveal delay={0.2}>
            <div className="relative flex h-full flex-col rounded-3xl border border-dark-200 bg-white p-7 shadow-sm transition-colors hover:border-brand-300">
              <span className="absolute top-5 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                מומלץ
              </span>
              <span className="mb-2 inline-flex w-fit rounded-full bg-dark-100 px-3 py-1 text-xs font-bold text-dark-700">
                מהלך פתיחה
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-dark-900">
                חברי SkillUp הראשונים
              </h3>
              <p className="mt-1 text-sm text-dark-500">לתלמידים, הורים ולומדים</p>

              <ul className="mt-5 space-y-3">
                {STUDENT_PERKS.map((perk) => (
                  <CheckBullet key={perk}>{perk}</CheckBullet>
                ))}
              </ul>

              <a
                href="#download"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-500"
              >
                הורידו את האפליקציה
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex h-full flex-col rounded-3xl border border-dark-200 bg-white p-7 shadow-sm transition-colors hover:border-brand-300">
              <span className="mb-2 inline-flex w-fit rounded-full bg-dark-100 px-3 py-1 text-xs font-bold text-dark-700">
                מורים מייסדים
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-dark-900">
                בנו את הקריירה שלכם איתנו
              </h3>
              <p className="mt-1 text-sm text-dark-500">למורים פרטיים בכל התחומים</p>

              <ul className="mt-5 space-y-3">
                {TEACHER_PERKS.map((perk) => (
                  <CheckBullet key={perk}>{perk}</CheckBullet>
                ))}
              </ul>

              <a
                href="#for-tutors"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-dark-300 bg-white px-5 py-3 text-sm font-bold text-dark-800 transition-colors hover:bg-dark-50"
              >
                הצטרפו כמורה מייסד
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
