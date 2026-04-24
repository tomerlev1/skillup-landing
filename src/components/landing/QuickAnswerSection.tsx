import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { QUICK_ANSWER } from "@/lib/constants";

export default function QuickAnswerSection() {
  return (
    <section
      id="quick-answer"
      className="w-full px-6 py-20 md:py-28 md:px-16"
    >
      <div className="mx-auto max-w-[880px]">
        <ScrollReveal>
          <Eyebrow n="01 / QUICK ANSWER">הסיפור הקצר</Eyebrow>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="display display-md mt-6 max-w-[14ch]">
            מה זה <em className="not-italic grad-text">SkillUp</em>?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-6 max-w-[64ch] text-[19px] leading-[1.7] text-[var(--color-ink-700)]">
            {QUICK_ANSWER}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
