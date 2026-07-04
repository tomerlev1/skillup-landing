import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureRoleRow } from "@/lib/auth/ensure-role-row";

// OAuth / email-confirmation landing: exchange the code for a session,
// make sure a role row exists (web default: student), resume `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  // Only same-origin relative paths — never an open redirect.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await ensureRoleRow(supabase, user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
