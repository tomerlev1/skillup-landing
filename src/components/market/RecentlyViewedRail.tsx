"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice, formatRating } from "@/lib/format";
import {
  getRecentlyViewed,
  type ViewedTeacherSnapshot,
} from "@/lib/recently-viewed";

// Returning-visitor rail — renders nothing on a first visit, so the
// homepage stays identical for SSG; hydration only adds the row when
// localStorage has history.
export default function RecentlyViewedRail() {
  const [viewed, setViewed] = useState<ViewedTeacherSnapshot[]>([]);

  useEffect(() => {
    setViewed(getRecentlyViewed());
  }, []);

  if (viewed.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-14 sm:px-6">
      <h2 className="mb-5 font-display text-xl font-bold text-[var(--mk-ink)] sm:text-2xl">
        מורים שצפיתם בהם לאחרונה
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {viewed.slice(0, 8).map((t) => (
          <Link
            key={t.id}
            href={`/tutors/${t.id}`}
            className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-[var(--mk-hairline)] bg-white p-3 transition-colors hover:border-[var(--mk-ink)]"
          >
            {t.image ? (
              <Image
                src={t.image}
                alt=""
                width={52}
                height={52}
                className="h-13 w-13 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-brand-50 font-display text-lg font-bold text-brand-300">
                {t.display_name.slice(0, 1)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--mk-ink)]">
                {t.display_name}
              </span>
              <span className="block truncate text-xs text-[var(--mk-ink-3)]">
                {[t.subject, t.city_name].filter(Boolean).join(" · ")}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-[var(--mk-ink-2)]">
                {t.review_count > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star size={11} style={{ fill: "#F5A623", color: "#F5A623" }} />
                    <span className="tnum">{formatRating(t.rating_avg)}</span>
                  </span>
                )}
                {t.hourly_rate != null && (
                  <span className="ltr-isolate tnum font-medium">
                    {formatPrice(t.hourly_rate)}
                  </span>
                )}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
