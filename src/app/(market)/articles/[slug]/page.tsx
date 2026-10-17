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

      <nav aria-label="פירורי לחם" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
        <Link href="/" className="hit-44 hover:text-ink hover:underline">ראשי</Link>
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        <Link href="/articles" className="hit-44 hover:text-ink hover:underline">
          מאמרים
        </Link>
      </nav>

      <article>
        <header>
          <p className="text-sm text-ink-3">
            {formatDateFull(article.datePublished)} · {article.readingMinutes} דקות קריאה
          </p>
          <h1 className="mt-3 font-ed text-[clamp(28px,4.5vw,40px)] font-black leading-[1.15] text-balance text-ink">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            {article.description}
          </p>
        </header>

        <div className="border-t border-line mt-8 space-y-8 pt-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-3 font-ed text-[22px] font-bold leading-tight text-balance text-ink">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="mb-4 text-[16px] leading-[1.8] text-ink last:mb-0"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>

      {/* Conversion band */}
      <div className="mt-12 rounded-[var(--r-md)] border border-line bg-surface p-7 text-center">
        <h2 className="font-ed text-[22px] font-bold leading-tight text-balance text-ink">
          מוכנים למצוא את המורה שלכם?
        </h2>
        <p className="mx-auto mt-2 max-w-[420px] text-base leading-relaxed text-ink-2">
          משווים מורים, קוראים ביקורות של לומדים ושולחים בקשה
          ביומן של המורה.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-action px-7 text-[15px] font-semibold text-on-action transition-colors duration-200 hover:bg-action-hover"
        >
          למציאת מורה
        </Link>
      </div>

      {/* More articles */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-ink">עוד מאמרים</h2>
        <ul className="mt-2">
          {ARTICLES.filter((a) => a.slug !== slug).map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="inline-flex min-h-11 items-center text-base text-ink-2 hover:text-ink hover:underline"
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
