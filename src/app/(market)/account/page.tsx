import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AccountForm from "@/components/account/AccountForm";
import { getSessionProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "הפרופיל שלי | SkillUp",
  robots: { index: false },
};

const STUDENT_COLS = "first_name, last_name, phone, email, bio, city_id";
const TEACHER_COLS =
  "display_name, phone_number, email, bio, hourly_rate, experience_years, city_id, instagram_url, facebook_url, website_url, profile_completed";

export default async function AccountPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/account");

  const supabase = await createClient();
  const isTeacher = profile.role === "teacher";
  const { data: row } = await supabase
    .from(isTeacher ? "teachers" : "students")
    .select(isTeacher ? TEACHER_COLS : STUDENT_COLS)
    .eq("id", profile.userId)
    .maybeSingle();

  let cityName: string | null = null;
  const cityId = (row as { city_id?: string } | null)?.city_id;
  if (cityId) {
    const { data: city } = await supabase
      .from("cities")
      .select("name_he")
      .eq("id", cityId)
      .maybeSingle();
    cityName = city?.name_he ?? null;
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 sm:px-6">
      <Suspense>
        <AccountForm
          role={profile.role}
          userId={profile.userId}
          initial={(row ?? {}) as Record<string, string | number | boolean | null>}
          initialCityName={cityName}
        />
      </Suspense>
    </div>
  );
}
