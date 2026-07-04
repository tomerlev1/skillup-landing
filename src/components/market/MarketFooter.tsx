import Link from "next/link";
import { APP_STORE_URL, CONTACT_EMAIL } from "@/lib/constants";
import { categorySlug, citySlug } from "@/lib/slugs";
import type { Category, City } from "@/lib/types";

interface MarketFooterProps {
  categories: Category[];
  majorCities: City[];
}

// Footer as a browse/SEO surface: every link is a real indexable landing
// page (categories, cities), plus company/legal. Calm 14px link columns.
export default function MarketFooter({ categories, majorCities }: MarketFooterProps) {
  return (
    <footer className="mk-hairline-t bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <nav aria-label="מקצועות פופולריים">
            <h3 className="mb-4 text-sm font-semibold text-[var(--mk-ink)]">
              מקצועות
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${categorySlug(cat)}`}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                  >
                    מורים ל{cat.name_he}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="מורים לפי עיר">
            <h3 className="mb-4 text-sm font-semibold text-[var(--mk-ink)]">
              מורים לפי עיר
            </h3>
            <ul className="space-y-2.5">
              {majorCities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/cities/${citySlug(city)}`}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                  >
                    מורה פרטי ב{city.name_he.split(" - ")[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="SkillUp">
            <h3 className="mb-4 text-sm font-semibold text-[var(--mk-ink)]">
              SkillUp
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/how-it-works", label: "איך זה עובד" },
                { href: "/for-tutors", label: "הצטרפות כמורה" },
                { href: "/faq", label: "שאלות נפוצות" },
                { href: "/articles", label: "מדריכים ומאמרים" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={APP_STORE_URL}
                  className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                >
                  הורדת האפליקציה ל-iPhone
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                >
                  יצירת קשר
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--mk-ink)]">
              משפטי
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/terms", label: "תנאי שימוש" },
                { href: "/privacy", label: "מדיניות פרטיות" },
                { href: "/policy", label: "כללי הקהילה" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-[26ch] text-sm leading-relaxed text-[var(--mk-ink-3)]">
              SkillUp היא הדרך הפשוטה למצוא מורה פרטי בישראל: קשר ישיר עם
              המורה, בלי מתווכים.
            </p>
          </div>
        </div>

        <div className="mk-hairline-t mt-12 flex flex-col items-center gap-3 pt-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/SkillUpLoginLogo-Light.svg" alt="SkillUp" className="h-7 w-auto" />
          <p className="text-[13px] text-[var(--mk-ink-3)]">
            © {new Date().getFullYear()} SkillUp. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
