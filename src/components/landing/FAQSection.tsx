import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { FAQ_ITEMS } from "@/lib/structured-data";
import { ChevronDownIcon } from "@/components/icons/CustomIcons";

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="w-full px-6 py-20 md:py-28 md:px-16"
      style={{ background: "var(--bg-alt)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-[1fr_2fr]">
          {/* Left — heading */}
          <div>
            <ScrollReveal>
              <Eyebrow n="08 / FAQ">שאלות</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="display display-lg mt-6">
                שאלות
                <br />
                <em className="not-italic grad-text">נפוצות.</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mono-sm mt-5 text-[var(--fg-muted)]">
                עודכן לאחרונה: אפריל 2026
              </p>
            </ScrollReveal>
          </div>

          {/* Right — editorial accordion */}
          <div className="faq">
            {FAQ_ITEMS.map((item, i) => (
              <ScrollReveal key={i} delay={Math.min(i * 0.03, 0.2)}>
                <details>
                  <summary>
                    <span className="idx" dir="ltr">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item.q}</span>
                    <span className="chev">
                      <ChevronDownIcon className="h-5 w-5" />
                    </span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
