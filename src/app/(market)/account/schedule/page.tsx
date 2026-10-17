import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import AccountHeader from "@/components/page/AccountHeader";
import AvailabilityCalendar from "@/components/schedule/AvailabilityCalendar";
import { getSessionProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ניהול זמינות | SkillUp",
  robots: { index: false },
};

export default async function SchedulePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/account/schedule");
  if (profile.role !== "teacher") redirect("/account");

  const supabase = await createClient();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("default_lesson_duration_minutes, lesson_modes")
    .eq("id", profile.userId)
    .maybeSingle();

  return (
    <>
      <AccountHeader
        icon={CalendarClock}
        tone="bg-tint-peach text-tint-peach-fg"
        title="יומן הזמינות"
        subtitle="מתי אפשר לקבוע אצלכם שיעור. כל שינוי מסתנכרן מיד עם האפליקציה."
        back={{ href: "/account", label: "לפרופיל שלי" }}
        wide
      />
      <div className="relative mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
        <AvailabilityCalendar
          teacherId={profile.userId}
          initialDuration={teacher?.default_lesson_duration_minutes ?? 60}
          teacherModes={(teacher?.lesson_modes as string[] | null) ?? ["online"]}
        />
      </div>
    </>
  );
}
