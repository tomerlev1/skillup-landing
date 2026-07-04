import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  SearchParams,
  SearchResult,
  TeacherCard,
  TeacherProfile,
} from "@/lib/types";

/**
 * Anonymous teacher search via the anon-safe `search_teachers_public` RPC
 * (reads only the PII-free teachers_public view; returns {items, total}).
 */
export async function searchTeachers(
  params: SearchParams = {},
): Promise<SearchResult> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("search_teachers_public", {
    p_query: params.query ?? null,
    p_city_id: params.cityId ?? null,
    p_category_id: params.categoryId ?? null,
    p_subject_ids: params.subjectIds?.length ? params.subjectIds : null,
    p_min_price: params.minPrice ?? null,
    p_max_price: params.maxPrice ?? null,
    p_min_rating: params.minRating ?? null,
    p_modes: params.modes?.length ? params.modes : null,
    p_sort: params.sort ?? "rating",
    p_limit: params.limit ?? 20,
    p_offset: params.offset ?? 0,
  });

  if (error) throw new Error(`search_teachers_public failed: ${error.message}`);
  return (data ?? { items: [], total: 0 }) as SearchResult;
}

/** Featured rail for the homepage: top-rated active teachers. */
export async function getFeaturedTeachers(limit = 8): Promise<TeacherCard[]> {
  const { items } = await searchTeachers({ sort: "rating", limit });
  return items;
}

/** Newest teachers rail ("חדשים ב-SkillUp"). */
export async function getNewTeachers(limit = 8): Promise<TeacherCard[]> {
  const { items } = await searchTeachers({ sort: "newest", limit });
  return items;
}

/**
 * Full public profile from the teachers_public view (anon-safe columns only —
 * phone/email/address/zoom are excluded at the database layer).
 * Wrapped in React cache() so page + generateMetadata share one fetch.
 */
export const getTeacherProfile = cache(
  async (id: string): Promise<TeacherProfile | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("teachers_public")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`teachers_public fetch failed: ${error.message}`);
    return data as TeacherProfile | null;
  },
);

/**
 * Subjects a specific teacher offers, with category ids for linking and the
 * per-subject experience years (teacher_subjects.experience_years).
 */
export const getTeacherSubjects = cache(async (teacherId: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("teacher_subjects")
    .select("subject_id, experience_years, subjects(id, name_he, category_id, icon)")
    .eq("teacher_id", teacherId);

  if (error) throw new Error(`teacher_subjects fetch failed: ${error.message}`);

  return (data ?? [])
    .map((row) => {
      const subject = row.subjects as unknown as {
        id: string;
        name_he: string;
        category_id: string;
        icon: string | null;
      };
      return subject
        ? { ...subject, experience_years: (row.experience_years as number | null) ?? null }
        : null;
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .sort((a, b) => a.name_he.localeCompare(b.name_he, "he"));
});

/** Rating aggregate for one teacher (published reviews only). */
export const getTeacherStats = cache(async (teacherId: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("teacher_id", teacherId)
    .eq("status", 1);

  if (error) throw new Error(`reviews fetch failed: ${error.message}`);
  const ratings = (data ?? []).map((r) => r.rating as number);
  const count = ratings.length;
  const avg = count ? ratings.reduce((s, r) => s + r, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => Math.round(r) === star).length,
  }));
  return { avg, count, distribution };
});
