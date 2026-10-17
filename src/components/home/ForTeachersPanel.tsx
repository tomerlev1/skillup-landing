import Link from "next/link";
import GuestOnly from "@/components/auth/GuestOnly";

// Light panel for teachers (spec §8.3.7) — soft action tint, never purple.
export default function ForTeachersPanel() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-14 sm:px-6 sm:pt-16">
      <div className="rounded-[var(--r-md)] bg-action-soft px-6 py-10 sm:px-12 sm:py-12">
        <div className="max-w-[620px]">
          <h2 className="font-ed text-[28px] font-bold leading-tight text-balance text-ink sm:text-[36px]">
            אתם מלמדים. אנחנו דואגים לכל השאר.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-2 sm:text-lg">
            פרופיל אחד באתר ובאפליקציה, יומן, צ׳אט עם תלמידים והתראות בזמן אמת.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <GuestOnly>
              <Link
                href="/signup?role=teacher"
                className="inline-flex h-12 items-center rounded-[var(--r-pill)] bg-ink px-6 text-base font-semibold text-surface transition-colors duration-200 ease-[var(--ease)] hover:bg-ink-2"
              >
                פתיחת פרופיל מורה
              </Link>
            </GuestOnly>
            <Link
              href="/for-tutors"
              className="inline-flex h-12 items-center rounded-[var(--r-pill)] border border-line bg-surface px-6 text-base font-semibold text-ink transition-colors duration-200 ease-[var(--ease)] hover:border-ink-3"
            >
              עוד למורים
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
