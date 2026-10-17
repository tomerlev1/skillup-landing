"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import AccountHeader from "@/components/page/AccountHeader";
import TeacherCard from "@/components/market/TeacherCard";
import { TeacherGridSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { fetchNextSlots } from "@/lib/data/availability";
import { FAVORITES_EVENT, getFavorites } from "@/lib/favorites";
import type { AvailabilitySlot, TeacherCard as TeacherCardData, SearchResult } from "@/lib/types";

// Saved tutors — favorites live in localStorage (works for guests too),
// hydrated into full cards via the anon search RPC.
export default function SavedTutorsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [ids, setIds] = useState<string[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherCardData[]>([]);
  const [nextSlots, setNextSlots] = useState<Record<string, AvailabilitySlot>>({});
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
      const slots = await fetchNextSlots(supabase, ids);
      if (!cancelled) {
        setNextSlots(slots);
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
    <>
      <AccountHeader
        icon={Heart}
        tone="bg-tint-rose text-tint-rose-fg"
        title="מורים ששמרתי"
        subtitle={
          loading
            ? "טוענים את הרשימה שלכם…"
            : teachers.length
              ? `${teachers.length} ${teachers.length === 1 ? "מורה שמור" : "מורים שמורים"} · קל להשוות ולחזור`
              : "הרשימה הקצרה שלכם, במקום אחד"
        }
        aside={
          teachers.length > 0 && (
            <Link
              href="/search"
              className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-surface px-4 text-sm font-bold text-ink shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-colors hover:text-action"
            >
              <Search size={16} strokeWidth={2} aria-hidden="true" />
              למורים נוספים
            </Link>
          )
        }
      />
    <div className="mx-auto max-w-[960px] px-4 pb-16 sm:px-6">

      {loading ? (
        <div>
          <TeacherGridSkeleton count={4} />
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-[var(--r-lg)] bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <span className="mx-auto grid size-16 place-items-center rounded-[var(--r-lg)] bg-tint-rose text-tint-rose-fg">
            <Heart strokeWidth={2} size={30} fill="currentColor" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-ink">
            עדיין לא שמרתם מורים
          </h2>
          <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-ink-2">
            לחצו על הלב בכרטיס של מורה כדי לשמור אותו כאן. ככה קל להשוות
            ולחזור אליו אחר כך.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-action px-6 text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-opacity hover:opacity-90"
          >
            למציאת מורה
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {teachers.map((t) => (
            <TeacherCard
              key={t.id}
              teacher={t}
              variant="list"
              nextSlot={nextSlots[t.id]}
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
