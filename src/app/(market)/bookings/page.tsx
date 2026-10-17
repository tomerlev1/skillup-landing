import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarX2, MapPin, Video } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getSessionProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateFull,
  formatPrice,
  formatTime,
  formatWeekday,
  lessonModeLabel,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "השיעורים שלי | SkillUp",
  robots: { index: false },
};

const WARN = "bg-warn/10 text-warn";
const OK = "bg-ok/10 text-ok-text";
const DANGER = "bg-danger/10 text-danger";
const NEUTRAL = "bg-canvas text-ink-3";

// `awaiting_payment` is a legacy status that should not occur (SkillUp never
// charges students); it reads as waiting on the teacher. `refunded` reads as
// cancelled.
const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "ממתין לאישור המורה", tone: WARN },
  awaiting_payment: { label: "ממתין לתיאום עם המורה", tone: WARN },
  confirmed: { label: "מאושר", tone: OK },
  completed: { label: "הסתיים", tone: NEUTRAL },
  cancelled: { label: "בוטל", tone: DANGER },
  refunded: { label: "בוטל", tone: DANGER },
};

// booking.mode uses the enum keys (teacher_location/student_location).
const BOOKING_MODE_TO_LESSON: Record<string, string> = {
  online: "online",
  teacher_location: "teacher_home",
  student_location: "student_home",
};

interface BookingRow {
  id: string;
  teacher_id: string;
  student_id: string;
  subject_id: string | null;
  start_at: string;
  end_at: string;
  status: string;
  mode: string;
  total_price: number | null;
  meeting_url: string | null;
  location: string | null;
}

