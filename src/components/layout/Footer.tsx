import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/constants";
import StoreButtons from "@/components/ui/StoreButtons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full shrink-0 border-t border-dark-200 bg-dark-50/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-dark-300 to-transparent" />

          {/* Logo */}
          <Link href="/" className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <img
              src="/images/SkillUpLoginLogo-Light.svg"
              alt={SITE_NAME}
              className="h-16 w-auto opacity-90 md:h-20"
            />
          </Link>

          {/* Store buttons */}
          <StoreButtons />

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <a
              href="/privacy"
              className="transition-colors hover:text-dark-900"
            >
              מדיניות פרטיות
            </a>
            <span className="text-dark-300">|</span>
            <a
              href="/terms"
              className="transition-colors hover:text-dark-900"
            >
              תנאי שימוש
            </a>
            <span className="text-dark-300">|</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-dark-900"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-dark-500">
            &copy; {currentYear} {SITE_NAME}. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
