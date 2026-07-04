import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, City, Subject } from "@/lib/types";

// Taxonomy (categories / subjects / cities) is small and nearly static.
// React cache() dedupes within a request; page-level ISR (`revalidate`)
// controls cross-request freshness.

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_he, name_en, description_he, icon_name, color_hex, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`categories fetch failed: ${error.message}`);
  return (data ?? []) as Category[];
});

export const getSubjects = cache(async (): Promise<Subject[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name_he, name, category_id, icon")
    .order("name_he", { ascending: true });

  if (error) throw new Error(`subjects fetch failed: ${error.message}`);
  return (data ?? []) as Subject[];
});

export const getSubjectsByCategory = cache(
  async (categoryId: string): Promise<Subject[]> => {
    const subjects = await getSubjects();
    return subjects.filter((s) => s.category_id === categoryId);
  },
);

/** All ~1300 cities — only for sitemap/slug resolution, never per-layout. */
export const getCities = cache(async (): Promise<City[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name_he, name_en, sort_order")
    .order("name_he", { ascending: true })
    .range(0, 1999);

  if (error) throw new Error(`cities fetch failed: ${error.message}`);
  return (data ?? []) as City[];
});

/** The curated major-city set (footer, homepage, city landing pages). */
export const getMajorCities = cache(async (): Promise<City[]> => {
  const { MAJOR_CITY_PREFIXES, pickMajorCities } = await import(
    "@/lib/market-constants"
  );
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name_he, name_en, sort_order")
    .or(MAJOR_CITY_PREFIXES.map((p) => `name_he.ilike.${p}%`).join(","));

  if (error) throw new Error(`major cities fetch failed: ${error.message}`);
  return pickMajorCities((data ?? []) as City[]);
});
