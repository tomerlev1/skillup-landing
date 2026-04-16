"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";
import { FEATURES } from "@/lib/constants";
import {
  ShieldVerifiedIcon,
  ChatBubbleIcon,
  TrophyIcon,
  VideoIcon,
  ModalityIcon,
  DashboardIcon,
  BoltIcon,
  SecureLockIcon,
  TrustCheckIcon,
} from "@/components/icons/CustomIcons";

const ICON_MAP = {
  trophy: TrophyIcon,
  modality: ModalityIcon,
  video: VideoIcon,
  "message-circle": ChatBubbleIcon,
  "shield-check": ShieldVerifiedIcon,
  dashboard: DashboardIcon,
  bolt: BoltIcon,
} as const;

// Production-grade signals shipping in the iOS app.
const TRUST_ROWS = [
  {
    Icon: SecureLockIcon,
    title: "אימות במפתחות חומרה",
    detail: "סיסמאות וטוקנים נשמרים ב-iOS Keychain עם הצפנה ברמת חומרה.",
  },
  {
    Icon: ShieldVerifiedIcon,
    title: "תואם OWASP Mobile Top 10",
    detail: "אימות מאובטח, הגנה על תקשורת ונתונים, פרטיות ברירת מחדל.",
  },
  {
    Icon: TrustCheckIcon,
    title: "אנליטיקה באירופה (GDPR)",
    detail: "כל המדדים נשלחים לשרתי EU. תואם לתקנות פרטיות ישראליות ואירופיות.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <div
      className="section-bloom relative w-full px-6 py-20 md:py-28 md:px-16"
      style={{ ["--bloom-x" as string]: "85%", ["--bloom-y" as string]: "50%" }}
    >
      <div className="relative z-10">
        <ScrollReveal>
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-brand-600"
            dir="ltr"
          >
            07 - יכולות
          </p>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-dark-900 md:text-4xl">
            היכולות שמייחדות את SkillUp
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-3 mb-12 max-w-2xl text-center text-dark-600">
            לא עוד אפליקציה למציאת מורים. אפליקציה שעוצבה איך שלמידה צריכה להיראות ב-2026.
          </p>
        </ScrollReveal>

        {/* 7-card grid: 3 cols on lg, last card centers; 2 cols md; 1 col mobile */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-start-2">
          {FEATURES.map((feature, i) => {
            const IconComponent = ICON_MAP[feature.icon];

            return (
              <ScrollReveal key={i} delay={0.1 + (i % 3) * 0.1}>
                <div className="cursor-default h-full rounded-2xl border border-dark-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md">
                  <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                    <IconComponent size={24} className="text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-dark-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-dark-600">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Security trust strip */}
        <ScrollReveal delay={0.3}>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-dark-200" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-dark-500">
                פרטיות ואבטחה ברמה של בנק
              </span>
              <span className="h-px w-12 bg-dark-200" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {TRUST_ROWS.map((row) => (
                <div
                  key={row.title}
                  className="flex items-start gap-3 rounded-xl border border-dark-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-brand-100">
                    <row.Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-900">{row.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-dark-600">
                      {row.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
