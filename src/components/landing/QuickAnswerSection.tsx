import ScrollReveal from "@/components/animations/ScrollReveal";

export default function QuickAnswerSection() {
  return (
    <section
      id="quick-answer"
      className="section-bloom w-full px-6 py-14 md:py-20 md:px-16"
      style={{ ["--bloom-x" as string]: "15%", ["--bloom-y" as string]: "80%" }}
    >
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <p
            className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            dir="ltr"
          >
            01 - הסיפור הקצר
          </p>
          <div className="rounded-2xl border border-dark-200 bg-white p-7 shadow-sm md:p-10">
            <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight text-dark-900 md:text-3xl">
              מה זה SkillUp?
            </h2>
            <p className="text-base leading-relaxed text-dark-700 md:text-lg">
              SkillUp היא אפליקציית מובייל ישראלית (iOS) שמחברת תלמידים, הורים
              ומבוגרים עם מורים פרטיים מאומתים ב-9 תחומים: מתמטיקה ומדעים,
              שפות זרות, עברית וספרות, בגרויות ופסיכומטרי, מדעי הרוח, ספורט,
              אומנות, תכנות, ופנאי ומיומנויות חיים (בישול, נהיגה, אתיקט). 3
              דרכי לימוד: אונליין, אצל המורה, או אצלכם בבית. ללא עמלת תיווך.
              התשלום ביניכם לבין המורה. ביטול חינם עד 24 שעות לפני השיעור.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
