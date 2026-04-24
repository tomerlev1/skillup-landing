import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { CATEGORIES } from "@/lib/constants";

type CategoryId = (typeof CATEGORIES)[number]["id"];

const ICON_PATHS: Record<CategoryId, React.ReactNode> = {
  "math-science": (
    <>
      <path
        d="M7 7h10M9 7l2 10M15 7l-2 10"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="17" cy="17" r="1.5" />
    </>
  ),
  "foreign-languages": (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"
        strokeWidth="1.8"
      />
    </>
  ),
  "hebrew-literature": (
    <>
      <path
        d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M5 17a3 3 0 013-3h11" strokeWidth="1.8" />
      <path d="M9 8h6M9 11h4" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  "exam-prep": (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" strokeWidth="1.8" />
      <path d="M9 4h6v3H9z" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M9 12l2 2 4-4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 17h6" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  humanities: (
    <>
      <path
        d="M4 20h16M5 20V9M9 20V9M15 20V9M19 20V9"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M3 9h18L12 3 3 9z" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  "sports-fitness": (
    <>
      <path
        d="M4 9v6M20 9v6M2 11h2M20 11h2M2 13h2M20 13h2"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M9 7l-5 5 5 5M15 7l5 5-5 5M13 5l-2 14"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function CategoryIcon({
  id,
  className,
}: {
  id: CategoryId;
  className?: string;
}) {
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

// Bento plan: life-skills is the hero tile (new differentiator).
const LAYOUT: { id: CategoryId; span: "hero" | "wide" | "md" | "sm" }[] = [
  { id: "life-skills", span: "hero" },
  { id: "math-science", span: "wide" },
  { id: "exam-prep", span: "md" },
  { id: "foreign-languages", span: "md" },
  { id: "hebrew-literature", span: "sm" },
  { id: "humanities", span: "sm" },
  { id: "arts-creativity", span: "sm" },
  { id: "tech-programming", span: "sm" },
  { id: "sports-fitness", span: "wide" },
];

const SPAN_CLASS = {
  hero: "tile--hero",
  wide: "tile--wide",
  md: "tile--md",
  sm: "tile--sm",
} as const;

export default function SubjectsSection() {
  return (
    <section
      id="subjects"
      className="w-full px-6 py-20 md:py-28 md:px-16"
      style={{ background: "var(--color-paper-25)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <ScrollReveal>
              <Eyebrow n="04 / SUBJECTS">9 תחומים</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="display display-lg mt-6 max-w-[16ch]">
                9 תחומים, מורים פרטיים
                <br />
                <em className="not-italic grad-text">בכל אחד.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="max-w-[38ch] text-[15px] leading-[1.7] text-[var(--fg-muted)]">
              מבגרות ופסיכומטרי ועד מוזיקה, בישול ונהיגה. הלמידה היום היא הרבה
              יותר מבית הספר.
            </p>
          </ScrollReveal>
        </div>

        <div className="bento">
          {LAYOUT.map((l, i) => {
            const cat = CATEGORIES.find((c) => c.id === l.id)!;
            const isHero = l.span === "hero";
            const isNew = "isNew" in cat && cat.isNew === true;
            return (
              <ScrollReveal
                key={cat.id}
                delay={i * 0.05}
                className={`tile ${SPAN_CLASS[l.span]}`}
              >
                {isNew && (
                  <span
                    className="absolute top-5 font-bold"
                    style={{
                      insetInlineStart: 20,
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      background: "var(--color-accent-500)",
                      color: "#fff",
                    }}
                  >
                    חדש
                  </span>
                )}
                <div>
                  <div
                    className="mb-[18px] grid place-items-center"
                    style={{
                      width: isHero ? 64 : 44,
                      height: isHero ? 64 : 44,
                      borderRadius: isHero ? 18 : 12,
                      background: isHero
                        ? "rgba(255,255,255,0.1)"
                        : "var(--accent-soft)",
                      color: isHero ? "#fff" : "var(--accent)",
                      border: isHero
                        ? "1px solid rgba(255,255,255,0.12)"
                        : "none",
                    }}
                  >
                    <CategoryIcon
                      id={cat.id}
                      className={isHero ? "h-8 w-8" : "h-[22px] w-[22px]"}
                    />
                  </div>
                  <h3
                    className="display m-0"
                    style={{
                      fontSize: isHero ? 40 : 19,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                      color: isHero ? "#fff" : "var(--color-ink-900)",
                      maxWidth: isHero ? "14ch" : undefined,
                    }}
                  >
                    {cat.title}
                  </h3>
                  {isHero && (
                    <p
                      className="mt-3"
                      style={{
                        color: "rgba(255,255,255,0.72)",
                        fontSize: 15,
                        lineHeight: 1.6,
                        maxWidth: "40ch",
                      }}
                    >
                      הלמידה שמעבר לבית ספר. בישול, נהיגה, אתיקט ויצירתיות —
                      הכל באותה אפליקציה.
                    </p>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.subjects.map((s) => (
                    <span
                      key={s}
                      className="rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{
                        background: isHero
                          ? "rgba(255,255,255,0.08)"
                          : "var(--color-ink-100)",
                        color: isHero
                          ? "rgba(255,255,255,0.9)"
                          : "var(--color-ink-700)",
                        border: isHero
                          ? "1px solid rgba(255,255,255,0.12)"
                          : "none",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.6}>
          <p className="mt-10 text-center text-sm text-[var(--fg-muted)]">
            לא מצאתם את המקצוע שלכם?{" "}
            <a
              href="#download"
              className="font-bold text-[var(--accent)] underline decoration-2 underline-offset-4"
            >
              פתחו את האפליקציה ותמצאו עוד ←
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
