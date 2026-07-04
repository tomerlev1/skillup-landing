"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import TeacherCard from "@/components/market/TeacherCard";
import { TeacherGridSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { FAVORITES_EVENT, getFavorites } from "@/lib/favorites";
import type { TeacherCard as TeacherCardData, SearchResult } from "@/lib/types";

// Saved tutors — favorites live in localStorage (works for guests too),
// hydrated into full cards via the anon search RPC.
export default function SavedTutorsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [ids, setIds] = useState<string[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setIds(getFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  useEffect(() => {
    if (ids === null) return;
    if (ids.length === 0) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      // Cards for saved ids: fetch a page and filter (the RPC has no id
      // filter; saved lists are small so over-fetching one page is fine).
      const results: TeacherCardData[] = [];
      const { data } = await supabase
        .from("teachers_public")
        .select("id, display_name, bio, avatar_url, card_image_url, video_url, hourly_rate, lesson_mode_prices, lesson_modes, city_id, experience_years, total_students, education, languages, is_verified, is_subscribed, subscription_tier, created_at")
        .in("id", ids)
        .eq("is_active", true);
      for (const row of data ?? []) {
        results.push({
          ...(row as unknown as TeacherCardData),
          city_name: null,
          rating_avg: 0,
          review_count: 0,
          subjects: [],
        });
      }
      // Enrich with ratings/subjects/city via the search RPC when possible.
      const { data: enriched } = await supabase.rpc("search_teachers_public", {
        p_limit: 50,
      });
      const enrichedMap = new Map(
        ((enriched as SearchResult | null)?.items ?? []).map((t) => [t.id, t]),
      );
      const merged = results.map((t) => enrichedMap.get(t.id) ?? t);
      if (!cancelled) {
        // Preserve the user's save order.
        setTeachers(
          ids
            .map((id) => merged.find((t) => t.id === id))
            .filter((t): t is TeacherCardData => Boolean(t)),
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, supabase]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--mk-ink)]">
        מורים ששמרתי
      </h1>

      {loading ? (
        <div className="mt-8">
          <TeacherGridSkeleton count={4} />
        </div>
      ) : teachers.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-[var(--mk-band)] px-6 py-16 text-center">
          <Heart size={36} className="mx-auto text-[var(--mk-ink-3)]" />
          <h2 className="mt-4 text-lg font-semibold text-[var(--mk-ink)]">
            עדיין לא שמרתם מורים
          </h2>
          <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-[var(--mk-ink-2)]">
            לחצו על הלב בכרטיס של מורה כדי לשמור אותו כאן. ככה קל להשוות
            ולחזור אליו אחר כך.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            למציאת מורה
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(225px,1fr))] lg:gap-x-6">
          {teachers.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}
    </div>
  );
}
