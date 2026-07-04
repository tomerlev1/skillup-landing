import type { SupabaseClient, User } from "@supabase/supabase-js";

// No auth.users signup trigger exists (by design — iOS creates role rows
// client-side). The web mirrors that exactly: after any signup path
// (password or OAuth) create the role row the user's metadata asks for.
// Metadata shape matches the iOS app: { role, display_name, phone, ... }.
// OAuth users without a role default to student. RLS enforces id = auth.uid().
export async function ensureRoleRow(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const [{ data: student }, { data: teacher }] = await Promise.all([
    supabase.from("students").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("teachers").select("id").eq("id", user.id).maybeSingle(),
  ]);
  if (student || teacher) return;

  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const displayName = meta.display_name || meta.full_name || meta.name || "";
  const [first, ...rest] = displayName.split(/\s+/).filter(Boolean);

  if (meta.role === "teacher") {
    // profile_completed stays false until the teacher fills the profile
    // (/account or the app) — incomplete teachers never appear in search.
    await supabase.from("teachers").insert({
      id: user.id,
      display_name: displayName || "מורה חדש/ה",
      email: user.email ?? null,
      phone_number: meta.phone || null,
      is_active: true,
      profile_completed: false,
    });
    return;
  }

  await supabase.from("students").insert({
    id: user.id,
    first_name: meta.first_name || first || "",
    last_name: meta.last_name || rest.join(" ") || "",
    email: user.email ?? null,
    phone: meta.phone || null,
    avatar_url: meta.avatar_url || meta.picture || null,
    is_active: true,
  });
}

const ERROR_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, "האימייל או הסיסמה שגויים. נסו שוב."],
  [/user already registered/i, "כבר קיים חשבון עם האימייל הזה. אפשר להתחבר."],
  [/email not confirmed/i, "האימייל עדיין לא אומת. בדקו את תיבת הדואר שלכם."],
  [/password should be at least/i, "הסיסמה קצרה מדי. צריך לפחות 8 תווים."],
  [/rate limit/i, "יותר מדי ניסיונות. המתינו רגע ונסו שוב."],
  [/invalid email/i, "כתובת האימייל אינה תקינה."],
];

export function authErrorHe(message: string | undefined): string {
  if (message) {
    for (const [pattern, hebrew] of ERROR_MESSAGES) {
      if (pattern.test(message)) return hebrew;
    }
  }
  return "משהו השתבש. נסו שוב בעוד רגע.";
}
