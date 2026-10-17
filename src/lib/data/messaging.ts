import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/types";

export interface ConversationListItem {
  id: string;
  teacher_id: string;
  student_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  peerName: string;
  peerAvatar: string | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string | null;
  content: string | null;
  is_read: boolean;
  created_at: string;
  image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  attachment_path: string | null;
  client_message_id: string | null;
}

/** Conversations for the logged-in user with peer identity + unread counts. */
export async function getConversations(
  profile: SessionProfile,
): Promise<ConversationListItem[]> {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, teacher_id, student_id, last_message_at, last_message_preview")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`conversations fetch failed: ${error.message}`);
  if (!conversations?.length) return [];

  const peerIds = conversations.map((c) =>
    profile.role === "teacher" ? c.student_id : c.teacher_id,
  );

  const [peers, unreadRes] = await Promise.all([
    profile.role === "teacher"
      ? supabase
          .from("students")
          .select("id, first_name, last_name, avatar_url")
          .in("id", peerIds)
      : supabase
          .from("teachers_public")
          .select("id, display_name, avatar_url")
          .in("id", peerIds),
    supabase.rpc("get_user_conversations_unread_counts", {
      p_user_id: profile.userId,
    }),
  ]);

  const peerMap = new Map<string, { name: string; avatar: string | null }>();
  for (const p of peers.data ?? []) {
    const row = p as Record<string, string | null>;
    peerMap.set(row.id as string, {
      name:
        (row.display_name as string) ??
        [row.first_name, row.last_name].filter(Boolean).join(" ") ??
        "משתמש SkillUp",
      avatar: row.avatar_url,
    });
  }

  // RPC returns [{conversation_id, unread_count}] (shape tolerated loosely).
  const unreadMap = new Map<string, number>();
  const unreadRows = (unreadRes.data ?? []) as {
    conversation_id?: string;
    unread_count?: number;
  }[];
  for (const row of unreadRows) {
    if (row.conversation_id) unreadMap.set(row.conversation_id, row.unread_count ?? 0);
  }

  return conversations.map((c) => {
    const peerId = profile.role === "teacher" ? c.student_id : c.teacher_id;
    const peer = peerMap.get(peerId);
    return {
      ...c,
      peerName: peer?.name || "משתמש SkillUp",
      peerAvatar: peer?.avatar ?? null,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

/** Initial message history for a conversation (participant-scoped by RLS). */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, sender_type, content, is_read, created_at, image_url, file_url, file_name, attachment_path, client_message_id",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(`messages fetch failed: ${error.message}`);
  return (data ?? []) as ChatMessage[];
}
