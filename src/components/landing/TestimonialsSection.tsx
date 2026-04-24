import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { FOUNDER_LETTER } from "@/lib/constants";

// Honest pre-launch stance: a founders' letter instead of fabricated testimonials.
export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full px-6 py-20 md:py-28 md:px-16"
      style={{ background: "var(--color-paper-50)" }}
    >
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <Eyebrow n="07 / FOUNDERS">קהילת הפתיחה</Eyebrow>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="display display-lg mt-6">
            אנחנו רק מתחילים,
            <br />
            <em className="not-italic grad-text">והאמת חשובה לנו.</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="mt-6 max-w-[52ch] text-base leading-[1.7] text-[var(--fg-muted)]">
            אין לנו עדיין אלפי ביקורות. יש לנו חזון, אפליקציה מוכנה, וקהילה
            שאתם מוזמנים לקחת חלק בדרך המרגשת כבר מהיום הראשון.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="relative mt-14 pr-12 md:pr-14">
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 h-full w-[3px]"
              style={{
                insetInlineStart: 0,
                background:
                  "linear-gradient(to bottom, var(--color-accent-500), var(--color-brand-500))",
              }}
            />
            <span
              className="eyebrow"
              style={{ color: "var(--accent)" }}
            >
              מכתב מהמייסדים
            </span>
            <p
              className="mt-4 max-w-[44ch] font-display font-medium leading-[1.4] tracking-[-0.015em]"
              style={{
                fontSize: "clamp(22px, 2.4vw, 32px)",
                color: "var(--color-ink-900)",
              }}
            >
              {FOUNDER_LETTER}
            </p>
            <p
              className="font-mono-lc mt-6 text-sm font-semibold"
              style={{ color: "var(--color-ink-600)" }}
            >
              — צוות SkillUp
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
