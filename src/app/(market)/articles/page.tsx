import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ARTICLES } from "@/lib/articles";
import { formatDateFull } from "@/lib/format";

export const metadata: Metadata = {
  title: "מדריכים ומאמרים על שיעורים פרטיים | SkillUp",
  description:
    "מדריכים מעשיים להורים ולתלמידים: איך בוחרים מורה פרטי, כמה עולה שיעור פרטי בישראל, אונליין מול פרונטלי, הכנה לבגרויות ועוד.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-[840px] px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-[var(--mk-ink)]">
        מדריכים ומאמרים
      </h1>
      <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[var(--mk-ink-2)]">
        כל מה שכדאי לדעת לפני שבוחרים מורה פרטי, כתוב בגובה העיניים ובלי
        סיסמאות שיווקיות.
      </p>

      <div className="mt-10 space-y-4">
        {ARTICLES.map((article) => (
          <article key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="group block rounded-3xl border border-[var(--mk-hairline)] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--mk-shadow)] sm:p-7"
            >
              <p className="text-xs text-[var(--mk-ink-3)]">
                {formatDateFull(article.datePublished)} · {article.readingMinutes} דקות
                קריאה
              </p>
              <h2 className="mt-2 font-display text-xl font-bold leading-snug text-[var(--mk-ink)]">
                {article.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mk-ink-2)]">
                {article.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                לקריאה
                <ChevronLeft
                  size={15}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
