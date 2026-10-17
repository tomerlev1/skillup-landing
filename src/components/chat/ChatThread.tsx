"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  MessagesSquare,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/format";
import { jerusalemDateShort, jerusalemDayKey, jerusalemWeekday } from "@/lib/availability-label";
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

  // Day separators + grouping of consecutive messages from the same sender.
  const todayKey = jerusalemDayKey(new Date().toISOString());
  const yesterdayKey = jerusalemDayKey(new Date(Date.now() - 86_400_000).toISOString());
  const dayLabel = (iso: string) => {
    const k = jerusalemDayKey(iso);
    if (k === todayKey) return "היום";
    if (k === yesterdayKey) return "אתמול";
    return `יום ${jerusalemWeekday(iso)}, ${jerusalemDateShort(iso)}`;
  };
  const lastMineIndex = messages.reduce((acc, m, i) => (m.sender_id === userId ? i : acc), -1);
  const bookHref = peerProfileHref ? `${peerProfileHref}/book` : null;
  const quickStarts =
    userRole === "student"
      ? ["היי, אשמח לשמוע על הזמינות שלך", "מה המחיר לשיעור אונליין?", "אפשר לתאם שיעור ניסיון?"]
      : ["היי, שמח לעזור. מה המטרה שלך?", "מתי נוח לך לשיעור?", "תרצה שיעור אונליין או פרונטלי?"];

  return (
    <div className="mx-auto flex h-[calc(100dvh-72px)] max-w-[920px] flex-col px-0 sm:px-6 sm:py-5">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface sm:rounded-[var(--r-lg)] sm:shadow-[var(--shadow-lift)] sm:ring-1 sm:ring-line/60">
        {/* Thread header */}
        <div className="flex items-center gap-3 border-b border-line/70 bg-surface/90 px-3 py-3 backdrop-blur sm:px-5">
          <Link
            href="/messages"
            aria-label="חזרה להודעות"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-pill text-ink transition-colors hover:bg-canvas"
          >
            <ChevronRight strokeWidth={2} size={20} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="relative shrink-0">
              <Avatar src={peerAvatar} name={peerName} size={44} />
              <span className="absolute -bottom-0.5 -end-0.5 size-3.5 rounded-full bg-ok ring-2 ring-surface" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              {peerProfileHref ? (
                <Link href={peerProfileHref} className="block truncate text-base font-extrabold text-ink hover:underline">
                  {peerName}
                </Link>
              ) : (
                <p className="truncate text-base font-extrabold text-ink">{peerName}</p>
              )}
              <p className="truncate text-[13px] text-ink-3">
                {peerTyping ? (
                  <span className="font-semibold text-action">מקלידים…</span>
                ) : userRole === "student" ? (
                  "מורה ב-SkillUp"
                ) : (
                  "תלמיד ב-SkillUp"
                )}
              </p>
            </div>
          </div>
          {bookHref && userRole === "student" && (
            <Link
              href={bookHref}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-pill bg-action px-4 text-sm font-bold text-on-action shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] transition-colors hover:bg-action-hover"
            >
              <CalendarPlus size={16} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">קביעת שיעור</span>
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className="chat-scroll relative min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-[420px] flex-col items-center justify-center text-center">
              <span className="grid size-16 place-items-center rounded-[var(--r-lg)] bg-tint-indigo text-tint-indigo-fg shadow-[var(--shadow-card)]">
                <MessagesSquare size={30} strokeWidth={2} />
              </span>
              <p className="mt-4 text-lg font-extrabold text-ink">התחילו את השיחה עם {peerName}</p>
              <p className="mt-1 text-sm text-ink-2">אפשר לבחור הודעה מוכנה או לכתוב משלכם.</p>
            </div>
          ) : (
            <ol className="space-y-1">
              {messages.map((m, i) => {
                const mine = m.sender_id === userId;
                const prev = messages[i - 1];
                const nextMsg = messages[i + 1];
                const newDay = !prev || jerusalemDayKey(prev.created_at) !== jerusalemDayKey(m.created_at);
                const sameAsPrev =
                  !newDay &&
                  prev?.sender_id === m.sender_id &&
                  new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60_000;
                const lastInGroup =
                  !nextMsg ||
                  nextMsg.sender_id !== m.sender_id ||
                  jerusalemDayKey(nextMsg.created_at) !== jerusalemDayKey(m.created_at) ||
                  new Date(nextMsg.created_at).getTime() - new Date(m.created_at).getTime() >= 5 * 60_000;
                return (
                  <li key={m.id}>
                    {newDay && (
                      <div className="sticky top-0 z-10 my-4 flex justify-center">
                        <span className="rounded-pill bg-surface/90 px-3 py-1 text-[12px] font-bold text-ink-3 shadow-[var(--shadow-card)] ring-1 ring-line/60 backdrop-blur">
                          {dayLabel(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`chat-msg flex items-end gap-2 ${mine ? "justify-start" : "justify-end"} ${
                        sameAsPrev ? "mt-0.5" : "mt-3"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-2.5 sm:max-w-[68%] ${
                          mine
                            ? `bg-[linear-gradient(160deg,#6457F0,#4F46E5)] text-white shadow-[0_8px_18px_-12px_rgba(79,70,229,0.9)] rounded-[var(--r-md)] ${lastInGroup ? "rounded-ee-[var(--r-tail)]" : ""}`
                            : `bg-surface text-ink shadow-[var(--shadow-card)] ring-1 ring-line/60 rounded-[var(--r-md)] ${lastInGroup ? "rounded-es-[var(--r-tail)]" : ""}`
                        }`}
                      >
                        {m.content && (
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.content}</p>
                        )}
                        {(m.image_url || m.file_url || m.attachment_path) && (
                          <p className={`mt-1 inline-flex items-center gap-1.5 text-sm ${mine ? "text-white/85" : "text-ink-3"}`}>
                            <Paperclip strokeWidth={2} size={15} />
                            {m.file_name ?? "קובץ מצורף (זמין באפליקציה)"}
                          </p>
                        )}
                        <p
                          className={`tnum mt-0.5 flex items-center justify-end gap-1 text-[12px] ${
                            mine ? "text-white/75" : "text-ink-3"
                          }`}
                        >
                          {formatTime(m.created_at)}
                          {mine &&
                            (m.id.startsWith("optimistic-") ? (
                              <Clock3 size={13} strokeWidth={2.25} aria-label="נשלח" />
                            ) : m.is_read ? (
                              <CheckCheck size={14} strokeWidth={2.25} aria-label="נקרא" className="text-[#C9E6FF]" />
                            ) : (
                              <Check size={14} strokeWidth={2.25} aria-label="נמסר" />
                            ))}
                        </p>
                      </div>
                    </div>
                    {mine && i === lastMineIndex && m.is_read && (
                      <p className="mt-1 text-start text-[12px] font-semibold text-ink-3">נקרא</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {peerTyping && (
            <div className="mt-3 flex justify-end">
              <div className="flex items-center gap-1 rounded-[var(--r-md)] rounded-es-[var(--r-tail)] bg-surface px-4 py-3.5 shadow-[var(--shadow-card)] ring-1 ring-line/60" aria-label={`${peerName}: הקלדה…`}>
                <span className="typing-dot" />
                <span className="typing-dot [animation-delay:150ms]" />
                <span className="typing-dot [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick starts (only before the conversation gets going) */}
        {messages.length < 2 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-1 pt-2 sm:px-6">
            {quickStarts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setDraft(q)}
                className="shrink-0 cursor-pointer rounded-pill bg-tint-indigo px-3.5 py-2 text-sm font-semibold text-tint-indigo-fg transition-colors hover:bg-brand-100"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="px-3 pb-3 pt-2 sm:px-6 sm:pb-5"
        >
          <div className="flex items-end gap-2 rounded-[var(--r-lg)] bg-canvas p-1.5 ring-1 ring-line transition-shadow focus-within:shadow-[0_0_0_4px_var(--c-brand-100)] focus-within:ring-action">
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                signalTyping();
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={`כתבו הודעה ל${peerName}…`}
              aria-label="הודעה"
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-snug text-ink outline-none placeholder:text-ink-3"
              style={{ boxShadow: "none", border: "none" }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="שליחה"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[linear-gradient(160deg,#6457F0,#4F46E5)] text-white shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] transition-[transform,opacity] duration-200 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <SendHorizontal strokeWidth={2.25} size={19} className="-scale-x-100" />
            </button>
          </div>
          <p className="mt-1.5 hidden px-3 text-[12px] text-ink-3 sm:block">Enter לשליחה · Shift+Enter לשורה חדשה</p>
        </form>
      </div>
    </div>
  );
}