export default async function BookingsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/bookings");

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, teacher_id, student_id, subject_id, start_at, end_at, status, mode, total_price, meeting_url, location",
    )
    .order("start_at", { ascending: false })
    .limit(100);
  const bookings = (data ?? []) as BookingRow[];

  // Peer + subject name resolution in two batched reads.
  const peerIds = [
    ...new Set(
      bookings.map((b) => (profile.role === "teacher" ? b.student_id : b.teacher_id)),
    ),
  ];
  const subjectIds = [...new Set(bookings.map((b) => b.subject_id).filter(Boolean))];

  const [peersRes, subjectsRes] = await Promise.all([
    profile.role === "teacher"
      ? supabase.from("students").select("id, first_name, last_name, avatar_url").in("id", peerIds)
      : supabase.from("teachers_public").select("id, display_name, avatar_url").in("id", peerIds),
    subjectIds.length
      ? supabase.from("subjects").select("id, name_he").in("id", subjectIds as string[])
      : Promise.resolve({ data: [] }),
  ]);

  const peerMap = new Map<string, { name: string; avatar: string | null }>();
  for (const p of peersRes.data ?? []) {
    const row = p as Record<string, string | null>;
    peerMap.set(row.id as string, {
      name:
        (row.display_name as string) ??
        [row.first_name, row.last_name].filter(Boolean).join(" "),
      avatar: row.avatar_url,
    });
  }
  const subjectMap = new Map(
    ((subjectsRes.data ?? []) as { id: string; name_he: string }[]).map((s) => [
      s.id,
      s.name_he,
    ]),
  );

  // Address reveal is DB-gated: returns the street address only when the
  // caller has a confirmed/paid/completed booking with that teacher.
  const addressMap = new Map<string, string>();
  if (profile.role === "student") {
    const revealTeachers = [
      ...new Set(
        bookings
          .filter(
            (b) =>
              b.mode === "teacher_location" &&
              ["confirmed", "completed", "awaiting_payment"].includes(b.status),
          )
          .map((b) => b.teacher_id),
      ),
    ];
    await Promise.all(
      revealTeachers.map(async (teacherId) => {
        const { data: addr } = await supabase.rpc("get_teacher_booking_address", {
          p_teacher_id: teacherId,
        });
        const payload = addr as { full_address?: string; address?: string } | string | null;
        const text =
          typeof payload === "string"
            ? payload
            : (payload?.full_address ?? payload?.address);
        if (text) addressMap.set(teacherId, text);
      }),
    );
  }

  const now = Date.now();
  const upcoming = bookings
    .filter(
      (b) =>
        new Date(b.end_at).getTime() >= now &&
        !["cancelled", "refunded", "completed"].includes(b.status),
    )
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
  const past = bookings.filter((b) => !upcoming.includes(b));

  function BookingCard({ booking }: { booking: BookingRow }) {
    const peerId = profile!.role === "teacher" ? booking.student_id : booking.teacher_id;
    const peer = peerMap.get(peerId);
    const status = STATUS_LABELS[booking.status] ?? {
      label: booking.status,
      tone: NEUTRAL,
    };
    const revealed =
      booking.mode === "teacher_location" ? addressMap.get(booking.teacher_id) : null;

    return (
      <article className="rounded-[var(--r-md)] border border-line bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={peer?.avatar} name={peer?.name ?? ""} size={42} />
            <div className="min-w-0">
              {profile!.role === "student" ? (
                <Link
                  href={`/tutors/${booking.teacher_id}`}
                  className="block truncate text-[15px] font-semibold text-ink hover:underline"
                >
                  {peer?.name ?? "מורה"}
                </Link>
              ) : (
                <p className="truncate text-[15px] font-semibold text-ink">
                  {peer?.name ?? "לומד"}
                </p>
              )}
              <p className="truncate text-sm text-ink-3">
                {[
                  booking.subject_id ? subjectMap.get(booking.subject_id) : null,
                  lessonModeLabel(BOOKING_MODE_TO_LESSON[booking.mode] ?? booking.mode),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-[var(--r-pill)] px-3 py-1 text-sm font-semibold ${status.tone}`}
          >
            {status.label}
          </span>
        </div>

        <div className="border-t border-line mt-4 flex flex-wrap items-center justify-between gap-3 pt-3.5 text-sm">
          <p className="text-ink">
            {formatWeekday(booking.start_at)}, {formatDateFull(booking.start_at)}
            {" · "}
            <span className="tnum">
              {formatTime(booking.start_at)}–{formatTime(booking.end_at)}
            </span>
          </p>
          {booking.total_price != null && (
            <p className="ltr-isolate tnum font-semibold text-ink">
              {formatPrice(booking.total_price)}
            </p>
          )}
        </div>

        {booking.status === "confirmed" && booking.mode === "online" && booking.meeting_url && (
          <a
            href={booking.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-action hover:underline"
          >
            <Video size={15} />
            קישור לשיעור אונליין
          </a>
        )}
        {revealed && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink">
            <MapPin size={15} className="shrink-0 text-ink-3" />
            {revealed}
          </p>
        )}
        {booking.mode === "student_location" && booking.location && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink">
            <MapPin size={15} className="shrink-0 text-ink-3" />
            {booking.location}
          </p>
        )}
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">
        השיעורים שלי
      </h1>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-[var(--r-md)] bg-canvas px-6 py-16 text-center">
          <CalendarX2 size={36} className="mx-auto text-ink-3" />
          <h2 className="mt-4 text-lg font-semibold text-ink">
            עדיין אין שיעורים
          </h2>
          {profile.role === "student" && (
            <>
              <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-ink-2">
                השיעור הראשון שלכם קרוב מתמיד. מצאו מורה שמתאים לכם וקבעו מועד.
              </p>
              <Link
                href="/search"
                className="mt-6 inline-flex h-11 items-center rounded-[var(--r-pill)] bg-action px-6 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
              >
                למציאת מורה
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {upcoming.length > 0 && (
            <section aria-label="שיעורים קרובים">
              <h2 className="mb-4 text-base font-semibold text-ink">
                שיעורים קרובים
              </h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section aria-label="שיעורים קודמים">
              <h2 className="mb-4 text-base font-semibold text-ink">
                היסטוריה
              </h2>
              <div className="space-y-3">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
