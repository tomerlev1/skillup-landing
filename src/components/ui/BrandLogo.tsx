interface BrandLogoProps {
  /** Sizing/layout classes applied to both variants (e.g. "h-9 w-auto"). */
  className?: string;
}

// SkillUp wordmark. Both variants are rendered; globals.css shows the dark
// one under `data-theme="dark"` (and prefers-color-scheme when no explicit
// choice is stored) and hides the other with display:none, so only one is
// ever painted or exposed to assistive tech, with no hydration flash.
export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/SkillUpLoginLogo-Light.svg"
        alt="SkillUp"
        className={`logo-light ${className}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/SkillUp-SignIn-Logo-dark.svg"
        loading="lazy"
        alt="SkillUp"
        className={`logo-dark ${className}`}
      />
    </>
  );
}
