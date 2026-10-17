import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/types";

// Resolves the logged-in user's role + display identity. Role rows are
// client-created (no signup trigger — matches iOS): a `students` row means
// student, else a `teachers` row means teacher. RLS scopes both to the owner.
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (student) {
    return {
      userId: user.id,
      role: "student",
      displayName:
        [student.first_name, student.last_name].filter(Boolean).join(" ") ||
        "לומד",
      avatarUrl: student.avatar_url,
    };
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (teacher) {
    return {
      userId: user.id,
      role: "teacher",
      displayName: teacher.display_name ?? "מורה",
      avatarUrl: teacher.avatar_url,
    };
  }

  // Authenticated but no role row yet (mid-signup) — treat as student shell.
  return {
    userId: user.id,
    role: "student",
    displayName: user.email ?? "משתמש SkillUp",
    avatarUrl: null,
  };
}
