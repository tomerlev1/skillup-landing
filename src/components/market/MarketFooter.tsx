import Link from "next/link";
import AppStoreButtons from "@/components/market/AppStoreButtons";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
import { CONTACT_EMAIL } from "@/lib/constants";
import { categorySlug, citySlug } from "@/lib/slugs";
import type { Category, City } from "@/lib/types";

interface MarketFooterProps {
  categories: Category[];
  majorCities: City[];
}

const linkClass =
  "inline-flex min-h-6 items-center text-[15px] text-ink-2 transition-colors hover:text-action";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-4 text-sm font-extrabold text-ink">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </nav>
  );
}

// Footer: a brand column (logo, promise, apps, display switch) beside the
// browse/SEO link columns. It fades in from the page instead of starting at a
// hard line.
export default function MarketFooter({ categories, majorCities }: MarketFooterProps) {
  const cities = majorCities.slice(0, 8);
  return (
    <footer className="band-footer mt-10 pt-16">
      <div className="mx-auto max-w-[1280px] px-4 pb-10 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2.2fr)]">
          {/* Brand column */}
          <div className="max-w-[380px]">
            <BrandLogo className="h-12 w-auto" />
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
              הדרך הפשוטה למצוא מורה פרטי בישראל: פרופילים מאומתים, מחירים ברורים
              וקשר ישיר עם המורה, בלי מתווכים.
            </p>
            <p className="mt-7 text-sm font-extrabold text-ink">האפליקציה בכיס</p>
            <AppStoreButtons size="compact" className="mt-3" />
            <p className="mt-7 text-sm font-extrabold text-ink">מצב תצוגה</p>
            <div className="mt-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <Column title="מקצועות">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categories/${categorySlug(cat)}`} className={linkClass}>
                    {cat.name_he}
                  </Link>
                </li>
              ))}
            </Column>

            <Column title="ערים">
              {cities.map((city) => (
                <li key={city.id}>
                  <Link href={`/cities/${citySlug(city)}`} className={linkClass}>
                    {city.name_he.split(" - ")[0]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/search" className={`${linkClass} font-bold text-action`}>
                  כל הערים
                </Link>
              </li>
            </Column>

            <Column title="SkillUp">
              {[
                { href: "/how-it-works", label: "איך זה עובד" },
                { href: "/for-tutors", label: "הצטרפות כמורה" },
                { href: "/faq", label: "שאלות נפוצות" },
                { href: "/articles", label: "מדריכים ומאמרים" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                  יצירת קשר
                </a>
              </li>
            </Column>

            <Column title="משפטי">
              {[
                { href: "/terms", label: "תנאי שימוש" },
                { href: "/privacy", label: "מדיניות פרטיות" },
                { href: "/policy", label: "כללי הקהילה" },
                { href: "/accessibility", label: "הצהרת נגישות" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </Column>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-brand-100 pt-6 text-sm text-ink-3 sm:flex-row">
          <p>© {new Date().getFullYear()} SkillUp. כל הזכויות שמורות.</p>
          <p>שיעורים פרטיים בכל תחום, בכל הארץ</p>
        </div>
      </div>
    </footer>
  );
}
