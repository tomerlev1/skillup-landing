import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// "Message the teacher" entry point: find-or-create the conversation for
// (teacher, current student) and land in the thread. Mirrors the iOS
// createOrGetConversation client logic (no dedicated RPC exists).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const teacherId = searchParams.get("teacher");
  if (!teacherId) return NextResponse.redirect(`${origin}/messages`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(`/messages/new?teacher=${teacherId}`)}`,
    );
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) return NextResponse.redirect(`${origin}/messages/${existing.id}`);

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ teacher_id: teacherId, student_id: user.id })
    .select("id")
    .single();

  if (error || !created) {
    // Unique-violation race: someone (another tab) created it first.
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("student_id", user.id)
      .maybeSingle();
    if (retry) return NextResponse.redirect(`${origin}/messages/${retry.id}`);
    return NextResponse.redirect(`${origin}/messages?error=create`);
  }

  return NextResponse.redirect(`${origin}/messages/${created.id}`);
}
