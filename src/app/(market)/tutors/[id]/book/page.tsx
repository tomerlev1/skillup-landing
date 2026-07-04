import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { getUpcomingSlots } from "@/lib/data/availability";
import { getTeacherProfile, getTeacherSubjects } from "@/lib/data/teachers";
import { getSessionProfile } from "@/lib/data/session";

export const metadata: Metadata = {
  title: "קביעת שיעור | SkillUp",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookLessonPage({ params }: PageProps) {
  const { id } = await params;

  // Server-side gate (belt to GatedLink's suspenders): students only.
  const session = await getSessionProfile();
  if (!session) redirect(`/login?next=${encodeURIComponent(`/tutors/${id}/book`)}`);
  if (session.role === "teacher") redirect(`/tutors/${id}`);

  const [teacher, subjects, slots] = await Promise.all([
    getTeacherProfile(id),
    getTeacherSubjects(id),
    getUpcomingSlots(id, 120),
  ]);
  if (!teacher) notFound();

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
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
      />
    </div>
  );
}
