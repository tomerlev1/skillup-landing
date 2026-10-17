import type { Metadata } from "next";
import { ChevronDown, CircleHelp, Mail } from "lucide-react";
import CtaBand from "@/components/page/CtaBand";
import PageHero from "@/components/page/PageHero";
import { FAQ_ITEMS } from "@/lib/structured-data";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "שאלות נפוצות | SkillUp",
  description:
    "כל התשובות על SkillUp: איך מוצאים מורה פרטי, איך קובעים שיעור, אימות מורים, מחירים, שיעורים אונליין, ביטולים והצטרפות מורים.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <PageHero
        icon={CircleHelp}
        tone="bg-tint-sky text-tint-sky-fg"
        eyebrow="עזרה"
        title="שאלות נפוצות"
        lead="התשובות לשאלות שהכי שואלים אותנו, בקצרה ובבהירות."
      />

      <section className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="faq">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q}>
              <summary>
                <span className="idx tnum">{i + 1}</span>
                {item.q}
                <ChevronDown className="chev" size={18} strokeWidth={2} aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <aside className="h-fit rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60 lg:sticky lg:top-24">
          <span className="grid size-12 place-items-center rounded-[var(--r-md)] bg-tint-peach text-tint-peach-fg">
            <Mail size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-ink">לא מצאתם תשובה?</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
            כתבו לנו דרך הצ׳אט כאן באתר או במייל, ונחזור אליכם.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            dir="ltr"
            className="mt-4 inline-flex min-h-11 items-center font-bold text-action underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </aside>
      </section>

      <CtaBand
        title="מוכנים להתחיל?"
        primary={{ href: "/search", label: "למציאת מורה" }}
        secondary={{ href: "/how-it-works", label: "איך זה עובד" }}
      />
    </>
  );
}
