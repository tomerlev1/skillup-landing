import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
      <h1 className="font-ed text-[clamp(36px,5vw,48px)] font-black leading-[1.1] text-balance text-ink">
        שאלות נפוצות
      </h1>
      <p className="mt-3 text-base text-ink-2">
        לא מצאתם תשובה? כתבו לנו דרך הצ&apos;אט כאן באתר או במייל{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          dir="ltr"
          className="ltr-isolate font-medium text-action underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <div className="faq mt-8">
        {FAQ_ITEMS.map((item, i) => (
          <details key={item.q}>
            <summary>
              <span className="idx tnum">{String(i + 1).padStart(2, "0")}</span>
              {item.q}
              <ChevronDown className="chev" size={16} strokeWidth={1.75} aria-hidden="true" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-[var(--r-md)] border border-line bg-surface p-7 text-center">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink">
          מוכנים להתחיל?
        </h2>
        <Link
          href="/search"
          className="mt-4 inline-flex h-12 items-center rounded-full bg-action px-7 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
        >
          למציאת מורה
        </Link>
      </div>
    </div>
  );
}
