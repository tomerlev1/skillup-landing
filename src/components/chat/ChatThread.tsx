"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Paperclip, SendHorizontal } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/format";
import type { ChatMessage } from "@/lib/data/messaging";
import type { UserRole } from "@/lib/types";

interface ChatThreadProps {
  conversationId: string;
  userId: string;
  userRole: UserRole;
  peerName: string;
  peerAvatar: string | null;
  peerProfileHref: string | null;
  initialMessages: ChatMessage[];
}

// Realtime chat over the messages table (postgres_changes). Sends are
// optimistic with a client_message_id so the realtime echo reconciles
// instead of duplicating. Read receipts via mark_conversation_read.
export default function ChatThread({
  conversationId,
  userId,
  userRole,
  peerName,
  peerAvatar,
  peerProfileHref,
  initialMessages,
}: ChatThreadProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingSentAt = useRef(0);
  const typingClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markRead = useCallback(() => {
    supabase
      .rpc("mark_conversation_read", {
        p_conversation_id: conversationId,
        p_user_id: userId,
      })
      .then(() => {});
  }, [supabase, conversationId, userId]);

  useEffect(() => {
    markRead();
  }, [markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, peerTyping]);

  // Realtime: new/updated messages + peer typing.
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            // Reconcile the optimistic copy of our own message.
            const idx = prev.findIndex(
              (m) =>
                m.client_message_id &&
                m.client_message_id === incoming.client_message_id,
            );
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = incoming;
              return next;
            }
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          if (incoming.sender_id !== userId) {
            setPeerTyping(false);
            markRead();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Typing = a live row for the peer (expires_at in the future).
          const row = (payload.new ?? payload.old) as {
            user_id?: string;
            expires_at?: string;
          };
          if (!row.user_id || row.user_id === userId) return;
          if (payload.eventType === "DELETE") {
            setPeerTyping(false);
            return;
          }
          const ttl = row.expires_at
            ? new Date(row.expires_at).getTime() - Date.now()
            : 5000;
          if (ttl > 0) {
            setPeerTyping(true);
            if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
            typingClearTimer.current = setTimeout(
              () => setPeerTyping(false),
              Math.min(ttl, 8000),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, userId, markRead]);

  // Throttled typing signal: one live row per (conversation, user) with a
  // short expires_at TTL — matches the iOS convention. Best-effort.
  function signalTyping() {
    const now = Date.now();
    if (now - typingSentAt.current < 2500) return;
    typingSentAt.current = now;
    supabase
      .from("typing_indicators")
      .upsert(
        {
          conversation_id: conversationId,
          user_id: userId,
          expires_at: new Date(now + 6000).toISOString(),
        },
        { onConflict: "conversation_id,user_id" },
      )
      .then(() => {});
  }

  async function send() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");

    const clientMessageId = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id: `optimistic-${clientMessageId}`,
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: userRole,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      image_url: null,
      file_url: null,
      file_name: null,
      attachment_path: null,
      client_message_id: clientMessageId,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: userRole,
      content,
      client_message_id: clientMessageId,
    });

    if (error) {
      // Roll back and restore the draft so nothing is lost.
      setMessages((prev) =>
        prev.filter((m) => m.client_message_id !== clientMessageId),
      );
      setDraft(content);
      return;
    }

    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.slice(0, 120),
      })
      .eq("id", conversationId);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] max-w-[760px] flex-col px-0 sm:px-6">
      {/* Thread header */}
      <div className="border-b border-line flex items-center gap-3 bg-surface px-4 py-3 sm:px-0">
        <Link
          href="/messages"
          aria-label="חזרה להודעות"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--r-pill)] transition-colors hover:bg-canvas"
        >
          <ChevronRight size={18} />
        </Link>
        {peerProfileHref ? (
          <Link href={peerProfileHref} className="flex min-w-0 items-center gap-3">
            <Avatar src={peerAvatar} name={peerName} size={38} />
            <span className="truncate text-[15px] font-semibold text-ink hover:underline">
              {peerName}
            </span>
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={peerAvatar} name={peerName} size={38} />
            <span className="truncate text-[15px] font-semibold text-ink">
              {peerName}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-canvas px-4 py-5 sm:rounded-[var(--r-md)]">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[78%] rounded-[var(--r-md)] px-4 py-2.5 ${
                  mine
                    ? "rounded-ee-md bg-action text-on-action"
                    : "rounded-es-md border border-line bg-surface text-ink"
                }`}
              >
                {m.content && (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {m.content}
                  </p>
                )}
                {(m.image_url || m.file_url || m.attachment_path) && (
                  <p className={`mt-1 inline-flex items-center gap-1.5 text-sm ${mine ? "text-on-action/85" : "text-ink-3"}`}>
                    <Paperclip size={13} />
                    {m.file_name ?? "קובץ מצורף (זמין באפליקציה)"}
                  </p>
                )}
                <p
                  className={`tnum mt-1 text-end text-sm ${
                    mine ? "text-on-action/70" : "text-ink-3"
                  }`}
                >
                  {formatTime(m.created_at)}
                  {mine && m.is_read && " · נקרא"}
                </p>
              </div>
            </div>
          );
        })}
        {peerTyping && (
          <div className="flex justify-end">
            <div className="rounded-[var(--r-md)] rounded-es-md border border-line bg-surface px-4 py-2.5 text-sm text-ink-3">
              {peerName} מקלידים...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 bg-surface px-4 py-3 sm:px-0"
      >
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            signalTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="כתבו הודעה..."
          aria-label="הודעה"
          className="max-h-32 min-h-12 flex-1 resize-none rounded-[var(--r-md)] border border-line bg-surface px-4 py-3 text-[15px] leading-snug outline-none transition-colors focus:border-action"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="שליחה"
          className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-[var(--r-pill)] bg-action text-on-action transition-colors hover:bg-action-hover disabled:opacity-40"
        >
          <SendHorizontal size={18} className="-scale-x-100" />
        </button>
      </form>
    </div>
  );
}
