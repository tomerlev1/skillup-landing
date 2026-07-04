import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  MessageCircle,
  Sparkles,
  UserCheck,
  Wallet,
} from "lucide-react";
import { APP_STORE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "למורים — הצטרפות ל-SkillUp והגעה לתלמידים חדשים | SkillUp",
  description:
    "מלמדים? פתחו פרופיל מורה ב-SkillUp: תלמידים מוצאים אתכם באתר ובאפליקציה, קובעים שיעורים מהיומן שלכם ויוצרים קשר ישיר — בלי עמלות תיווך על הידע שלכם.",
  alternates: { canonical: "/for-tutors" },
};

const BENEFITS = [
  {
    icon: UserCheck,
    title: "פרופיל שעובד בשבילכם",
    text: "פרופיל מקצועי עם ביקורות, סרטון היכרות ומחירים שקופים — מופיע בחיפוש באתר ובאפליקציה מול תלמידים שמחפשים בדיוק את מה שאתם מלמדים.",
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
    title: "הידע שלכם שווה כסף — לכם",
    text: "אין עמלות תיווך על שיעורים. המחיר שקבעתם הוא המחיר שאתם מקבלים.",
  },
];

export default function ForTutorsPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <p className="eyebrow">למורים</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[var(--mk-ink)] sm:text-4xl">
        התלמידים הבאים שלכם כבר מחפשים אתכם
      </h1>
      <p className="mt-4 max-w-[560px] text-base leading-relaxed text-[var(--mk-ink-2)]">
        SkillUp מחברת אתכם לתלמידים בכל הארץ — בלי לרדוף אחרי לידים בקבוצות
        פייסבוק ובלי לשלם על פרסום. אתם מלמדים; אנחנו דואגים שימצאו אתכם.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--mk-band)] text-[var(--mk-ink)]">
              <Icon size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--mk-ink)]">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--mk-ink-2)]">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How to join */}
      <div className="mt-14 rounded-3xl border border-[var(--mk-hairline)] bg-white p-7 sm:p-9">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--mk-ink)]">
          <Sparkles size={20} />
          איך מצטרפים
        </h2>
        <ol className="mt-5 space-y-4">
          {[
            "מורידים את אפליקציית SkillUp ל-iPhone ופותחים חשבון מורה.",
            "בונים פרופיל: מקצועות, ניסיון, מחירים, אזורי לימוד וזמינות ביומן.",
            "עוברים אימות קצר של צוות SkillUp — תג האימות מגדיל משמעותית את הפניות.",
            "הפרופיל עולה לאוויר — באפליקציה וכאן באתר — ותלמידים מתחילים להגיע.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3.5 text-[15px] leading-relaxed text-[var(--mk-ink)]">
              <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--mk-band)] text-[13px] font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={APP_STORE_URL}
            className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            הורדת האפליקציה והצטרפות
          </a>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-full border border-[var(--mk-ink)] px-6 text-sm font-semibold text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
          >
            כבר מורה ב-SkillUp? התחברות
          </Link>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--mk-ink-3)]">
          מורים מחוברים יכולים לצפות כאן באתר בהודעות מתלמידים ובשיעורים
          הקרובים. ניהול הפרופיל, הזמינות והמחירים נעשה באפליקציה.
        </p>
      </div>
    </div>
  );
}
