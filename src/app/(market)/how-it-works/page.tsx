import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, MessageCircle, Search, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "איך זה עובד — מציאת מורה פרטי וקביעת שיעור | SkillUp",
  description:
    "כך מוצאים מורה פרטי ב-SkillUp בארבעה שלבים: חיפוש לפי מקצוע ועיר, השוואת פרופילים וביקורות, קביעת שיעור מהיומן של המורה, ולמידה עם קשר ישיר.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "מחפשים לפי מקצוע ועיר",
    text: "בוחרים מה רוצים ללמוד — ממתמטיקה ועד גיטרה — ואיפה: אונליין, אצל המורה או אצלכם בבית. מסננים לפי מחיר, דירוג וזמינות. החיפוש פתוח לכולם, בלי הרשמה ובלי התחייבות.",
  },
  {
    icon: Star,
    step: "02",
    title: "משווים פרופילים וביקורות",
    text: "כל פרופיל מציג את מה שבאמת חשוב: ביקורות אמיתיות של תלמידים שלמדו אצל המורה, ניסיון, השכלה, מחירים שקופים לכל אופן לימוד, וסרטון היכרות. מורים עם תג אימות עברו בדיקה של צוות SkillUp.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "קובעים שיעור מהיומן האמיתי",
    text: "בוחרים מועד פנוי מתוך היומן המתעדכן של המורה ושולחים בקשה. המורה מאשר — ואתם מקבלים עדכון במייל ובאזור האישי. שיעור ראשון עם מורה חדש מאושר בתוך 24 שעות.",
  },
  {
    icon: MessageCircle,
    step: "04",
    title: "בקשר ישיר, בלי מתווכים",
    text: "מרגע שנוצר קשר, הצ'אט עם המורה פתוח: מתאמים, שואלים, קובעים שיעורי המשך. אין נציגי מכירות באמצע ואין עמלות תיווך — רק אתם והמורה.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold leading-tight text-[var(--mk-ink)] sm:text-4xl">
        איך עובד SkillUp
      </h1>
      <p className="mt-4 max-w-[560px] text-base leading-relaxed text-[var(--mk-ink-2)]">
        מהחיפוש הראשון ועד השיעור הראשון — ככה זה נראה, שלב אחר שלב.
      </p>

      <div className="mt-12 space-y-10">
        {STEPS.map(({ icon: Icon, step, title, text }) => (
          <div key={step} className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--mk-band)] text-[var(--mk-ink)]">
                <Icon size={21} />
              </span>
              <span className="mt-2 font-display text-sm font-bold text-ink-300">{step}</span>
            </div>
            <div className="pt-1">
              <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">{title}</h2>
              <p className="mt-2 max-w-[560px] text-[15px] leading-[1.75] text-[var(--mk-ink-2)]">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mk-hairline-t mt-14 pt-10">
        <div className="flex items-start gap-3.5">
          <BadgeCheck size={22} className="mt-0.5 shrink-0 text-[var(--mk-ink)]" />
          <p className="max-w-[560px] text-[15px] leading-[1.75] text-[var(--mk-ink-2)]">
            <strong className="text-[var(--mk-ink)]">הפרטיות שלכם שמורה.</strong>{" "}
            פרטי קשר אישיים — טלפון, אימייל וכתובת מדויקת — לעולם לא מוצגים
            בפומבי. כתובת המורה נחשפת רק אחרי ששיעור אצלו אושר, והקשר הראשוני
            נעשה בצ&apos;אט מאובטח בתוך הפלטפורמה.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-[var(--mk-band)] p-8 text-center">
        <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">
          המורה הבא שלכם כבר כאן
        </h2>
        <Link
          href="/search"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          למציאת מורה
        </Link>
      </div>
    </div>
  );
}
