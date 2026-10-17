import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import AccountHeader from "@/components/page/AccountHeader";
import ScheduleManager from "@/components/account/ScheduleManager";
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
    .select("default_lesson_duration_minutes")
    .eq("id", profile.userId)
    .maybeSingle();

  return (
    <>
      <AccountHeader
        icon={CalendarClock}
        tone="bg-tint-peach text-tint-peach-fg"
        title="יומן הזמינות"
        subtitle="לוחצים על שעה כדי לפתוח אותה להזמנה. מסתנכרן מיד עם האפליקציה."
        back={{ href: "/account", label: "לפרופיל שלי" }}
      />
      <div className="relative mx-auto max-w-[960px] px-4 pb-16 sm:px-6">
        <ScheduleManager
          teacherId={profile.userId}
          slotMinutes={teacher?.default_lesson_duration_minutes ?? 60}
        />
      </div>
    </>
  );
}
