"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MenuIcon, CloseIcon } from "@/components/icons/CustomIcons";
import { NAV_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";

const SECTION_IDS = NAV_LINKS.filter((l) => l.href.startsWith("#")).map(
  (l) => l.href.slice(1)
);

export default function Navbar() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolledPastThreshold, setScrolledPastThreshold] = useState(false);
  const [scrollActiveSection, setScrollActiveSection] = useState("");

  // Non-homepage routes (privacy, terms) keep a solid navbar always.
  const scrolled = !isHomepage || scrolledPastThreshold;
  const activeSection = scrollActiveSection;

  const updateScrollActiveSection = useCallback(() => {
    const offset = 100;
    let current = "";
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    }
    setScrollActiveSection(current);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolledPastThreshold(window.scrollY > 60);
      updateScrollActiveSection();
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateScrollActiveSection]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleNavClick() {
    // Native anchor jump — smooth-scroll is handled by html { scroll-behavior: smooth }.
    setMobileOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "border-b border-dark-200 bg-white/80 backdrop-blur-xl"
          : "border-b border-transparent bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-16">
        {/* Logo + beta pill */}
        <div className="flex items-center gap-2.5">
          <a
            href={isHomepage ? "#hero" : "/"}
            onClick={handleNavClick}
            className="flex items-center shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <img
              src="/images/SkillUpLoginLogo-Light.svg"
              alt="SkillUp. אפליקציית מורים פרטיים"
              className="h-14 w-auto drop-shadow-[0_1px_2px_rgba(106,13,145,0.15)] md:h-16"
            />
          </a>
          <span
            aria-label="Beta Version"
            className="hidden items-center rounded-full border border-accent-200 bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-600 sm:inline-flex"
            dir="ltr"
          >
            Beta Version
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href.startsWith("#") &&
              activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-600"
                    : "text-dark-600 hover:text-dark-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="block mx-auto mt-1 h-[3px] w-5 rounded-full bg-brand-500" />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            variant="primary"
            size="small"
            href="#download"
            arrow
            onClick={handleNavClick}
          >
            הורידו עכשיו
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-dark-700 transition-colors hover:bg-dark-100 md:hidden"
          aria-label={mobileOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-dark-200 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href.startsWith("#") &&
                  activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                    className={`rounded-lg px-4 py-3 text-base transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-dark-700 hover:bg-dark-100 hover:text-dark-900"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="mt-3 border-t border-dark-200 pt-4">
                <Button
                  variant="primary"
                  size="default"
                  href="#download"
                  arrow
                  className="w-full justify-center"
                  onClick={handleNavClick}
                >
                  הורידו עכשיו
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
