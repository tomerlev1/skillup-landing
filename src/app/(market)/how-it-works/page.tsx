import type { Metadata } from "next";
import { Compass, LockKeyhole, ShieldCheck } from "lucide-react";
import HowItWorks from "@/components/home/HowItWorks";
import WhatWeCheck from "@/components/home/WhatWeCheck";
import CtaBand from "@/components/page/CtaBand";
import PageHero from "@/components/page/PageHero";

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
    <>
      <PageHero
        icon={Compass}
        eyebrow="איך זה עובד"
        title="מהחיפוש הראשון ועד השיעור הראשון"
        lead="שלושה צעדים פשוטים, בלי מתווכים ובלי הפתעות."
      />

      <HowItWorks heading={false} className="" />

      <section className="mx-auto grid max-w-[1280px] gap-4 px-4 pt-16 sm:px-6 md:grid-cols-2">
        <div className="flex items-start gap-4 rounded-[var(--r-lg)] bg-tint-mint p-6 sm:p-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-[var(--r-md)] bg-surface text-tint-mint-fg shadow-[var(--shadow-card)]">
            <ShieldCheck size={24} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-ink">שקיפות מלאה בכסף</h2>
            <p className="mt-1.5 text-base leading-relaxed text-ink-2">
              התשלום והביטול נקבעים ישירות מול המורה. SkillUp לא גובה מכם כלום.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-[var(--r-lg)] bg-tint-sky p-6 sm:p-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-[var(--r-md)] bg-surface text-tint-sky-fg shadow-[var(--shadow-card)]">
            <LockKeyhole size={24} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-ink">הפרטיות שלכם שמורה</h2>
            <p className="mt-1.5 text-base leading-relaxed text-ink-2">
              טלפון, אימייל וכתובת מדויקת לא מוצגים בפומבי. כתובת המורה נחשפת רק
              אחרי שהשיעור אצלו אושר, והקשר הראשוני נעשה בצ׳אט מאובטח בתוך האתר.
            </p>
          </div>
        </div>
      </section>

      <WhatWeCheck />

      <CtaBand
        title="המורה הבא שלכם כבר כאן"
        text="מחפשים לפי מקצוע ועיר, ומשווים פרופילים, ביקורות ומחירים."
        primary={{ href: "/search", label: "למציאת מורה" }}
        secondary={{ href: "/faq", label: "שאלות נפוצות" }}
      />
    </>
  );
}
