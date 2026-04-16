"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import { PAIN_POINTS } from "@/lib/constants";
import {
  FrustratedSearchIcon,
  UnverifiedTeacherIcon,
  ComplicatedCoordIcon,
  ChevronDownIcon,
} from "@/components/icons/CustomIcons";

const PAIN_ICON_MAP = {
  "frustrated-search": FrustratedSearchIcon,
  "unverified-teacher": UnverifiedTeacherIcon,
  "complicated-coord": ComplicatedCoordIcon,
} as const;

export default function PainPointsSection() {
  return (
    <div
      className="section-bloom w-full px-6 py-20 text-center md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "85%", ["--bloom-y" as string]: "10%" }}
    >
      <ScrollReveal>
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
          dir="ltr"
        >
          02 - למה SkillUp
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
          למה SkillUp?
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <p className="mx-auto mt-3 mb-12 max-w-xl text-dark-500">
          מצאנו פתרון לכל בעיה שהכרתם
        </p>
      </ScrollReveal>

      {/* Pain cards */}
      <div className="mx-auto flex max-w-4xl flex-col gap-6 md:flex-row">
        {PAIN_POINTS.map((point, i) => {
          const IconComponent = PAIN_ICON_MAP[point.iconId];
          return (
            <ScrollReveal key={i} delay={0.15 + i * 0.1} className="flex-1">
              <div className="rounded-2xl border border-dark-200 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md">
                <div className="mb-3 flex justify-center">
                  <IconComponent size={48} />
                </div>
                <h3 className="mb-1.5 text-base font-bold text-dark-900">
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed text-dark-500">
                  {point.description}
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Arrow + solution text */}
      <ScrollReveal delay={0.5}>
        <div className="mt-12 mb-4 flex justify-center text-brand-400">
          <ChevronDownIcon className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-dark-800">
          עם SkillUp, הכל פשוט
        </p>
      </ScrollReveal>
    </div>
  );
}
