import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "איך זה עובד | מציאת מורה פרטי וקביעת שיעור ב-SkillUp",
  description:
    "כך מוצאים מורה פרטי ב-SkillUp בשלושה שלבים: מחפשים לפי מקצוע ועיר ומשווים פרופילים, שולחים בקשה ביומן של המורה, ולומדים אונליין או פנים אל פנים. SkillUp לא גובה מכם כלום.",
  alternates: { canonical: "/how-it-works" },
};

// Same three steps as the home page (spec §8.3.4, §8.9) plus the verbatim
// transparency line and the privacy note.
export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <h1 className="font-ed text-[clamp(36px,5vw,48px)] font-black leading-[1.1] text-balance text-ink">
        איך זה עובד
      </h1>
      <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-ink-2">
        מהחיפוש הראשון ועד השיעור הראשון, שלב אחר שלב.
      </p>

      <ol className="mt-12 space-y-8">
        {HOW_IT_WORKS_STEPS.map((s, i) => (
          <li key={s.title} className="flex items-start gap-5">
            <span
              aria-hidden="true"
              className="font-ed tnum grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-[22px] font-bold leading-none text-ink"
            >
              {i + 1}
            </span>
            <div className="pt-1.5">
              <h2 className="text-[22px] font-semibold leading-tight text-ink">{s.title}</h2>
              <p className="mt-2 max-w-[560px] text-base leading-relaxed text-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 rounded-[var(--r-md)] border border-line bg-surface p-5 text-base font-medium leading-relaxed text-ink">
        התשלום והביטול נקבעים ישירות מול המורה. SkillUp לא גובה מכם כלום.
      </p>

      <div className="mt-10 border-t border-line pt-10">
        <div className="flex items-start gap-3.5">
          <ShieldCheck size={24} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-ink" />
          <p className="max-w-[560px] text-base leading-relaxed text-ink-2">
            <strong className="font-semibold text-ink">הפרטיות שלכם שמורה.</strong>{" "}
            פרטי קשר אישיים כמו טלפון, אימייל וכתובת מדויקת לא מוצגים בפומבי.
            כתובת המורה נחשפת רק אחרי שהשיעור אצלו אושר, והקשר הראשוני נעשה
            בצ&apos;אט מאובטח בתוך הפלטפורמה.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-[var(--r-md)] border border-line bg-surface p-8 text-center">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          המורה הבא שלכם כבר כאן
        </h2>
        <Link
          href="/search"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-action px-7 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
        >
          למציאת מורה
        </Link>
      </div>
    </div>
  );
}
