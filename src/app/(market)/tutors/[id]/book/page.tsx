import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { getUpcomingSlots } from "@/lib/data/availability";
import { getTeacherProfile, getTeacherSubjects } from "@/lib/data/teachers";
import { getSessionProfile } from "@/lib/data/session";
import { bookHref } from "@/lib/booking";
import { safeNextPath } from "@/lib/safe-next";

export const metadata: Metadata = {
  title: "קביעת שיעור | SkillUp",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slot?: string | string[] }>;
}

export default async function BookLessonPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { slot: rawSlot } = await searchParams;
  const slotId = (Array.isArray(rawSlot) ? rawSlot[0] : rawSlot) || undefined;

  // Server-side gate (belt to GatedLink's suspenders): students only.
  // Guests come back to the exact same URL, ?slot= included.
  const session = await getSessionProfile();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(safeNextPath(bookHref(id, slotId)))}`);
  }
  if (session.role === "teacher") redirect(`/tutors/${id}`);

  const [teacher, subjects, slots] = await Promise.all([
    getTeacherProfile(id),
    getTeacherSubjects(id),
    getUpcomingSlots(id, 120),
  ]);
  if (!teacher) notFound();

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-[var(--r-lg)] bg-surface p-5 shadow-[var(--shadow-lift)] ring-1 ring-line/60 sm:p-9">
      <BookingWizard
        teacher={{
          id: teacher.id,
          display_name: teacher.display_name,
          avatar_url: teacher.avatar_url,
          hourly_rate: teacher.hourly_rate,
          lesson_modes: teacher.lesson_modes ?? [],
          lesson_mode_prices: teacher.lesson_mode_prices,
          default_lesson_duration_minutes:
            teacher.default_lesson_duration_minutes ?? 60,
        }}
        subjects={subjects.map((s) => ({ id: s.id, name_he: s.name_he }))}
        slots={slots}
        studentId={session.userId}
        preselectedSlotId={slotId}
      />
      </div>
    </div>
  );
}
