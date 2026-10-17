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
      <h1 className="font-ed text-[clamp(36px,5vw,48px)] font-black leading-[1.1] text-balance text-ink">
        מדריכים ומאמרים
      </h1>
      <p className="mt-3 max-w-[520px] text-base leading-relaxed text-ink-2">
        כל מה שכדאי לדעת לפני שבוחרים מורה פרטי, כתוב בגובה העיניים ובלי
        סיסמאות שיווקיות.
      </p>

      <div className="mt-10 space-y-4">
        {ARTICLES.map((article) => (
          <article key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="group block rounded-[var(--r-md)] border border-line bg-surface p-6 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-lift)] sm:p-7"
            >
              <p className="text-sm text-ink-3">
                {formatDateFull(article.datePublished)} · {article.readingMinutes} דקות
                קריאה
              </p>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-balance text-ink">
                {article.title}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-ink-2">
                {article.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:underline">
                לקריאה
                <ChevronLeft
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
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
