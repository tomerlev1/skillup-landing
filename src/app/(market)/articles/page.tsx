import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import PageHero from "@/components/page/PageHero";
import { ARTICLES } from "@/lib/articles";
import { formatDateFull } from "@/lib/format";

export const metadata: Metadata = {
  title: "מדריכים ומאמרים על שיעורים פרטיים | SkillUp",
  description:
    "מדריכים מעשיים להורים ולתלמידים: איך בוחרים מורה פרטי, כמה עולה שיעור פרטי בישראל, אונליין מול פרונטלי, הכנה לבגרויות ועוד.",
  alternates: { canonical: "/articles" },
};

const TONES = [
  "bg-tint-indigo text-tint-indigo-fg",
  "bg-tint-peach text-tint-peach-fg",
  "bg-tint-mint text-tint-mint-fg",
  "bg-tint-sky text-tint-sky-fg",
  "bg-tint-lilac text-tint-lilac-fg",
  "bg-tint-sun text-tint-sun-fg",
];

export default function ArticlesPage() {
  return (
    <>
      <PageHero
        icon={BookOpen}
        tone="bg-tint-lilac text-tint-lilac-fg"
        eyebrow="מדריכים"
        title="מדריכים ומאמרים"
        lead="כל מה שכדאי לדעת לפני שבוחרים מורה פרטי, כתוב בגובה העיניים ובלי סיסמאות שיווקיות."
      />

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article, i) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group flex h-full flex-col rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-[transform,box-shadow] duration-200 ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-7"
              >
                <span className={`grid size-12 place-items-center rounded-[var(--r-md)] ${TONES[i % TONES.length]}`}>
                  <BookOpen size={22} strokeWidth={2} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold leading-snug text-balance text-ink">
                  {article.title}
                </h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-2">{article.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-ink-3">
                    <Clock size={15} strokeWidth={2} aria-hidden="true" />
                    {article.readingMinutes} דק׳ · {formatDateFull(article.datePublished)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-action">
                    לקריאה
                    <ArrowLeft
                      size={16}
                      strokeWidth={2.25}
                      aria-hidden="true"
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
