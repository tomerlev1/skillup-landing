import { TRUST_BADGES } from "@/lib/constants";

// Two identical tracks translated -50% together so the loop is seamless.
function TrustTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="marquee__track"
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {[...TRUST_BADGES, ...TRUST_BADGES].map((badge, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-[var(--fg-muted)]"
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full bg-[var(--color-accent-500)] shadow-[0_0_0_3px_rgba(255,112,51,0.3)]"
            aria-hidden="true"
          />
          {badge}
        </span>
      ))}
    </div>
  );
}

export default function TrustBarSection() {
  return (
    <section className="w-full border-y border-[var(--rule)] bg-white py-6">
      <div className="marquee">
        <TrustTrack />
        <TrustTrack ariaHidden />
      </div>
    </section>
  );
}
