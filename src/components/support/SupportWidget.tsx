"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Headset, SendHorizontal, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { QUICK_TOPICS } from "@/lib/support/knowledge";

type WidgetMessage =
  | { kind: "bot" | "user"; text: string; linkHref?: string; linkLabel?: string }
  | { kind: "system"; text: string };

const GREETING: WidgetMessage = {
  kind: "bot",
  text: "שלום! אני העוזר של SkillUp. אפשר לבחור נושא, או פשוט לכתוב לי שאלה.",
};

// Floating support bot. Launcher sits on the inline-end side (visual LEFT
// in RTL — the correct trailing corner). Three layers: scripted topics →
// Claude fallback → leave-a-message escalation into support_requests.
export default function SupportWidget() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const { user, profile } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sendingEscalation, setSendingEscalation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking, escalating]);

  useEffect(() => {
    if (profile && !contactName) setContactName(profile.displayName);
    if (user?.email && !contactDetail) setContactDetail(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user]);

  function pickTopic(topicId: string) {
    const topic = QUICK_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    setMessages((prev) => [
      ...prev,
      { kind: "user", text: topic.question },
      {
        kind: "bot",
        text: topic.answer,
        linkHref: topic.linkHref,
        linkLabel: topic.linkLabel,
      },
    ]);
  }

  async function sendFreeText() {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft("");
    const nextMessages: WidgetMessage[] = [...messages, { kind: "user", text }];
    setMessages(nextMessages);
    setThinking(true);

    try {
      const history = nextMessages
        .filter((m): m is Extract<WidgetMessage, { kind: "bot" | "user" }> =>
          m.kind === "bot" || m.kind === "user",
        )
        .slice(1) // drop the canned greeting
        .map((m) => ({
          role: m.kind === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json()) as { reply?: string; unavailable?: boolean };

      if (data.reply) {
        setMessages((prev) => [...prev, { kind: "bot", text: data.reply! }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            kind: "bot",
            text: "אני לא בטוח שאדע לענות על זה כרגע. אפשר להשאיר הודעה לנציג ונחזור אליכם בהקדם.",
          },
        ]);
        setEscalating(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          kind: "bot",
          text: "משהו השתבש אצלי. אפשר להשאיר הודעה לנציג ונחזור אליכם.",
        },
      ]);
      setEscalating(true);
    } finally {
      setThinking(false);
    }
  }

  async function submitEscalation(e: React.FormEvent) {
    e.preventDefault();
    if (sendingEscalation) return;
    setSendingEscalation(true);

    const transcript = messages
      .filter((m) => m.kind !== "system")
      .slice(-20)
      .map((m) => ({ role: m.kind, text: m.text.slice(0, 500) }));

    const { error } = await supabase.from("support_requests").insert({
      user_id: user?.id ?? null,
      name: contactName.trim(),
      contact: contactDetail.trim(),
      topic: "web-chatbot",
      message: contactMessage.trim(),
      page_context: pathname,
      transcript,
    });

    setSendingEscalation(false);
    if (error) {
      setMessages((prev) => [
        ...prev,
        { kind: "system", text: "שליחת הפנייה נכשלה. נסו שוב או כתבו לנו במייל." },
      ]);
      return;
    }
    setEscalating(false);
    setEscalated(true);
    setMessages((prev) => [
      ...prev,
      {
        kind: "bot",
        text: `תודה ${contactName.trim()}! הפנייה נקלטה, ונציג SkillUp יחזור אליכם בהקדם דרך ${contactDetail.trim()}.`,
      },
    ]);
  }

  return (
    <>
      {/* Launcher — bottom inline-end (visual left in RTL) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "סגירת עזרה" : "פתיחת עזרה"}
        aria-expanded={open}
        className="fixed bottom-20 end-4 z-[70] grid h-13 w-13 cursor-pointer place-items-center rounded-full bg-[var(--mk-ink)] text-white shadow-[var(--mk-shadow)] transition-transform hover:scale-105 lg:bottom-6 lg:end-6"
      >
        {open ? <X size={21} /> : <Headset size={21} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="עזרה ותמיכה"
          className="mk-shadow fixed bottom-36 end-4 z-[70] flex h-[min(560px,calc(100dvh-140px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-[var(--mk-hairline)] bg-white lg:bottom-24 lg:end-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-[var(--mk-ink)] px-5 py-4 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <Headset size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">התמיכה של SkillUp</p>
              <p className="text-xs text-white/70">כאן לכל שאלה על האתר והשיעורים</p>
            </div>
            {!escalated && (
              <button
                type="button"
                onClick={() => setEscalating(true)}
                className="shrink-0 cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
              >
                <UserRound size={12} className="mb-0.5 inline" /> נציג
              </button>
            )}
          </div>

          {/* Conversation */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--mk-band)] px-4 py-4">
            {messages.map((m, i) =>
              m.kind === "system" ? (
                <p key={i} className="text-center text-xs text-rose-500">
                  {m.text}
                </p>
              ) : (
                <div
                  key={i}
                  className={`flex ${m.kind === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.kind === "user"
                        ? "rounded-ee-md bg-brand-600 text-white"
                        : "rounded-es-md border border-[var(--mk-hairline)] bg-white text-[var(--mk-ink)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.kind === "bot" && m.linkHref && (
                      <a
                        href={m.linkHref}
                        className="mt-1.5 inline-block text-[13px] font-semibold text-brand-700 hover:underline"
                      >
                        {m.linkLabel ?? "מעבר"} ←
                      </a>
                    )}
                  </div>
                </div>
              ),
            )}

            {thinking && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-es-md border border-[var(--mk-hairline)] bg-white px-3.5 py-2.5 text-sm text-[var(--mk-ink-3)]">
                  חושב...
                </div>
              </div>
            )}

            {/* Quick topics (before any user message) */}
            {messages.length === 1 && !escalating && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickTopic(t.id)}
                    className="cursor-pointer rounded-full border border-[var(--mk-hairline)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--mk-ink)] transition-colors hover:border-[var(--mk-ink)]"
                  >
                    {t.question}
                  </button>
                ))}
              </div>
            )}

            {/* Escalation form */}
            {escalating && (
              <form
                onSubmit={submitEscalation}
                className="space-y-2.5 rounded-2xl border border-[var(--mk-hairline)] bg-white p-4"
              >
                <p className="text-sm font-semibold text-[var(--mk-ink)]">
                  השארת הודעה לנציג
                </p>
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="שם"
                  className="h-10 w-full rounded-lg border border-[var(--mk-hairline)] px-3 text-sm outline-none focus:border-[var(--mk-ink)]"
                />
                <input
                  required
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="אימייל או טלפון לחזרה"
                  dir="auto"
                  className="h-10 w-full rounded-lg border border-[var(--mk-hairline)] px-3 text-sm outline-none focus:border-[var(--mk-ink)]"
                />
                <textarea
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="במה נוכל לעזור?"
                  className="w-full rounded-lg border border-[var(--mk-hairline)] px-3 py-2 text-sm outline-none focus:border-[var(--mk-ink)]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={sendingEscalation}
                    className="h-10 flex-1 cursor-pointer rounded-full bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                  >
                    {sendingEscalation ? "שולחים..." : "שליחה לנציג"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscalating(false)}
                    className="h-10 cursor-pointer rounded-full border border-[var(--mk-hairline)] px-4 text-sm font-medium text-[var(--mk-ink)]"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          {!escalating && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendFreeText();
              }}
              className="mk-hairline-t flex items-center gap-2 bg-white px-3 py-2.5"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="כתבו שאלה..."
                aria-label="שאלה לתמיכה"
                className="h-11 min-w-0 flex-1 rounded-full border border-[var(--mk-hairline)] bg-white px-4 text-sm outline-none transition-colors focus:border-[var(--mk-ink)]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="שליחה"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
              >
                <SendHorizontal size={16} className="-scale-x-100" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
