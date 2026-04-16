import ScrollReveal from "@/components/animations/ScrollReveal";
import { CATEGORIES } from "@/lib/constants";

type CategoryId = (typeof CATEGORIES)[number]["id"];

const ICON_PATHS: Record<CategoryId, React.ReactNode> = {
  "math-science": (
    <>
      <path d="M7 7h10M9 7l2 10M15 7l-2 10" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="17" r="1.5" />
    </>
  ),
  "foreign-languages": (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" strokeWidth="1.8" />
    </>
  ),
  "hebrew-literature": (
    <>
      <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5 17a3 3 0 013-3h11" strokeWidth="1.8" />
      <path d="M9 8h6M9 11h4" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  "exam-prep": (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" strokeWidth="1.8" />
      <path d="M9 4h6v3H9z" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17h6" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  humanities: (
    <>
      <path d="M4 20h16M5 20V9M9 20V9M15 20V9M19 20V9" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 9h18L12 3 3 9z" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  "sports-fitness": (
    <>
      <path d="M4 9v6M20 9v6M2 11h2M20 11h2M2 13h2M20 13h2" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="9" width="3" height="6" rx="0.5" strokeWidth="1.8" />
      <rect x="17" y="9" width="3" height="6" rx="0.5" strokeWidth="1.8" />
      <path d="M7 12h10" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  "arts-creativity": (
    <>
      <path
        d="M12 3a9 9 0 100 18 2 2 0 002-2v-1a2 2 0 012-2h2a3 3 0 003-3 9 9 0 00-9-10z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  "tech-programming": (
    <>
      <path d="M9 7l-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "life-skills": (
    <>
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9v3l2 1" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[id]}
    </svg>
  );
}

export default function SubjectsSection() {
  return (
    <section
      id="subjects"
      className="section-bloom w-full px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "85%", ["--bloom-y" as string]: "30%" }}
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            dir="ltr"
          >
            04 - 9 תחומים
          </p>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
            9 תחומים, מורים פרטיים בכל אחד
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-3 mb-12 max-w-xl text-center text-dark-500">
            מבגרות ופסיכומטרי ועד מוזיקה, בישול ונהיגה. הלמידה היום היא הרבה
            יותר מבית הספר.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const isNew = "isNew" in cat && cat.isNew === true;

            return (
              <ScrollReveal key={cat.id} delay={0.05 * (i % 3)}>
                <div
                  className={`group relative h-full rounded-2xl border bg-white p-6 text-start shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md ${
                    isNew
                      ? "border-accent-200 ring-2 ring-accent-100"
                      : "border-dark-200"
                  }`}
                >
                  {isNew && (
                    <span className="absolute top-3 left-3 rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      חדש
                    </span>
                  )}

                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100 transition-colors duration-300 group-hover:bg-brand-100 group-hover:ring-brand-200">
                      <CategoryIcon
                        id={cat.id}
                        className="h-6 w-6 text-brand-600 transition-colors duration-300 group-hover:text-brand-700"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-dark-900">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-dark-100 px-2.5 py-1 text-xs font-medium text-dark-700"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.3}>
          <p className="mt-10 text-center text-sm text-dark-500">
            לא מצאתם את המקצוע שלכם?{" "}
            <a
              href="#download"
              className="font-semibold text-brand-600 underline decoration-brand-200 decoration-2 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-400"
            >
              פתחו את האפליקציה ותמצאו עוד ←
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
