import type { SupabaseClient, User } from "@supabase/supabase-js";

// No auth.users signup trigger exists (by design — iOS creates role rows
// client-side). The web mirrors that: after any signup path (password or
// OAuth) make sure the user has a role row; default new web users to
// student. Existing teachers logging in are left untouched.
export async function ensureStudentRow(
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

  await supabase.from("students").insert({
    id: user.id,
    first_name: meta.first_name || first || "",
    last_name: meta.last_name || rest.join(" ") || "",
    email: user.email ?? null,
    avatar_url: meta.avatar_url || meta.picture || null,
    is_active: true,
  });
}

const ERROR_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, "האימייל או הסיסמה שגויים. נסו שוב."],
  [/user already registered/i, "כבר קיים חשבון עם האימייל הזה. אפשר להתחבר."],
  [/email not confirmed/i, "האימייל עדיין לא אומת. בדקו את תיבת הדואר שלכם."],
  [/password should be at least/i, "הסיסמה קצרה מדי — נדרשים לפחות 8 תווים."],
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
