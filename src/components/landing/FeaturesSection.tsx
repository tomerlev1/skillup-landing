import ScrollReveal from "@/components/animations/ScrollReveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { FEATURES, MANAGEMENT_SYSTEMS } from "@/lib/constants";
import {
  DashboardIcon,
  VideoIcon,
  ModalityIcon,
  ChatBubbleIcon,
  ShieldVerifiedIcon,
  BoltIcon,
  SparkleIcon,
} from "@/components/icons/CustomIcons";

type FeatureIcon = (typeof FEATURES)[number]["icon"];

const ICON_MAP: Record<
  FeatureIcon,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  dashboard: DashboardIcon,
  modality: ModalityIcon,
  video: VideoIcon,
  "message-circle": ChatBubbleIcon,
  "shield-check": ShieldVerifiedIcon,
  bolt: BoltIcon,
};

interface FeatureContentProps {
  icon: FeatureIcon;
  title: string;
  description: string;
  compact?: boolean;
  onDark?: boolean;
}

function FeatureContent({
  icon,
  title,
  description,
  compact = false,
  onDark = false,
}: FeatureContentProps) {
  const Icon = ICON_MAP[icon] ?? BoltIcon;
  return (
    <div>
      <div
        className="mb-4 grid h-10 w-10 place-items-center rounded-[10px]"
        style={{
          background: onDark ? "rgba(255,255,255,0.08)" : "var(--accent-soft)",
          color: onDark ? "#fff" : "var(--accent)",
        }}
      >
        <Icon size={20} />
      </div>
      <h3
        className="display m-0 font-extrabold leading-[1.2] tracking-[-0.015em]"
        style={{
          fontSize: compact ? 17 : 20,
          color: onDark ? "#fff" : "var(--color-ink-900)",
        }}
      >
        {title}
      </h3>
      <p
        className="mt-2 max-w-[44ch] leading-[1.6]"
        style={{
          fontSize: compact ? 13 : 14,
          color: onDark ? "rgba(255,255,255,0.7)" : "var(--color-ink-500)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  // FEATURES order: [0] 5 systems hero, [1] modality, [2] zoom video,
  // [3] chat, [4] verified, [5] dashboard, [6] bolt-reminder.
  const [hero, f1, f2, f3, f4, f5, f6] = FEATURES;

  return (
    <section
      id="features"
      className="w-full px-6 py-20 md:py-28 md:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <ScrollReveal>
              <Eyebrow n="06 / FEATURES">יכולות</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="display display-lg mt-6 max-w-[16ch]">
                היכולות שמייחדות
                <br />
                את <em className="not-italic grad-text">SkillUp.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="max-w-[38ch] text-[15px] leading-[1.7] text-[var(--fg-muted)]">
              לא עוד אפליקציה למציאת מורים. אפליקציה שעוצבה איך שלמידה צריכה
              להיראות ב-2026.
            </p>
          </ScrollReveal>
        </div>

        <div className="bento">
          {/* Hero tile: 5 management systems */}
          <ScrollReveal className="tile tile--hero">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <SparkleIcon size={14} />
                הכול במקום אחד
              </span>
              <h3
                className="display mt-6 font-black leading-[1.05] tracking-[-0.025em] text-white"
                style={{ fontSize: 40, maxWidth: "18ch" }}
              >
                {hero.title}
              </h3>
              <p
                className="mt-3.5 max-w-[40ch] text-[14px] leading-[1.65]"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {hero.description}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {MANAGEMENT_SYSTEMS.map((s) => (
                <div
                  key={s.n}
                  className="min-w-[90px] flex-1 rounded-[10px] px-2 py-2.5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <div
                    className="font-mono-lc mb-1 text-[11px]"
                    style={{ color: "var(--color-accent-400)" }}
                    dir="ltr"
                  >
                    {s.n}
                  </div>
                  <div className="text-[11px] font-bold text-white">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Modality */}
          <ScrollReveal className="tile tile--md" delay={0.1}>
            <FeatureContent
              icon={f1.icon}
              title={f1.title}
              description={f1.description}
            />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["אונליין", "אצל המורה", "אצלכם"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[var(--color-ink-100)] px-3 py-1 text-[11px] font-semibold text-[var(--color-ink-700)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Zoom / video */}
          <ScrollReveal className="tile tile--sm" delay={0.15}>
            <FeatureContent
              icon={f2.icon}
              title={f2.title}
              description={f2.description}
              compact
            />
          </ScrollReveal>

          {/* Verified teachers — soft trust tile */}
          <ScrollReveal className="tile tile--sm tile--trust" delay={0.2}>
            <FeatureContent
              icon={f4.icon}
              title={f4.title}
              description={f4.description}
              compact
            />
          </ScrollReveal>

          {/* Chat with lock-screen reply mock */}
          <ScrollReveal className="tile tile--wide" delay={0.1}>
            <FeatureContent
              icon={f3.icon}
              title={f3.title}
              description={f3.description}
            />
            <div
              className="mt-5 max-w-[360px] rounded-[14px] p-3.5 text-white"
              style={{ background: "var(--color-ink-1000)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-7 w-7 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))",
                  }}
                />
                <div className="flex-1">
                  <div className="text-xs font-bold">מיכל לוי</div>
                  <div
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    תודה על השיעור! מצורף דף התרגול...
                  </div>
                </div>
                <div
                  className="rounded-md px-2 py-1 text-[10px]"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  השב
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Dashboard with fake bar chart */}
          <ScrollReveal className="tile tile--md tile--paper" delay={0.15}>
            <FeatureContent
              icon={f5.icon}
              title={f5.title}
              description={f5.description}
            />
            <div className="mt-4 flex h-[60px] items-end gap-1.5">
              {[40, 55, 48, 70, 65, 85, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 6
                        ? "var(--color-accent-500)"
                        : "var(--color-brand-300)",
                  }}
                />
              ))}
            </div>
          </ScrollReveal>

          {/* Bolt reminder */}
          <ScrollReveal className="tile tile--md" delay={0.2}>
            <FeatureContent
              icon={f6.icon}
              title={f6.title}
              description={f6.description}
            />
            <div className="mt-4 flex items-center gap-2">
              <span
                className="font-mono-lc rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
                dir="ltr"
              >
                -4:00
              </span>
              <span className="mono-sm text-[var(--fg-muted)]" dir="ltr">
                push + email
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
