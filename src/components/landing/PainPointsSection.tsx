import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { PAIN_POINTS } from "@/lib/constants";

const NUMS = ["01", "02", "03"];

export default function PainPointsSection() {
  return (
    <div className="w-full px-6 py-20 md:py-28 md:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[1fr_1.6fr]">
        {/* Left column — heading */}
        <div>
          <ScrollReveal>
            <Eyebrow n="02 / PAIN POINTS">למה SkillUp</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="display display-lg mt-6">
              למה
              <br />
              <em className="not-italic grad-text">SkillUp</em>?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 max-w-[34ch] text-base leading-[1.7] text-[var(--fg-muted)]">
              מצאנו פתרון לכל בעיה שהכרתם. עם SkillUp, הכל פשוט.
            </p>
          </ScrollReveal>
        </div>

        {/* Right column — editorial numbered list */}
        <div className="flex flex-col">
          {PAIN_POINTS.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === PAIN_POINTS.length - 1;
            return (
              <ScrollReveal key={i} delay={0.15 + i * 0.1}>
                <div
                  className="grid grid-cols-[60px_1fr] items-start gap-6 py-8"
                  style={{
                    borderTop: isFirst
                      ? "1.5px solid var(--color-ink-900)"
                      : "1px solid var(--rule)",
                    borderBottom: isLast
                      ? "1.5px solid var(--color-ink-900)"
                      : "none",
                  }}
                >
                  <div
                    className="font-mono-lc text-sm font-semibold text-[var(--accent)]"
                    dir="ltr"
                  >
                    {NUMS[i]}
                  </div>
                  <div>
                    <h3 className="display text-[28px] font-extrabold leading-[1.2] tracking-[-0.02em]">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.65] text-[var(--fg-muted)]">
                      {p.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
