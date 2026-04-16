import ScrollReveal from "@/components/animations/ScrollReveal";
import { FAQ_ITEMS } from "@/lib/structured-data";
import { ChevronDownIcon } from "@/components/icons/CustomIcons";

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="section-bloom w-full px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "85%", ["--bloom-y" as string]: "70%" }}
    >
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            dir="ltr"
          >
            09 - שאלות נפוצות
          </p>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
            שאלות נפוצות
          </h2>
          <p className="mt-3 text-center text-xs font-medium text-dark-400">
            עודכן לאחרונה: אפריל 2026
          </p>
        </ScrollReveal>

        <div className="mt-10 flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <ScrollReveal key={i} delay={Math.min(i * 0.03, 0.2)}>
              <details className="group rounded-xl border border-dark-200 bg-white/70 px-5 py-4 backdrop-blur-sm transition-colors open:border-brand-300 open:bg-white">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-bold text-dark-900 md:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDownIcon className="h-5 w-5 shrink-0 text-dark-500 transition-transform duration-300 group-open:-rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-dark-600 md:text-base group-open:[animation:fadeIn_0.3s_ease]">
                  {item.a}
                </p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
