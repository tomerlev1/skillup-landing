import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ARTICLES, getArticle } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";
import { formatDateFull } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "לא נמצא | SkillUp" };
  return {
    title: `${article.title} | SkillUp`,
    description: article.description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.datePublished,
    },
  };
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    inLanguage: "he",
    author: { "@type": "Organization", name: "SkillUp", url: SITE_URL },
    publisher: { "@type": "Organization", name: "SkillUp", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/articles/${slug}`,
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />

      <nav aria-label="פירורי לחם" className="mb-6 flex items-center gap-1.5 text-[13px] text-[var(--mk-ink-3)]">
        <Link href="/" className="hover:text-[var(--mk-ink)] hover:underline">ראשי</Link>
        <ChevronLeft size={13} aria-hidden="true" />
        <Link href="/articles" className="hover:text-[var(--mk-ink)] hover:underline">
          מאמרים
        </Link>
      </nav>

      <article>
        <header>
          <p className="text-sm text-[var(--mk-ink-3)]">
            {formatDateFull(article.datePublished)} · {article.readingMinutes} דקות קריאה
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.2] text-[var(--mk-ink)] sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--mk-ink-2)]">
            {article.description}
          </p>
        </header>

        <div className="mk-hairline-t mt-8 space-y-8 pt-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-3 font-display text-xl font-bold text-[var(--mk-ink)]">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="mb-4 text-[16px] leading-[1.8] text-[var(--mk-ink)] last:mb-0"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>

      {/* Conversion band */}
      <div className="mt-12 rounded-3xl bg-[var(--mk-band)] p-7 text-center">
        <h2 className="font-display text-lg font-bold text-[var(--mk-ink)]">
          מוכנים למצוא את המורה שלכם?
        </h2>
        <p className="mx-auto mt-2 max-w-[380px] text-sm leading-relaxed text-[var(--mk-ink-2)]">
          מורים מנוסים עם ביקורות אמיתיות מחכים כאן. משווים, בוחרים וקובעים
          שיעור בכמה דקות.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-brand-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          למציאת מורה
        </Link>
      </div>

      {/* More articles */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--mk-ink)]">עוד מאמרים</h2>
        <ul className="mt-3 space-y-2">
          {ARTICLES.filter((a) => a.slug !== slug).map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
