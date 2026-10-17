"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/ui/Avatar";
import CategoryIcon from "@/components/market/CategoryIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
import { categorySlug } from "@/lib/slugs";
import type { Category } from "@/lib/types";

interface MarketNavProps {
  categories: Category[];
}

const NAV_LINKS = [
  { href: "/how-it-works", label: "איך זה עובד" },
  { href: "/for-tutors", label: "למורים" },
];

// Marketplace nav: 64px, surface, hairline appears on scroll. One indigo
// element (the primary CTA); everything else is ink. Subjects live in a
// compact 2-column panel (not a mega-nav) linking the SEO category pages.
export default function MarketNav({ categories }: MarketNavProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close panels on outside click / route change / Escape.
  useEffect(() => {
    setSubjectsOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!subjectsRef.current?.contains(e.target as Node)) setSubjectsOpen(false);
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSubjectsOpen(false);
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const linkClass = (href: string) =>
    `inline-flex h-16 items-center text-sm font-medium transition-colors ${
      pathname === href
        ? "text-ink"
        : "text-ink-2 hover:text-ink"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,border-color,background-color] duration-300 ${
        scrolled
          ? "border-b border-line/70 bg-surface/80 shadow-[0_8px_24px_-18px_rgba(46,40,168,0.35)]"
          : "border-b border-transparent bg-surface/60"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-6 px-4 sm:px-6">
        {/* Logo (start side = right in RTL) */}
        <Link href="/" className="flex h-11 shrink-0 items-center" aria-label="SkillUp, דף הבית">
          <BrandLogo className="h-11 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/search" className={linkClass("/search")}>
            מציאת מורה
          </Link>

          <div className="relative flex h-16 items-center" ref={subjectsRef}>
            <button
              type="button"
              onClick={() => setSubjectsOpen((v) => !v)}
              aria-expanded={subjectsOpen}
              aria-haspopup="menu"
              className="inline-flex h-16 cursor-pointer items-center gap-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              מקצועות
              <ChevronDown strokeWidth={1.75}
                size={16}
                className={`transition-transform ${subjectsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {subjectsOpen && (
              <div
                role="menu"
                className="absolute top-full start-0 z-50 mt-1 grid w-[420px] grid-cols-2 gap-1 rounded-[var(--r-md)] border border-line bg-surface p-3 shadow-[var(--shadow-lift)]"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    role="menuitem"
                    href={`/categories/${categorySlug(cat)}`}
                    className="flex items-center gap-2.5 rounded-[var(--r-sm)] px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-action-soft"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--r-sm)] bg-canvas text-ink">
                      <CategoryIcon iconName={cat.icon_name} size={16} />
                    </span>
                    {cat.name_he}
                  </Link>
                ))}
                <Link
                  role="menuitem"
                  href="/search"
                  className="col-span-2 mt-1 rounded-[var(--r-sm)] border-t border-line px-3 pt-3 pb-1.5 text-sm font-semibold text-action hover:underline"
                >
                  לכל המקצועות והמורים ←
                </Link>
              </div>
            )}
          </div>

          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && profile ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="תפריט חשבון"
                className="flex cursor-pointer items-center gap-2 rounded-pill border border-line p-1 pe-2 transition-colors hover:border-ink"
              >
                <Avatar src={profile.avatarUrl} name={profile.displayName} size={30} />
                <ChevronDown strokeWidth={1.75} size={16} className="text-ink-3" />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute top-full end-0 z-50 mt-2 w-64 rounded-[var(--r-md)] border border-line bg-surface p-2 shadow-[var(--shadow-lift)]"
                >
                  <div className="border-b border-line px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {profile.displayName}
                    </p>
                    <p className="text-sm text-ink-3">
                      {profile.role === "teacher" ? "חשבון מורה" : "חשבון לומדים"}
                    </p>
                  </div>
                  {[
                    { href: "/account", label: "הפרופיל שלי", icon: UserRound },
                    ...(profile.role === "teacher"
                      ? [{ href: "/account/schedule", label: "ניהול זמינות", icon: Calendar }]
                      : []),
                    { href: "/messages", label: "הודעות", icon: MessageCircle },
                    { href: "/bookings", label: "השיעורים שלי", icon: Calendar },
                    // Saved tutors is a student feature only
                    ...(profile.role === "student"
                      ? [{ href: "/saved", label: "מורים ששמרתי", icon: Heart }]
                      : []),
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      role="menuitem"
                      href={href}
                      className="flex items-center gap-2.5 rounded-[var(--r-sm)] px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-action-soft"
                    >
                      <Icon size={16} strokeWidth={1.75} className="text-ink-3" />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut()}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--r-sm)] px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-action-soft"
                  >
                    <LogOut strokeWidth={1.75} size={16} className="text-ink-3" />
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hit-44 hidden text-sm font-medium text-ink-2 transition-colors hover:text-ink sm:block"
              >
                התחברות
              </Link>
              <Link
                href="/signup"
                className="hit-44 inline-flex h-11 items-center rounded-pill bg-action px-5 text-sm font-bold text-on-action shadow-[0_6px_16px_-8px_rgba(79,70,229,0.7)] transition-colors hover:bg-action-hover sm:px-6"
              >
                הרשמה
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={mobileOpen}
            aria-controls="market-mobile-menu"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-pill text-ink transition-colors hover:bg-action-soft md:hidden"
          >
            {mobileOpen ? <X strokeWidth={1.75} size={20} /> : <Menu strokeWidth={1.75} size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div id="market-mobile-menu" className="border-t border-line bg-surface md:hidden">
          <div className="max-h-[calc(100dvh-64px)] space-y-1 overflow-y-auto px-4 py-4">
            <Link
              href="/search"
              className={`block rounded-[var(--r-sm)] px-4 py-3 text-base font-medium text-ink hover:bg-action-soft ${
                pathname === "/search" ? "bg-action-soft" : ""
              }`}
            >
              מציאת מורה
            </Link>
            <p className="px-4 pt-3 pb-1 text-sm font-semibold text-ink-3">
              מקצועות
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${categorySlug(cat)}`}
                  className="flex items-center gap-2 rounded-[var(--r-sm)] px-4 py-2.5 text-sm font-medium text-ink hover:bg-action-soft"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--r-sm)] bg-canvas text-ink">
                    <CategoryIcon iconName={cat.icon_name} size={16} />
                  </span>
                  {cat.name_he}
                </Link>
              ))}
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-[var(--r-sm)] px-4 py-3 text-base font-medium text-ink hover:bg-action-soft ${
                  pathname === l.href ? "bg-action-soft" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-3 flex gap-2 border-t border-line px-4 pt-4">
                <Link
                  href="/login"
                  className="flex h-11 flex-1 items-center justify-center rounded-pill border border-line text-sm font-semibold text-ink"
                >
                  התחברות
                </Link>
                <Link
                  href="/signup"
                  className="flex h-11 flex-1 items-center justify-center rounded-pill bg-action text-sm font-bold text-on-action"
                >
                  הרשמה
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
