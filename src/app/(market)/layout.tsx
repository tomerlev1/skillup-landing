import AuthProvider from "@/components/auth/AuthProvider";
import MarketFooter from "@/components/market/MarketFooter";
import MarketNav from "@/components/market/MarketNav";
import SupportWidget from "@/components/support/SupportWidget";
import { getCategories, getMajorCities } from "@/lib/data/taxonomy";

// Shared shell for every marketplace surface (home, search, profiles,
// booking, messages, auth). Deep-link app shells and legal pages live
// outside this group and keep their own chrome.
//
// Deliberately NO server-side session read here: touching cookies() in the
// layout would force every public page (home, categories, profiles — the
// SEO surfaces) to dynamic rendering. AuthProvider resolves the session
// client-side; protected routes are enforced in proxy.ts and re-checked
// in their own server components.
export default async function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, majorCities] = await Promise.all([
    getCategories(),
    getMajorCities(),
  ]);

  return (
    <AuthProvider initialProfile={null}>
      <MarketNav categories={categories} />
      <main className="min-h-[70dvh]">{children}</main>
      <MarketFooter categories={categories} majorCities={majorCities} />
      <SupportWidget />
    </AuthProvider>
  );
}
