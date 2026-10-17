import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, GraduationCap, MessageCircle, UserCheck, Wallet } from "lucide-react";
import GuestOnly from "@/components/auth/GuestOnly";
import PageHero from "@/components/page/PageHero";

export const metadata: Metadata = {
  title: "למורים | איך מצטרפים ל-SkillUp ומגיעים לתלמידים חדשים",
  description:
    "מלמדים? פתחו פרופיל מורה ב-SkillUp: תלמידים מוצאים אתכם באתר ובאפליקציה, קובעים שיעורים מהיומן שלכם ויוצרים איתכם קשר ישיר. בלי עמלות תיווך על הידע שלכם.",
  alternates: { canonical: "/for-tutors" },
};

const BENEFITS = [
  {
    icon: UserCheck,
    tone: "bg-tint-indigo text-tint-indigo-fg",
    title: "פרופיל שעובד בשבילכם",
    text: "פרופיל מקצועי עם ביקורות, סרטון היכרות ומחירים שקופים, שמופיע בחיפוש מול תלמידים שמחפשים בדיוק את מה שאתם מלמדים.",
  },
  {
    icon: CalendarClock,
    tone: "bg-tint-peach text-tint-peach-fg",
    title: "היומן שלכם, הכללים שלכם",
    text: "אתם מגדירים זמינות, מחירים ואזורי לימוד. תלמידים מזמינים רק מועדים שפתחתם, וכל בקשה מחכה לאישור שלכם.",
  },
  {
    icon: MessageCircle,
    tone: "bg-tint-sky text-tint-sky-fg",
    title: "קשר ישיר עם תלמידים",
    text: "צ׳אט מובנה לתיאום ולשאלות. בלי מתווכים שמסננים את ההודעות ובלי לחשוף את מספר הטלפון שלכם לכל האינטרנט.",
  },
  {
    icon: Wallet,
    tone: "bg-tint-mint text-tint-mint-fg",
    title: "המחיר שקבעתם הוא המחיר שתקבלו",
    text: "אנחנו לא לוקחים עמלה על השיעורים שלכם. מה שהתלמיד משלם מגיע אליכם, עד השקל האחרון.",
  },
];

const STEPS = [
  "נרשמים כמורים, כאן באתר או באפליקציית SkillUp. אותו חשבון עובד בשניהם.",
  "בונים פרופיל: תיאור, מחיר, עיר, מקצועות וזמינות (מקצועות ויומן דרך האפליקציה).",
  "עוברים אימות דרך אישור באימייל. תג האימות עוזר ללומדים לבחור בכם בביטחון.",
  "הפרופיל עולה לאוויר באפליקציה וכאן באתר, ותלמידים יכולים לקבוע אצלכם שיעור.",
];

const primaryBtn =
  "inline-flex h-12 items-center rounded-[var(--r-pill)] bg-action px-7 text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-colors duration-200 hover:bg-action-hover";
const secondaryBtn =
  "inline-flex h-12 items-center rounded-[var(--r-pill)] bg-surface px-6 text-[15px] font-bold text-ink ring-1 ring-line transition-colors duration-200 hover:ring-brand-200";

export default function ForTutorsPage() {
  return (
    <>
      <PageHero
        icon={GraduationCap}
        tone="bg-tint-peach text-tint-peach-fg"
        eyebrow="למורים"
        title="יש תלמידים שמחפשים בדיוק מורה כמוכם"
        lead="SkillUp מחברת ביניכם לבין תלמידים מכל הארץ, בלי לרדוף אחרי המלצות ובלי לשלם על פרסום. אתם מלמדים, ואנחנו דואגים שימצאו אתכם."
      >
        <div className="flex flex-wrap gap-3">
          <GuestOnly
            fallback={
              <Link href="/account" className={primaryBtn}>
                לפרופיל שלי
              </Link>
            }
          >
            <Link href="/signup?role=teacher" className={primaryBtn}>
              הרשמה כמורה
            </Link>
            <Link href="/login" className={secondaryBtn}>
              כבר מורים ב-SkillUp? התחברות
            </Link>
          </GuestOnly>
        </div>
      </PageHero>

      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-action">למה SkillUp</p>
        <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-ink sm:text-[36px]">
          כל מה שצריך כדי ללמד, במקום אחד
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, tone, title, text }) => (
            <li
              key={title}
              className="rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60"
            >
              <span className={`grid size-12 place-items-center rounded-[var(--r-md)] ${tone}`}>
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-action">ארבעה צעדים</p>
            <h2 className="font-ed mt-1 text-[28px] font-extrabold leading-tight text-ink sm:text-[36px]">
              איך מצטרפים
            </h2>
            <p className="mt-3 max-w-[380px] text-base leading-relaxed text-ink-2">
              מורים מחוברים רואים כאן באתר הודעות ושיעורים קרובים. ניהול הפרופיל, הזמינות
              והמחירים נעשה באפליקציה.
            </p>
          </div>
          <ol className="grid gap-3">
            {STEPS.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-line/60"
              >
                <span className="tnum grid size-10 shrink-0 place-items-center rounded-full bg-action text-base font-black text-on-action">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-base leading-relaxed text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
