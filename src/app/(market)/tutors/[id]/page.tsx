import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  ChevronLeft,
  ExternalLink,
  GraduationCap,
  Languages,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import RecordView from "@/components/market/RecordView";
import ReviewsSection from "@/components/market/ReviewsSection";
import SaveButton from "@/components/market/SaveButton";
import ShareButton from "@/components/market/ShareButton";
import StickyBookingRail from "@/components/market/StickyBookingRail";
import AvailabilityPreview from "@/components/market/AvailabilityPreview";
import TeacherRail from "@/components/market/TeacherRail";
import Avatar from "@/components/ui/Avatar";
import VerifiedMark from "@/components/ui/VerifiedMark";
import RatingStars from "@/components/ui/RatingStars";
import { getNextSlots, getUpcomingSlots } from "@/lib/data/availability";
import { getTeacherReviews } from "@/lib/data/reviews";
import {
  getTeacherProfile,
  getTeacherStats,
  getTeacherSubjects,
  searchTeachers,
} from "@/lib/data/teachers";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/constants";
import { lessonModeLabel } from "@/lib/format";
import { searchHref } from "@/lib/search-params";
import type { LessonMode } from "@/lib/types";

export const revalidate = 900; // profile freshness: 15 min ISR

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCityName(cityId: string | null): Promise<string | null> {
  if (!cityId) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("cities")
    .select("name_he")
    .eq("id", cityId)
    .maybeSingle();
  return data?.name_he ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const teacher = await getTeacherProfile(id);
  if (!teacher) return { title: "מורה לא נמצא | SkillUp" };

  const [subjects, cityName] = await Promise.all([
    getTeacherSubjects(id),
    getCityName(teacher.city_id),
  ]);
  const subjectNames = subjects.slice(0, 3).map((s) => s.name_he);
  const title = `${teacher.display_name} | מורה ל${subjectNames[0] ?? "שיעורים פרטיים"}${cityName ? ` ב${cityName}` : ""} | SkillUp`;

  return {
    title,
    description:
      teacher.bio?.slice(0, 155) ??
      `שיעורים פרטיים עם ${teacher.display_name}: פרופיל, ביקורות של תלמידים, מחירים וזמינות ב-SkillUp.`,
    alternates: { canonical: `/tutors/${id}` },
    openGraph: {
      title,
      description: teacher.bio?.slice(0, 155) ?? undefined,
      images: teacher.avatar_url ? [teacher.avatar_url] : undefined,
    },
  };
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const teacher = await getTeacherProfile(id);
  if (!teacher || !teacher.profile_completed) notFound();

  const [subjects, stats, reviews, slots, cityName] = await Promise.all([
    getTeacherSubjects(id),
    getTeacherStats(id),
    getTeacherReviews(id, 8),
    getUpcomingSlots(id, 24),
    getCityName(teacher.city_id),
  ]);

  // Similar tutors: same primary category, excluding this teacher.
  const primaryCategoryId = subjects[0]?.category_id;
  const similar = primaryCategoryId
    ? (
        await searchTeachers({ categoryId: primaryCategoryId, limit: 6 })
      ).items.filter((t) => t.id !== id)
    : [];

  const similarNextSlots = await getNextSlots(similar.map((t) => t.id));

  const lessonModes = (teacher.lesson_modes ?? []) as LessonMode[];
  // Face photo for identity; cover/background only as the desktop header banner.
  const avatarImage = teacher.avatar_url;
  const coverImage = teacher.background_url ?? teacher.card_image_url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.display_name,
    jobTitle: `מורה פרטי ל${subjects[0]?.name_he ?? "שיעורים פרטיים"}`,
    description: teacher.bio ?? undefined,
    image: teacher.avatar_url ?? undefined,
    url: `${SITE_URL}/tutors/${id}`,
    address: cityName
      ? { "@type": "PostalAddress", addressLocality: cityName, addressCountry: "IL" }
      : undefined,
    ...(stats.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(stats.avg.toFixed(1)),
            reviewCount: stats.count,
            bestRating: 5,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "מורים", item: `${SITE_URL}/search` },
      {
        "@type": "ListItem",
        position: 3,
        name: teacher.display_name,
        item: `${SITE_URL}/tutors/${id}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-28 pt-8 sm:px-6 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <RecordView
        teacher={{
          id,
          display_name: teacher.display_name,
          image: avatarImage,
          subject: subjects[0]?.name_he ?? null,
          city_name: cityName,
          hourly_rate: teacher.hourly_rate,
          rating_avg: stats.avg,
          review_count: stats.count,
        }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="פירורי לחם" className="mb-4 flex items-center gap-1.5 text-sm text-ink-3 md:mb-6">
        <Link href="/" className="hover:text-ink hover:underline">ראשי</Link>
        <ChevronLeft size={13} aria-hidden="true" />
        {subjects[0] ? (
          <Link
            href={searchHref({ subjectIds: [subjects[0].id] })}
            className="hover:text-ink hover:underline"
          >
            מורים ל{subjects[0].name_he}
          </Link>
        ) : (
          <Link href="/search" className="hover:text-ink hover:underline">
            מורים
          </Link>
        )}
        <ChevronLeft size={13} aria-hidden="true" />
        <span className="text-ink">{teacher.display_name}</span>
      </nav>

      {/* Cover banner: md and up only (spec §8.5) */}
      {coverImage && (
        <div className="relative mb-8 hidden h-40 w-full overflow-hidden rounded-[var(--r-md)] bg-action-soft md:block">
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 1120px) 100vw, 1120px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ===== Content column ===== */}
        <div className="min-w-0 space-y-10 md:space-y-12">
          {/* Identity header */}
          <header className="flex items-start gap-4 md:gap-6">
            <Avatar src={avatarImage} name={teacher.display_name} size={72} className="shrink-0 md:hidden" />
            <Avatar src={avatarImage} name={teacher.display_name} size={112} className="hidden shrink-0 md:inline-flex" />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-ed text-2xl font-black leading-tight text-ink sm:text-3xl">
                  {teacher.display_name}
                  {teacher.is_verified && (
                    <VerifiedMark size={18} className="ms-2 align-[-1px]" />
                  )}
                </h1>
                <div className="flex shrink-0 items-center gap-2">
                  <ShareButton teacherName={teacher.display_name} />
                  <SaveButton teacherId={id} teacherName={teacher.display_name} variant="plain" />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-2">
                <RatingStars value={stats.avg} count={stats.count} size="md" />
                {cityName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} aria-hidden="true" />
                    {cityName}
                  </span>
                )}
                {lessonModes.length > 0 && (
                  <span>{lessonModes.map(lessonModeLabel).join(" · ")}</span>
                )}
              </div>

              {/* Stat strip */}
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                {teacher.experience_years != null && teacher.experience_years > 0 && (
                  <div>
                    <dt className="text-sm text-ink-3">ניסיון</dt>
                    <dd className="tnum mt-0.5 text-base font-semibold text-ink">
                      {teacher.experience_years} שנים
                    </dd>
                  </div>
                )}
                {teacher.total_students != null && teacher.total_students > 0 && (
                  <div>
                    <dt className="text-sm text-ink-3">תלמידים</dt>
                    <dd className="tnum mt-0.5 flex items-center gap-1 text-base font-semibold text-ink">
                      <Users size={14} aria-hidden="true" />
                      {teacher.total_students}+
                    </dd>
                  </div>
                )}
                {stats.count > 0 && (
                  <div>
                    <dt className="text-sm text-ink-3">ביקורות</dt>
                    <dd className="tnum mt-0.5 text-base font-semibold text-ink">
                      {stats.count}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </header>

          <AvailabilityPreview teacherId={id} slots={slots} />

          {/* Video intro */}
          {teacher.video_url && (
            <section aria-label="סרטון היכרות">
              <h2 className="font-ed text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
                סרטון היכרות
              </h2>
              <video
                controls
                preload="metadata"
                className="mt-4 aspect-video w-full rounded-[var(--r-md)] bg-ink object-cover"
                src={teacher.video_url}
              />
            </section>
          )}

          {/* Bio */}
          {teacher.bio && (
            <section aria-label="על המורה">
              <h2 className="font-ed text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
                על {teacher.display_name}
              </h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.7] text-ink">
                {teacher.bio}
              </p>
            </section>
          )}

          {/* Subjects, each with its own experience-years pill when known */}
          {subjects.length > 0 && (
            <section aria-label="מקצועות">
              <h2 className="font-ed text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
                מקצועות לימוד
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={searchHref({ subjectIds: [s.id] })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-pill)] border border-line bg-surface py-1.5 ps-4 pe-3 text-sm font-medium text-ink transition-colors hover:border-ink"
                  >
                    {s.name_he}
                    {s.experience_years != null && s.experience_years > 0 && (
                      <span className="tnum rounded-[var(--r-pill)] bg-action-soft px-2 py-0.5 text-[11px] font-semibold text-action">
                        {s.experience_years} שנ׳ ניסיון
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Credentials — subheadings + subtly tinted icons */}
          {((teacher.education?.length ?? 0) > 0 ||
            (teacher.languages?.length ?? 0) > 0 ||
            (teacher.experience_years ?? 0) > 0) && (
            <section
              aria-label="השכלה ורקע"
              className="rounded-[var(--r-md)] border border-line bg-surface p-6 sm:p-7"
            >
              <h2 className="font-ed text-xl font-bold text-ink">
                השכלה ורקע
              </h2>

              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {(teacher.education?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[var(--r-sm)] bg-action-soft text-action">
                        <GraduationCap size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">השכלה</h3>
                    </div>
                    <ul className="mt-3 space-y-1.5 ps-1">
                      {teacher.education!.map((item) => (
                        <li key={item} className="text-sm leading-relaxed text-ink-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(teacher.languages?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[var(--r-sm)] bg-action-soft text-action">
                        <Languages size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">שפות הוראה</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm text-ink-2">
                      {teacher.languages!.join(" · ")}
                    </p>
                  </div>
                )}

                {(teacher.experience_years ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[var(--r-sm)] bg-action-soft text-action">
                        <Award size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">ניסיון</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm text-ink-2">
                      <span className="tnum font-semibold text-ink">
                        {teacher.experience_years}
                      </span>{" "}
                      שנות הוראה
                    </p>
                  </div>
                )}

                {teacher.teaching_style && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[var(--r-sm)] bg-action-soft text-action">
                        <Sparkles size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-ink">סגנון הוראה</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm leading-relaxed text-ink-2">
                      {teacher.teaching_style}
                    </p>
                  </div>
                )}
              </div>

              {/* Social links are intentionally public (teachers_public projects them) */}
              {(teacher.instagram_url || teacher.facebook_url || teacher.website_url) && (
                <div className="mt-6 border-t border-line flex flex-wrap items-center gap-2 pt-5">
                  {(
                    [
                      { href: teacher.instagram_url, label: "אינסטגרם" },
                      { href: teacher.facebook_url, label: "פייסבוק" },
                      { href: teacher.website_url, label: "אתר אישי" },
                    ] as const
                  )
                    .filter((s) => s.href)
                    .map((s) => (
                      <a
                        key={s.label}
                        href={s.href!}
                        rel="noopener noreferrer nofollow"
                        target="_blank"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        {s.label}
                      </a>
                    ))}
                </div>
              )}
            </section>
          )}

          <ReviewsSection stats={stats} reviews={reviews} />
        </div>

        {/* ===== Sticky booking rail (LEFT column in RTL) ===== */}
        <aside aria-label="הזמנת שיעור">
          <div className="sticky top-20">
            <StickyBookingRail
              teacherId={id}
              hourlyRate={teacher.hourly_rate}
              lessonModes={lessonModes}
              lessonModePrices={teacher.lesson_mode_prices}
              ratingAvg={stats.avg}
              reviewCount={stats.count}
            />
          </div>
        </aside>
      </div>

      {/* Similar tutors */}
      {similar.length > 0 && (
        <div className="mt-20">
          <TeacherRail
            title="מורים דומים שאולי יתאימו לכם"
            teachers={similar}
            nextSlots={similarNextSlots}
            minCount={3}
            moreHref={
              primaryCategoryId ? searchHref({ categoryId: primaryCategoryId }) : "/search"
            }
          />
        </div>
      )}
    </div>
  );
}
