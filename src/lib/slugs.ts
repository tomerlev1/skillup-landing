import type { Category, City } from "@/lib/types";

// URL slugs are derived from the DB English names at request time — no
// hardcoded id maps, so dev/prod stay consistent automatically.
// "Mathematics & Sciences" -> "mathematics-and-sciences".
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categorySlug(category: Category): string {
  return slugify(category.name_en);
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((c) => categorySlug(c) === slug);
}

export function citySlug(city: City): string {
  return slugify(city.name_en ?? city.name_he);
}

export function findCityBySlug(cities: City[], slug: string): City | undefined {
  const decoded = decodeURIComponent(slug);
  return cities.find((c) => citySlug(c) === decoded);
}
