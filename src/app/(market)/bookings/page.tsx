import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CalendarX2, MapPin, MessageCircle, Video } from "lucide-react";
import AccountHeader from "@/components/page/AccountHeader";
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

const WARN = "bg-warn/10 text-warn-text";
const OK = "bg-ok/10 text-ok-text";
const DANGER = "bg-danger/10 text-danger-text";
const NEUTRAL = "bg-canvas text-ink-3";

const DAY_NUM = new Intl.DateTimeFormat("he-IL", { day: "numeric", timeZone: "Asia/Jerusalem" });
const MONTH = new Intl.DateTimeFormat("he-IL", { month: "short", timeZone: "Asia/Jerusalem" });

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

  function BookingCard({ booking, highlight = false }: { booking: BookingRow; highlight?: boolean }) {
    const peerId = profile!.role === "teacher" ? booking.student_id : booking.teacher_id;
    const peer = peerMap.get(peerId);
    const status = STATUS_LABELS[booking.status] ?? {
      label: booking.status,
      tone: NEUTRAL,
    };
    const revealed =
      booking.mode === "teacher_location" ? addressMap.get(booking.teacher_id) : null;

    return (
      <article className="flex gap-4 rounded-[var(--r-lg)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-shadow hover:shadow-[var(--shadow-lift)] sm:gap-5 sm:p-5">
        {/* Calendar date tile */}
        <div
          className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-[var(--r-md)] py-2 sm:w-[76px] ${
            highlight ? "bg-[linear-gradient(160deg,#6457F0,#4F46E5)] text-white shadow-[0_10px_22px_-12px_rgba(79,70,229,0.9)]" : "bg-tint-indigo text-tint-indigo-fg"
          }`}
        >
          <span className="text-[12px] font-bold opacity-85">{formatWeekday(booking.start_at)}</span>
          <span className="tnum text-[28px] font-black leading-none">{DAY_NUM.format(new Date(booking.start_at))}</span>
          <span className="text-[12px] font-bold opacity-85">{MONTH.format(new Date(booking.start_at))}</span>
        </div>
        <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={peer?.avatar} name={peer?.name ?? ""} size={40} />
            <div className="min-w-0">
              {profile!.role === "student" ? (
                <Link
                  href={`/tutors/${booking.teacher_id}`}
                  className="block truncate text-base font-extrabold text-ink hover:underline"
                >
                  {peer?.name ?? "מורה"}
                </Link>
              ) : (
                <p className="truncate text-base font-extrabold text-ink">
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
            className={`shrink-0 rounded-[var(--r-pill)] px-3 py-1 text-[13px] font-bold ${status.tone}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-3 text-sm">
          <p className="font-semibold text-ink">
            {formatDateFull(booking.start_at)}
            {" · "}
            <span className="tnum">
              {formatTime(booking.start_at)}–{formatTime(booking.end_at)}
            </span>
          </p>
          {booking.total_price != null && (
            <p className="ltr-isolate tnum text-base font-extrabold text-brand-800">
              {formatPrice(booking.total_price)}
            </p>
          )}
        </div>

        {booking.status === "confirmed" && booking.mode === "online" && booking.meeting_url && (
          <a
            href={booking.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-pill bg-action px-4 text-sm font-bold text-on-action shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] hover:bg-action-hover"
          >
            <Video strokeWidth={2} size={16} />
            הצטרפות לשיעור אונליין
          </a>
        )}
        {revealed && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink">
            <MapPin strokeWidth={1.75} size={16} className="shrink-0 text-ink-3" />
            {revealed}
          </p>
        )}
        {booking.mode === "student_location" && booking.location && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink">
            <MapPin strokeWidth={1.75} size={16} className="shrink-0 text-ink-3" />
            {booking.location}
          </p>
        )}
        {!["cancelled", "refunded"].includes(booking.status) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={profile!.role === "student" ? `/messages/new?teacher=${booking.teacher_id}` : "/messages"}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-tint-indigo px-3.5 text-[13px] font-bold text-tint-indigo-fg transition-colors hover:bg-brand-100"
            >
              <MessageCircle strokeWidth={2} size={15} />
              הודעה
            </Link>
          </div>
        )}
        </div>
      </article>
    );
  }

  return (
    <>
      <AccountHeader
        icon={CalendarDays}
        title="השיעורים שלי"
        subtitle={
          bookings.length
            ? `${upcoming.length} קרובים · ${past.filter((b) => b.status === "completed").length} הושלמו`
            : "כל השיעורים שלכם במקום אחד"
        }
      />
    <div className="relative mx-auto max-w-[960px] px-4 pb-16 sm:px-6">

      {bookings.length === 0 ? (
        <div className="mt-4 rounded-[var(--r-lg)] bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <span className="mx-auto grid size-16 place-items-center rounded-[var(--r-lg)] bg-tint-indigo text-tint-indigo-fg"><CalendarX2 strokeWidth={2} size={30} /></span>
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
                className="mt-6 inline-flex h-11 items-center rounded-[var(--r-pill)] bg-action px-6 text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-colors hover:bg-action-hover"
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
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
                <span className="size-2.5 rounded-full bg-ok" aria-hidden="true" />
                שיעורים קרובים
              </h2>
              <div className="space-y-3">
                {upcoming.map((b, i) => (
                  <BookingCard key={b.id} booking={b} highlight={i === 0} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section aria-label="שיעורים קודמים">
              <h2 className="mb-4 text-lg font-extrabold text-ink">
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
    </>
  );
}
