"use client";

import { useEffect, useState } from "react";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  PLAY_STORE_AVAILABLE,
} from "@/lib/constants";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  // iPadOS 13+ reports as Mac; sniff touch + Mac to catch it.
  const isIPad =
    /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  if (/iPhone|iPod/.test(ua) || isIPad) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function AppStoreButton() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="הורידו ב-App Store"
      className="inline-flex items-center gap-3 rounded-xl bg-black px-5 py-3 transition-opacity hover:opacity-80"
    >
      <svg
        className="h-8 w-8 shrink-0"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div className="flex flex-col text-white text-right">
        <span className="text-[10px] leading-tight opacity-80">הורידו ב-</span>
        <span className="text-base font-semibold leading-tight">App Store</span>
      </div>
    </a>
  );
}

function PlayStoreButton() {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="הורידו ב-Google Play"
      className="inline-flex items-center gap-3 rounded-xl bg-black px-5 py-3 transition-opacity hover:opacity-80"
    >
      <svg
        className="h-8 w-8 shrink-0"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92zm10.89 9.48l2.706-2.707-11.4-6.588 8.694 9.295zm2.706 1.412L14.5 15.413l-8.694 9.295 11.4-6.588-2.706-2.707zM20.514 10.88l-2.39 1.38 2.39 1.38a.999.999 0 0 0 0-1.76l-2.39-1z" />
      </svg>
      <div className="flex flex-col text-white text-right">
        <span className="text-[10px] leading-tight opacity-80">הורידו ב-</span>
        <span className="text-base font-semibold leading-tight">Google Play</span>
      </div>
    </a>
  );
}

function PlayStoreComingSoon() {
  return (
    <div
      aria-label="Google Play: בקרוב"
      className="relative inline-flex items-center gap-3 rounded-xl bg-black/70 px-5 py-3 opacity-70"
    >
      <svg
        className="h-8 w-8 shrink-0"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92zm10.89 9.48l2.706-2.707-11.4-6.588 8.694 9.295zm2.706 1.412L14.5 15.413l-8.694 9.295 11.4-6.588-2.706-2.707zM20.514 10.88l-2.39 1.38 2.39 1.38a.999.999 0 0 0 0-1.76l-2.39-1z" />
      </svg>
      <div className="flex flex-col text-white text-right">
        <span className="text-[10px] leading-tight opacity-80">Google Play</span>
        <span className="text-base font-semibold leading-tight">בקרוב</span>
      </div>
    </div>
  );
}

// UA-aware store CTAs. Renders the "both buttons" / marketing variant on the
// server and on first paint, then upgrades after mount once we can read the UA.
// While PLAY_STORE_AVAILABLE is false, Android users still see only App Store
// (sending them to a 404 Play Store would be worse than nothing).
export default function UAAwareStoreCTAs({
  className = "",
}: {
  className?: string;
}) {
  const [platform, setPlatform] = useState<Platform>("other");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setMounted(true);
  }, []);

  // Pre-mount: render the both-buttons variant so SSR markup matches first paint.
  // Post-mount: tailor by detected platform.
  const showAppStore =
    !mounted || platform === "ios" || platform === "other" || !PLAY_STORE_AVAILABLE;
  const showPlayStoreActive =
    PLAY_STORE_AVAILABLE && mounted && (platform === "android" || platform === "other");
  const showPlayStoreComingSoon =
    !PLAY_STORE_AVAILABLE && (!mounted || platform === "other");

  // When Android user + Play Store not available, fall back to App Store only.
  const androidFallbackToAppStore =
    mounted && platform === "android" && !PLAY_STORE_AVAILABLE;

  return (
    <div className={`flex flex-row flex-wrap justify-center gap-4 ${className}`}>
      {(showAppStore || androidFallbackToAppStore) && <AppStoreButton />}
      {showPlayStoreActive && <PlayStoreButton />}
      {showPlayStoreComingSoon && <PlayStoreComingSoon />}
    </div>
  );
}
