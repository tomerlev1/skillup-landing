import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BadgeCheck,
  CalendarCheck,
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
import TeacherRail from "@/components/market/TeacherRail";
import Chip from "@/components/ui/Chip";
import RatingStars from "@/components/ui/RatingStars";
import { getUpcomingSlots } from "@/lib/data/availability";
import { getTeacherReviews } from "@/lib/data/reviews";
import {
  getTeacherProfile,
  getTeacherStats,
  getTeacherSubjects,
  searchTeachers,
} from "@/lib/data/teachers";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/constants";
import {
  formatDateShort,
  formatTime,
  formatWeekday,
  lessonModeLabel,
} from "@/lib/format";
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

  // Availability preview: group the next open slots by day (up to 4 days).
  const slotsByDay = new Map<string, typeof slots>();
  for (const slot of slots) {
    const day = slot.start_at.slice(0, 10);
    if (!slotsByDay.has(day) && slotsByDay.size >= 4) continue;
    slotsByDay.set(day, [...(slotsByDay.get(day) ?? []), slot]);
  }

  const lessonModes = (teacher.lesson_modes ?? []) as LessonMode[];
  // Face photo for identity; cover/background only as the page header banner.
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
      <nav aria-label="פירורי לחם" className="mb-6 flex items-center gap-1.5 text-[13px] text-[var(--mk-ink-3)]">
        <Link href="/" className="hover:text-[var(--mk-ink)] hover:underline">ראשי</Link>
        <ChevronLeft size={13} aria-hidden="true" />
        {subjects[0] ? (
          <Link
            href={searchHref({ subjectIds: [subjects[0].id] })}
            className="hover:text-[var(--mk-ink)] hover:underline"
          >
            מורים ל{subjects[0].name_he}
          </Link>
        ) : (
          <Link href="/search" className="hover:text-[var(--mk-ink)] hover:underline">
            מורים
          </Link>
        )}
        <ChevronLeft size={13} aria-hidden="true" />
        <span className="text-[var(--mk-ink)]">{teacher.display_name}</span>
      </nav>

      {/* Cover banner (background image belongs here, not on cards) */}
      {coverImage && (
        <div className="relative mb-8 h-40 w-full overflow-hidden rounded-3xl bg-paper-50 sm:h-56">
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
        <div className="min-w-0 space-y-12">
          {/* Identity header */}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl bg-paper-50 sm:h-40 sm:w-40">
              {avatarImage ? (
                <Image
                  src={avatarImage}
                  alt={teacher.display_name}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-brand-50 font-display text-6xl font-bold text-brand-300">
                  {teacher.display_name.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-extrabold text-[var(--mk-ink)] sm:text-3xl">
                  {teacher.display_name}
                </h1>
                <div className="flex shrink-0 items-center gap-2">
                  <ShareButton teacherName={teacher.display_name} />
                  <SaveButton teacherId={id} teacherName={teacher.display_name} />
                </div>
              </div>

              {teacher.is_verified && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--mk-ink)]">
                  <BadgeCheck size={16} className="text-emerald-600" />
                  מורה מאומת על ידי SkillUp
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--mk-ink-2)]">
                <RatingStars value={stats.avg} count={stats.count} size="md" />
                {cityName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    {cityName}
                  </span>
                )}
                {lessonModes.length > 0 && (
                  <span>{lessonModes.map(lessonModeLabel).join(" · ")}</span>
                )}
              </div>

              {/* Stat strip */}
              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {teacher.experience_years != null && teacher.experience_years > 0 && (
                  <div>
                    <dt className="text-xs text-[var(--mk-ink-3)]">ניסיון</dt>
                    <dd className="tnum mt-0.5 text-base font-semibold text-[var(--mk-ink)]">
                      {teacher.experience_years} שנים
                    </dd>
                  </div>
                )}
                {teacher.total_students != null && teacher.total_students > 0 && (
                  <div>
                    <dt className="text-xs text-[var(--mk-ink-3)]">תלמידים</dt>
                    <dd className="tnum mt-0.5 flex items-center gap-1 text-base font-semibold text-[var(--mk-ink)]">
                      <Users size={14} />
                      {teacher.total_students}+
                    </dd>
                  </div>
                )}
                {stats.count > 0 && (
                  <div>
                    <dt className="text-xs text-[var(--mk-ink-3)]">ביקורות</dt>
                    <dd className="tnum mt-0.5 text-base font-semibold text-[var(--mk-ink)]">
                      {stats.count}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </header>

          {/* Subjects — each with its own experience-years pill when known */}
          {subjects.length > 0 && (
            <section aria-label="מקצועות">
              <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">
                מקצועות לימוד
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={searchHref({ subjectIds: [s.id] })}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--mk-hairline)] bg-white py-1.5 ps-3.5 pe-2.5 text-sm font-medium text-[var(--mk-ink)] transition-colors hover:border-[var(--mk-ink)]"
                  >
                    {s.name_he}
                    {s.experience_years != null && s.experience_years > 0 && (
                      <span className="tnum rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        {s.experience_years} שנ׳ ניסיון
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Video intro — high placement, highest-converting element */}
          {teacher.video_url && (
            <section aria-label="סרטון היכרות">
              <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">
                סרטון היכרות
              </h2>
              <video
                controls
                preload="metadata"
                className="mt-4 aspect-video w-full rounded-2xl bg-ink-900 object-cover"
                src={teacher.video_url}
              />
            </section>
          )}

          {/* Bio */}
          {teacher.bio && (
            <section aria-label="על המורה">
              <h2 className="font-display text-xl font-bold text-[var(--mk-ink)]">
                על {teacher.display_name}
              </h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.7] text-[var(--mk-ink)]">
                {teacher.bio}
              </p>
            </section>
          )}

          {/* Credentials — subheadings + subtly tinted icons */}
          {((teacher.education?.length ?? 0) > 0 ||
            (teacher.languages?.length ?? 0) > 0 ||
            (teacher.experience_years ?? 0) > 0) && (
            <section
              aria-label="השכלה ורקע"
              className="rounded-3xl border border-[var(--mk-hairline)] bg-white p-6 sm:p-7"
            >
              <h2 className="font-display text-lg font-bold text-[var(--mk-ink)]">
                השכלה ורקע
              </h2>

              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {(teacher.education?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-brand-600">
                        <GraduationCap size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-[var(--mk-ink)]">השכלה</h3>
                    </div>
                    <ul className="mt-3 space-y-1.5 ps-1">
                      {teacher.education!.map((item) => (
                        <li key={item} className="text-sm leading-relaxed text-[var(--mk-ink-2)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(teacher.languages?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Languages size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-[var(--mk-ink)]">שפות הוראה</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm text-[var(--mk-ink-2)]">
                      {teacher.languages!.join(" · ")}
                    </p>
                  </div>
                )}

                {(teacher.experience_years ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                        <Award size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-[var(--mk-ink)]">ניסיון</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm text-[var(--mk-ink-2)]">
                      <span className="tnum font-semibold text-[var(--mk-ink)]">
                        {teacher.experience_years}
                      </span>{" "}
                      שנות הוראה
                    </p>
                  </div>
                )}

                {teacher.teaching_style && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500">
                        <Sparkles size={17} />
                      </span>
                      <h3 className="text-sm font-semibold text-[var(--mk-ink)]">סגנון הוראה</h3>
                    </div>
                    <p className="mt-3 ps-1 text-sm leading-relaxed text-[var(--mk-ink-2)]">
                      {teacher.teaching_style}
                    </p>
                  </div>
                )}
              </div>

              {/* Social links are intentionally public (teachers_public projects them) */}
              {(teacher.instagram_url || teacher.facebook_url || teacher.website_url) && (
                <div className="mk-hairline-t mt-6 flex flex-wrap items-center gap-2 pt-5">
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
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--mk-hairline)] px-3 text-[13px] font-medium text-[var(--mk-ink-2)] transition-colors hover:border-[var(--mk-ink)] hover:text-[var(--mk-ink)]"
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        {s.label}
                      </a>
                    ))}
                </div>
              )}
            </section>
          )}

          {/* Availability preview */}
          {slotsByDay.size > 0 && (
            <section aria-label="זמינות קרובה">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--mk-ink)]">
                <CalendarCheck size={20} />
                זמינות קרובה
              </h2>
              <div className="mt-4 space-y-3">
                {[...slotsByDay.entries()].map(([day, daySlots]) => (
                  <div key={day} className="flex flex-wrap items-center gap-2">
                    <span className="w-28 shrink-0 text-sm font-medium text-[var(--mk-ink)]">
                      {formatWeekday(daySlots[0].start_at)},{" "}
                      {formatDateShort(daySlots[0].start_at)}
                    </span>
                    {daySlots.slice(0, 5).map((slot) => (
                      <span
                        key={slot.id}
                        className="tnum rounded-full border border-[var(--mk-hairline)] bg-white px-3 py-1 text-[13px] text-[var(--mk-ink)]"
                      >
                        {formatTime(slot.start_at)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--mk-ink-3)]">
                המועדים מתעדכנים לפי היומן של המורה. בחירת מועד נעשית בעת
                קביעת השיעור.
              </p>
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
            moreHref={
              primaryCategoryId ? searchHref({ categoryId: primaryCategoryId }) : "/search"
            }
          />
        </div>
      )}
    </div>
  );
}
