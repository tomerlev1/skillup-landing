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
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/ui/Avatar";
import CategoryIcon from "@/components/market/CategoryIcon";
import { categorySlug } from "@/lib/slugs";
import type { Category } from "@/lib/types";

interface MarketNavProps {
  categories: Category[];
}

const NAV_LINKS = [
  { href: "/how-it-works", label: "איך זה עובד" },
  { href: "/for-tutors", label: "למורים" },
];

// Marketplace nav: 64px, white, hairline appears on scroll. One indigo
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
    `text-sm font-medium transition-colors ${
      pathname === href
        ? "text-[var(--mk-ink)]"
        : "text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)]"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-[box-shadow,border-color] ${
        scrolled ? "border-b border-[var(--mk-hairline)]" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-4 sm:px-6">
        {/* Logo (start side = right in RTL) */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="SkillUp — דף הבית">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/SkillUpLoginLogo-Light.svg"
            alt="SkillUp"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/search" className={linkClass("/search")}>
            מציאת מורה
          </Link>

          <div className="relative" ref={subjectsRef}>
            <button
              type="button"
              onClick={() => setSubjectsOpen((v) => !v)}
              aria-expanded={subjectsOpen}
              aria-haspopup="menu"
              className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[var(--mk-ink-2)] transition-colors hover:text-[var(--mk-ink)]"
            >
              מקצועות
              <ChevronDown
                size={14}
                className={`transition-transform ${subjectsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {subjectsOpen && (
              <div
                role="menu"
                className="mk-shadow absolute top-full start-0 z-50 mt-2 grid w-[420px] grid-cols-2 gap-1 rounded-2xl border border-[var(--mk-hairline)] bg-white p-3"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    role="menuitem"
                    href={`/categories/${categorySlug(cat)}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
                  >
                    <CategoryIcon
                      iconName={cat.icon_name}
                      size={17}
                      className="shrink-0 text-[var(--mk-ink-3)]"
                    />
                    {cat.name_he}
                  </Link>
                ))}
                <Link
                  role="menuitem"
                  href="/search"
                  className="col-span-2 mt-1 rounded-xl border-t border-[var(--mk-hairline)] px-3 pt-3 pb-1.5 text-sm font-semibold text-brand-700 hover:underline"
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
          {/* Compact search entry (all viewports; icon-only on mobile) */}
          <Link
            href="/search"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--mk-hairline)] bg-white px-3 text-sm text-[var(--mk-ink-2)] transition-colors hover:border-[var(--mk-ink)] sm:px-4"
            aria-label="חיפוש מורים"
          >
            <Search size={15} />
            <span className="hidden sm:inline">חיפוש מורה...</span>
          </Link>

          {user && profile ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="תפריט חשבון"
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--mk-hairline)] p-1 pe-2 transition-colors hover:border-[var(--mk-ink)]"
              >
                <Avatar src={profile.avatarUrl} name={profile.displayName} size={30} />
                <ChevronDown size={14} className="text-[var(--mk-ink-3)]" />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="mk-shadow absolute top-full end-0 z-50 mt-2 w-56 rounded-2xl border border-[var(--mk-hairline)] bg-white p-2"
                >
                  <div className="border-b border-[var(--mk-hairline)] px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-semibold text-[var(--mk-ink)]">
                      {profile.displayName}
                    </p>
                    <p className="text-xs text-[var(--mk-ink-3)]">
                      {profile.role === "teacher" ? "חשבון מורה" : "חשבון תלמיד/ה"}
                    </p>
                  </div>
                  {[
                    { href: "/messages", label: "הודעות", icon: MessageCircle },
                    { href: "/bookings", label: "השיעורים שלי", icon: Calendar },
                    { href: "/saved", label: "מורים ששמרתי", icon: Heart },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      role="menuitem"
                      href={href}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
                    >
                      <Icon size={16} className="text-[var(--mk-ink-3)]" />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut()}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--mk-ink)] transition-colors hover:bg-paper-25"
                  >
                    <LogOut size={16} className="text-[var(--mk-ink-3)]" />
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[var(--mk-ink-2)] transition-colors hover:text-[var(--mk-ink)] sm:block"
              >
                התחברות
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:px-5"
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
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-[var(--mk-ink)] transition-colors hover:bg-paper-25 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-[var(--mk-hairline)] bg-white md:hidden">
          <div className="max-h-[calc(100dvh-64px)] space-y-1 overflow-y-auto px-4 py-4">
            <Link
              href="/search"
              className="block rounded-xl px-4 py-3 text-base font-medium text-[var(--mk-ink)] hover:bg-paper-25"
            >
              מציאת מורה
            </Link>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--mk-ink-3)]">
              מקצועות
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${categorySlug(cat)}`}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--mk-ink)] hover:bg-paper-25"
                >
                  <CategoryIcon
                    iconName={cat.icon_name}
                    size={16}
                    className="shrink-0 text-[var(--mk-ink-3)]"
                  />
                  {cat.name_he}
                </Link>
              ))}
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-4 py-3 text-base font-medium text-[var(--mk-ink)] hover:bg-paper-25"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-3 flex gap-2 border-t border-[var(--mk-hairline)] px-4 pt-4">
                <Link
                  href="/login"
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--mk-hairline)] text-sm font-semibold text-[var(--mk-ink)]"
                >
                  התחברות
                </Link>
                <Link
                  href="/signup"
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
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
