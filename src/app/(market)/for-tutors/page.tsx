import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  MessageCircle,
  UserCheck,
  Wallet,
} from "lucide-react";
import GuestOnly from "@/components/auth/GuestOnly";

export const metadata: Metadata = {
  title: "למורים | איך מצטרפים ל-SkillUp ומגיעים לתלמידים חדשים",
  description:
    "מלמדים? פתחו פרופיל מורה ב-SkillUp: תלמידים מוצאים אתכם באתר ובאפליקציה, קובעים שיעורים מהיומן שלכם ויוצרים איתכם קשר ישיר. בלי עמלות תיווך על הידע שלכם.",
  alternates: { canonical: "/for-tutors" },
};

const BENEFITS = [
  {
    icon: UserCheck,
    title: "פרופיל שעובד בשבילכם",
    text: "פרופיל מקצועי עם ביקורות, סרטון היכרות ומחירים שקופים, שמופיע בחיפוש מול תלמידים שמחפשים בדיוק את מה שאתם מלמדים.",
  },
  {
    icon: CalendarClock,
    title: "היומן שלכם, הכללים שלכם",
    text: "אתם מגדירים זמינות, מחירים ואזורי לימוד. תלמידים מזמינים רק מועדים שפתחתם, וכל בקשה מחכה לאישור שלכם.",
  },
  {
    icon: MessageCircle,
    title: "קשר ישיר עם תלמידים",
    text: "צ'אט מובנה לתיאום ולשאלות. בלי מתווכים שמסננים את ההודעות ובלי לחשוף את מספר הטלפון שלכם לכל האינטרנט.",
  },
  {
    icon: Wallet,
    title: "המחיר שקבעתם הוא המחיר שתקבלו",
    text: "אנחנו לא לוקחים עמלה על השיעורים שלכם. מה שהתלמיד משלם מגיע אליכם, עד השקל האחרון.",
  },
];

export default function ForTutorsPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <p className="eyebrow">למורים</p>
      <h1 className="mt-3 font-ed text-[clamp(36px,5vw,48px)] font-black leading-[1.1] text-balance text-ink">
        יש תלמידים שמחפשים בדיוק מורה כמוכם
      </h1>
      <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-ink-2">
        SkillUp מחברת ביניכם לבין תלמידים מכל הארץ, בלי לרדוף אחרי המלצות
        בקבוצות פייסבוק ובלי לשלם על פרסום. אתם מתרכזים בללמד, ואנחנו
        דואגים שימצאו אתכם.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--r-sm)] border border-line bg-surface text-ink">
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-base leading-relaxed text-ink-2">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How to join */}
      <div className="mt-14 rounded-[var(--r-md)] border border-line bg-surface p-7 sm:p-9">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink sm:text-[28px]">
          איך מצטרפים
        </h2>
        <ol className="mt-5 space-y-4">
          {[
            "נרשמים כמורים, כאן באתר או באפליקציית SkillUp. אותו חשבון עובד בשניהם.",
            "בונים פרופיל: תיאור, מחיר, עיר, מקצועות וזמינות (מקצועות ויומן דרך האפליקציה).",
            "עוברים אימות דרך אישור באימייל. תג האימות עוזר ללומדים לבחור בכם בביטחון.",
            "הפרופיל עולה לאוויר באפליקציה וכאן באתר, תלמידים חדשים יהיו חשופים אליכם ותלמידים קיימים יוכלו להזמין שיעור בקלות.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3.5 text-[15px] leading-relaxed text-ink">
              <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-canvas text-sm font-semibold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap gap-3">
          <GuestOnly
            fallback={
              <Link
                href="/account"
                className="inline-flex h-12 items-center rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
              >
                לפרופיל שלי
              </Link>
            }
          >
            <Link
              href="/signup?role=teacher"
              className="inline-flex h-12 items-center rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
            >
              הרשמה כמורה
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-6 text-[15px] font-semibold text-ink transition-colors duration-200 hover:border-ink"
            >
              כבר מורה ב-SkillUp? התחברות
            </Link>
          </GuestOnly>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          מורים מחוברים יכולים לצפות כאן באתר בהודעות מתלמידים ובשיעורים
          הקרובים. ניהול הפרופיל, הזמינות והמחירים נעשה באפליקציה.
        </p>
      </div>
    </div>
  );
}
