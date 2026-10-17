import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <ChevronRight size={16} />
        לפרופיל שלי
      </Link>
      <ScheduleManager
        teacherId={profile.userId}
        slotMinutes={teacher?.default_lesson_duration_minutes ?? 60}
      />
    </div>
  );
}
