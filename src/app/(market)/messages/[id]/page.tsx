import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ChatThread from "@/components/chat/ChatThread";
import { getMessages } from "@/lib/data/messaging";
import { getSessionProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "שיחה | SkillUp",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/messages/${id}`)}`);

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, teacher_id, student_id")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) notFound(); // RLS: non-participants see nothing

  const peerId =
    profile.role === "teacher" ? conversation.student_id : conversation.teacher_id;

  let peerName = "משתמש SkillUp";
  let peerAvatar: string | null = null;
  let peerProfileHref: string | null = null;

  if (profile.role === "teacher") {
    const { data: student } = await supabase
      .from("students")
      .select("first_name, last_name, avatar_url")
      .eq("id", peerId)
      .maybeSingle();
    if (student) {
      peerName =
        [student.first_name, student.last_name].filter(Boolean).join(" ") || peerName;
      peerAvatar = student.avatar_url;
    }
  } else {
    const { data: teacher } = await supabase
      .from("teachers_public")
      .select("display_name, avatar_url")
      .eq("id", peerId)
      .maybeSingle();
    if (teacher) {
      peerName = teacher.display_name ?? peerName;
      peerAvatar = teacher.avatar_url;
      peerProfileHref = `/tutors/${peerId}`;
    }
  }

  const messages = await getMessages(id);

  return (
    <ChatThread
      conversationId={id}
      userId={profile.userId}
      userRole={profile.role}
      peerName={peerName}
      peerAvatar={peerAvatar}
      peerProfileHref={peerProfileHref}
      initialMessages={messages}
    />
  );
}
