import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarClock, ChevronLeft, Heart, MessageCircle, Search } from "lucide-react";
import AccountForm from "@/components/account/AccountForm";
import AvatarUploader from "@/components/account/AvatarUploader";
import ProgressPanel from "@/components/account/ProgressPanel";
import { getSessionProfile } from "@/lib/data/session";
import { getCategories } from "@/lib/data/taxonomy";
import { createClient } from "@/lib/supabase/server";
import { availabilityTime, jerusalemDateShort, jerusalemWeekday } from "@/lib/availability-label";
import { computeProgress, profileCompleteness, type ProgressBooking } from "@/lib/progress";

export const metadata: Metadata = {
  title: "הפרופיל שלי | SkillUp",
  robots: { index: false },
};

const STUDENT_COLS =
  "first_name, last_name, phone, email, bio, city_id, avatar_url, level_category, level_proficiency, subjects_interests";
const TEACHER_COLS =
  "display_name, phone_number, email, bio, hourly_rate, experience_years, city_id, instagram_url, facebook_url, website_url, profile_completed, avatar_url";

type Row = Record<string, string | number | boolean | null | string[]>;

function Ring({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--c-line)" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="url(#ring)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
      />
      <defs>
        <linearGradient id="ring" x1="0" x2="1">
          <stop offset="0%" stopColor="#7C6CF6" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default async function AccountPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/account");

  const supabase = await createClient();
  const isTeacher = profile.role === "teacher";

  const rowQuery: PromiseLike<{ data: unknown }> = isTeacher
    ? supabase.from("teachers").select(TEACHER_COLS).eq("id", profile.userId).maybeSingle()
    : supabase.from("students").select(STUDENT_COLS).eq("id", profile.userId).maybeSingle();

  const [{ data: rowData }, { data: bookingData }, categories] = await Promise.all([
    rowQuery,
    supabase
      .from("bookings")
      .select("start_at, end_at, status, teacher_id, student_id, subject_id")
      .eq(isTeacher ? "teacher_id" : "student_id", profile.userId)
      .order("start_at", { ascending: true })
      .limit(1000),
    isTeacher ? Promise.resolve([]) : getCategories(),
  ]);
  const row = (rowData ?? {}) as Row;
  const bookings = (bookingData ?? []) as ProgressBooking[];

  let cityName: string | null = null;
  if (row.city_id) {
    const { data: city } = await supabase.from("cities").select("name_he").eq("id", row.city_id).maybeSingle();
    cityName = city?.name_he ?? null;
  }

  const now = new Date();
  const progress = computeProgress(bookings, profile.role, now);

  // Next upcoming lesson with the peer's name and subject.
  const nextBooking = bookings.find(
    (b) => ["pending", "confirmed", "awaiting_payment"].includes(b.status) && new Date(b.start_at) > now,
  );
  let nextLesson: { when: string; peerName: string; subject: string | null } | null = null;
  if (nextBooking) {
    const peerId = isTeacher ? nextBooking.student_id : nextBooking.teacher_id;
    const [peerRes, subjectRes] = await Promise.all([
      isTeacher
        ? supabase.from("students").select("first_name, last_name").eq("id", peerId).maybeSingle()
        : supabase.from("teachers_public").select("display_name").eq("id", peerId).maybeSingle(),
      nextBooking.subject_id
        ? supabase.from("subjects").select("name_he").eq("id", nextBooking.subject_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const p = (peerRes.data ?? {}) as Record<string, string | null>;
    nextLesson = {
      when: `יום ${jerusalemWeekday(nextBooking.start_at)}, ${jerusalemDateShort(nextBooking.start_at)} · ${availabilityTime(nextBooking.start_at)}`,
      peerName: p.display_name ?? ([p.first_name, p.last_name].filter(Boolean).join(" ") || "המורה"),
      subject: (subjectRes.data as { name_he?: string } | null)?.name_he ?? null,
    };
  }

  const name = isTeacher
    ? ((row.display_name as string) ?? profile.displayName)
    : [row.first_name, row.last_name].filter(Boolean).join(" ") || profile.displayName;

  const completeness = profileCompleteness(
    isTeacher
      ? [
          { label: "תמונת פרופיל", done: Boolean(row.avatar_url) },
          { label: "שם תצוגה", done: Boolean(row.display_name) },
          { label: "על עצמי", done: Boolean(row.bio) },
          { label: "מחיר לשעה", done: Boolean(row.hourly_rate) },
          { label: "עיר", done: Boolean(row.city_id) },
          { label: "טלפון", done: Boolean(row.phone_number) },
        ]
      : [
          { label: "תמונת פרופיל", done: Boolean(row.avatar_url) },
          { label: "שם מלא", done: Boolean(row.first_name && row.last_name) },
          { label: "טלפון", done: Boolean(row.phone) },
          { label: "קצת עליי", done: Boolean(row.bio) },
          { label: "עיר", done: Boolean(row.city_id) },
          { label: "שלב לימודים", done: Boolean(row.level_category) },
        ],
  );

  const links = [
    { href: "/bookings", label: "השיעורים שלי", icon: CalendarDays, tone: "bg-tint-indigo text-tint-indigo-fg" },
    { href: "/messages", label: "הודעות", icon: MessageCircle, tone: "bg-tint-sky text-tint-sky-fg" },
    ...(isTeacher
      ? [{ href: "/account/schedule", label: "ניהול זמינות", icon: CalendarClock, tone: "bg-tint-peach text-tint-peach-fg" }]
      : [
          { href: "/saved", label: "מורים ששמרתי", icon: Heart, tone: "bg-tint-rose text-tint-rose-fg" },
          { href: "/search", label: "מציאת מורה", icon: Search, tone: "bg-tint-mint text-tint-mint-fg" },
        ]),
  ];

  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[320px]" style={{ background: "var(--hero-wash)" }} />
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <h1 className="font-ed text-[30px] font-black leading-tight text-ink sm:text-[40px]">הפרופיל שלי</h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Identity card */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[var(--r-lg)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line/60">
              <AvatarUploader
                userId={profile.userId}
                table={isTeacher ? "teachers" : "students"}
                name={name}
                initialUrl={(row.avatar_url as string) ?? null}
              />
              <div className="mt-5 text-center">
                <p className="text-xl font-extrabold text-ink">{name}</p>
                <p className="mt-1 text-sm text-ink-3" dir="ltr">
                  {row.email as string}
                </p>
                <span className="mt-3 inline-flex rounded-pill bg-tint-indigo px-3 py-1 text-[13px] font-bold text-tint-indigo-fg">
                  {isTeacher ? "חשבון מורה" : "חשבון לומדים"}
                </span>
              </div>

              {/* Completeness */}
              <div className="mt-6 flex items-center gap-4 rounded-[var(--r-md)] bg-canvas p-4 ring-1 ring-line/50">
                <div className="relative grid place-items-center">
                  <Ring percent={completeness.percent} />
                  <span className="tnum absolute text-sm font-black text-ink">{completeness.percent}%</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    {completeness.percent === 100 ? "הפרופיל מושלם" : "השלמת הפרופיל"}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-3">
                    {completeness.missing.length
                      ? `חסר: ${completeness.missing.slice(0, 3).join(", ")}`
                      : isTeacher
                        ? "פרופיל מלא נראה טוב יותר בחיפוש."
                        : "המורים יכירו אתכם טוב יותר."}
                  </p>
                </div>
              </div>
            </div>

            <nav aria-label="קיצורי דרך" className="rounded-[var(--r-lg)] bg-surface p-2 shadow-[var(--shadow-card)] ring-1 ring-line/60">
              {links.map(({ href, label, icon: Icon, tone }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-[var(--r-md)] p-2.5 transition-colors hover:bg-canvas"
                >
                  <span className={`grid size-9 place-items-center rounded-[var(--r-sm)] ${tone}`}>
                    <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-[15px] font-bold text-ink">{label}</span>
                  <ChevronLeft
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="text-ink-3 transition-transform group-hover:-translate-x-0.5"
                  />
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-6">
            <ProgressPanel progress={progress} role={profile.role} nextLesson={nextLesson} />
            <Suspense>
              <AccountForm
                role={profile.role}
                userId={profile.userId}
                initial={row}
                initialCityName={cityName}
                interestOptions={categories.map((c) => c.name_he)}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
