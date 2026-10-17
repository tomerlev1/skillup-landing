import type { LegalSection } from "@/lib/legal-content";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

// Title + content in a 760px reading column. Nav and footer come from the
// (market) layout. Section HTML comes from lib/legal-content (trusted, static).
export default function LegalPageLayout({
  title,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-surface">
      <article className="mx-auto max-w-[760px] px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <header className="mb-10">
          <h1 className="font-ed text-[32px] font-black leading-tight text-ink sm:text-[40px]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-3">עודכן לאחרונה: {lastUpdated}</p>
        </header>

        {sections.length > 3 && (
          <nav
            aria-label="תוכן העניינים"
            className="mb-12 rounded-[var(--r-md)] border border-line bg-canvas p-5"
          >
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block py-1.5 text-sm text-ink-2 hover:text-action hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold text-ink">{section.title}</h2>
            <div
              className="space-y-3 text-base leading-[1.75] text-ink-2 [&_a]:text-action [&_a]:underline [&_a]:underline-offset-2 [&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-ink [&_li]:mb-2 [&_li]:leading-[1.75] [&_li_strong]:text-ink [&_ul]:list-disc [&_ul]:ps-6"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </section>
        ))}
      </article>
    </div>
  );
}
