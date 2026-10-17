import { APP_STORE_URL, PLAY_STORE_AVAILABLE, PLAY_STORE_URL } from "@/lib/constants";

interface AppStoreButtonsProps {
  /** "compact" for the footer, "default" for the homepage band. */
  size?: "compact" | "default";
  className?: string;
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M3.6 2.3a1 1 0 0 0-.5.9v17.6a1 1 0 0 0 .5.9l9.6-9.7L3.6 2.3z" fill="#00D2FF" />
      <path d="m16.3 8.4-3.1 3.3 3.1 3.3 3.7-2.1c.8-.5.8-1.9 0-2.4l-3.7-2.1z" fill="#FFCE00" />
      <path d="m13.2 11.7-9.6 9.7c.3.2.7.2 1.1 0l11.6-6.4-3.1-3.3z" fill="#FF3D44" />
      <path d="M3.6 2.3 13.2 12l3.1-3.3L4.7 2.3c-.4-.2-.8-.2-1.1 0z" fill="#00E676" />
    </svg>
  );
}

// iOS download (live) + Android (coming soon). When Android ships, flip
// PLAY_STORE_AVAILABLE in constants and the Play button auto-activates.
export default function AppStoreButtons({
  size = "default",
  className = "",
}: AppStoreButtonsProps) {
  const pad = size === "compact" ? "h-14 px-5" : "h-16 px-6";
  const glyph = size === "compact" ? "h-7 w-7" : "h-8 w-8";
  const small = "text-xs"; // 12px: tiny badge label (spec §7.2)
  const big = size === "compact" ? "text-[17px]" : "text-lg";

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {/* App Store — live */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="הורדת אפליקציית SkillUp מ-App Store"
        className={`store-btn group inline-flex ${pad} items-center gap-3 rounded-[var(--r-md)] text-white`}
      >
        <AppleGlyph className={`${glyph} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`} />
        <span className="flex flex-col items-start leading-none">
          <span className={`${small} opacity-75`}>הורידו מה-</span>
          <span className={`${big} whitespace-nowrap font-bold`}>App Store</span>
        </span>
      </a>

      {/* Google Play — coming soon (non-interactive until it ships) */}
      {PLAY_STORE_AVAILABLE ? (
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="הורדת אפליקציית SkillUp מ-Google Play"
          className={`store-btn group inline-flex ${pad} items-center gap-3 rounded-[var(--r-md)] text-white`}
        >
          <PlayGlyph className={glyph} />
          <span className="flex flex-col items-start leading-none">
            <span className={`${small} opacity-80`}>הורידו עכשיו</span>
            <span className={`${big} font-semibold`}>Google Play</span>
          </span>
        </a>
      ) : (
        <span
          aria-disabled="true"
          className={`store-btn store-btn--soon relative inline-flex ${pad} cursor-default items-center gap-3 rounded-[var(--r-md)] text-white`}
        >
          <PlayGlyph className={`${glyph} opacity-70 grayscale-[35%]`} />
          <span className="flex flex-col items-start leading-none">
            <span className={`${small} opacity-75`}>בקרוב ב-</span>
            <span className={`${big} whitespace-nowrap font-bold`}>Google Play</span>
          </span>
          <span className="absolute -top-2.5 end-3 rounded-full bg-tint-peach px-2.5 py-0.5 text-xs font-bold text-tint-peach-fg shadow-[var(--shadow-card)]">
            בקרוב
          </span>
        </span>
      )}
    </div>
  );
}
