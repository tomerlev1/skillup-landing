import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { ARTICLES } from "@/lib/articles";
import { getCategories, getMajorCities } from "@/lib/data/taxonomy";
import { createPublicClient } from "@/lib/supabase/public";
import { categorySlug, citySlug } from "@/lib/slugs";

export const revalidate = 3600;

// Complete crawl surface: marketplace entry points, every category and
// major-city landing page, all articles, and every active tutor profile.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/for-tutors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [categories, majorCities, teachersRes] = await Promise.all([
    getCategories().catch(() => []),
    getMajorCities().catch(() => []),
    createPublicClient()
      .from("teachers_public")
      .select("id, updated_at")
      .eq("is_active", true)
      .eq("profile_completed", true)
      .limit(1000),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categories/${categorySlug(c)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const cityEntries: MetadataRoute.Sitemap = majorCities.map((c) => ({
    url: `${SITE_URL}/cities/${citySlug(c)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.datePublished),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const teacherEntries: MetadataRoute.Sitemap = (teachersRes.data ?? []).map(
    (t: { id: string; updated_at: string | null }) => ({
      url: `${SITE_URL}/tutors/${t.id}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [
    ...staticEntries,
    ...categoryEntries,
    ...cityEntries,
    ...articleEntries,
    ...teacherEntries,
  ];
}
