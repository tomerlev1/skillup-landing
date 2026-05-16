import UAAwareStoreCTAs from "./UAAwareStoreCTAs";

// Thin wrapper around UAAwareStoreCTAs preserved for marketing call sites
// (HeroSection, CTASection) that imported StoreButtons. Behavior while
// PLAY_STORE_AVAILABLE = false matches the original marketing look exactly
// (App Store active + Google Play "בקרוב" disabled). When Android ships and
// the flag flips, the same call sites automatically become UA-aware.
export default function StoreButtons({ className = "" }: { className?: string }) {
  return <UAAwareStoreCTAs className={className} />;
}
