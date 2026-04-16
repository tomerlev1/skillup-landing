"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import CountUp from "@/components/animations/CountUp";
import { STATS } from "@/lib/constants";

export default function StatsSection() {
  return (
    <div
      className="section-bloom w-full px-6 py-20 text-center md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "15%", ["--bloom-y" as string]: "60%" }}
    >
      <ScrollReveal>
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
          dir="ltr"
        >
          08 - ההבטחות
        </p>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
          ההבטחות שלנו אליכם
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="mx-auto mb-12 max-w-2xl text-sm text-dark-600 md:text-base">
          חמש הבטחות שאנחנו עומדים מאחוריהן מהיום הראשון, בלי כוכביות ובלי אותיות קטנות.
        </p>
      </ScrollReveal>

      <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-center gap-6 md:gap-10">
        {STATS.map((stat, i) => {
          const isHeadline = "display" in stat && stat.display === "0₪";
          const numberClass = `text-5xl font-black tracking-tight md:text-6xl ${
            isHeadline ? "gradient-text" : "text-dark-900"
          }`;
          return (
            <ScrollReveal
              key={i}
              delay={0.1 + i * 0.1}
              className="min-w-[42%] md:min-w-[160px] md:flex-1"
            >
              <div className="flex flex-col items-center rounded-2xl border border-dark-200 bg-white px-4 py-6 shadow-sm">
                {"display" in stat ? (
                  <span className={numberClass}>{stat.display}</span>
                ) : (
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    className={numberClass}
                  />
                )}
                <span className="mt-2 text-sm font-medium leading-relaxed text-dark-700">
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
