import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-[var(--mk-ink)]">
        שאלות נפוצות
      </h1>
      <p className="mt-3 text-base text-[var(--mk-ink-2)]">
        לא מצאתם תשובה? כתבו לנו דרך הצ&apos;אט כאן באתר או במייל{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          dir="ltr"
          className="ltr-isolate font-medium text-brand-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <div className="faq mt-8">
        {FAQ_ITEMS.map((item, i) => (
          <details key={item.q}>
            <summary>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              {item.q}
              <svg className="chev" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-[var(--mk-band)] p-7 text-center">
        <h2 className="font-display text-lg font-bold text-[var(--mk-ink)]">
          מוכנים להתחיל?
        </h2>
        <Link
          href="/search"
          className="mt-4 inline-flex h-12 items-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          למציאת מורה
        </Link>
      </div>
    </div>
  );
}
