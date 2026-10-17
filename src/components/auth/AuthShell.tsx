import { BadgeCheck, CalendarCheck, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const POINTS = [
  { icon: BadgeCheck, text: "פרופילים מאומתים וביקורות של תלמידים אמיתיים" },
  { icon: CalendarCheck, text: "קובעים שיעור ישירות מהיומן של המורה" },
  { icon: MessageCircle, text: "צ׳אט ישיר, בלי מתווכים ובלי עמלות" },
];

// Split auth layout: the form on a clean card (start side), a bright brand
// panel with the three promises on the end side from lg up.
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="bg-canvas px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-[1040px] overflow-hidden rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-lift)] ring-1 ring-line/60 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="px-6 py-10 sm:px-12 sm:py-12">
          <div className="mx-auto w-full max-w-[400px]">
            <BrandLogo className="h-11 w-auto" />
            <h1 className="mt-7 font-ed text-[30px] font-black leading-tight text-ink">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-base leading-relaxed text-ink-2">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <aside className="panel-soft hidden p-12 text-ink lg:flex lg:flex-col lg:justify-between" style={{ outline: "none", boxShadow: "none" }}>
          <div aria-hidden="true" className="orb end-[-40px] top-[-60px] size-[280px] bg-brand-200/60" />
        <div aria-hidden="true" className="orb orb--slow bottom-[-80px] start-[-40px] size-[260px] bg-tint-peach" />
          <div>
            <p className="text-sm font-semibold text-action">SkillUp</p>
            <p className="font-ed mt-2 text-[34px] font-black leading-tight text-balance">
              המורה הנכון מחכה לכם כאן.
            </p>
          </div>
          <ul className="mt-10 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] bg-surface text-action shadow-[var(--shadow-card)] ring-1 ring-line/60">
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="text-[15px] font-semibold leading-snug">{text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-ink-3">אותו חשבון באתר ובאפליקציה.</p>
        </aside>
      </div>
    </div>
  );
}
