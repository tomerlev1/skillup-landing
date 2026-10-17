"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Headset, SendHorizontal, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { MAIN_MENU_LABEL, QUICK_TOPICS } from "@/lib/support/knowledge";

type WidgetMessage =
  | { kind: "bot" | "user"; text: string; linkHref?: string; linkLabel?: string }
  | { kind: "system"; text: string };

// After every answer the bot offers a way to continue: either topic-specific
// follow-ups or the full menu. "menu" = show all topics.
type Suggestions = "menu" | string[];

const GREETING: WidgetMessage = {
  kind: "bot",
  text: "היי, כאן העוזר של SkillUp. במה אפשר לעזור? אפשר לבחור נושא מהרשימה או פשוט לכתוב לי.",
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
  const [suggestions, setSuggestions] = useState<Suggestions>("menu");
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
    setSuggestions(topic.followUps);
  }

  async function sendFreeText() {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft("");
    const nextMessages: WidgetMessage[] = [...messages, { kind: "user", text }];
    setMessages(nextMessages);
    setSuggestions([]);
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
        setSuggestions([]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            kind: "bot",
            text: "את זה כדאי לברר מול נציג אנושי. השאירו הודעה ונחזור אליכם בהקדם.",
          },
        ]);
        setEscalating(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          kind: "bot",
          text: "משהו השתבש אצלי רגע. אפשר לנסות שוב, או להשאיר הודעה לנציג ונחזור אליכם.",
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
        text: `תודה, ${contactName.trim()}. הפנייה התקבלה אצלנו ונציג יחזור אליכם בהקדם דרך ${contactDetail.trim()}. בינתיים, אם יש עוד משהו, אני כאן.`,
      },
    ]);
    setSuggestions("menu");
  }

  return (
    <>
      {/* Launcher — bottom inline-end (visual left in RTL) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "סגירת עזרה" : "פתיחת עזרה"}
        aria-expanded={open}
        style={{ bottom: "calc(16px + var(--sticky-bar-h, 0px) + env(safe-area-inset-bottom))" }}
        className="fixed end-4 z-[70] grid h-13 w-13 cursor-pointer place-items-center rounded-pill border border-line bg-surface text-ink shadow-[var(--shadow-lift)] transition-[transform,bottom] duration-200 hover:scale-105 lg:end-6"
      >
        {open ? <X strokeWidth={1.75} size={20} /> : <Headset strokeWidth={1.75} size={20} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="עזרה ותמיכה"
          style={{ bottom: "calc(16px + 52px + 12px + var(--sticky-bar-h, 0px) + env(safe-area-inset-bottom))" }}
          className="fixed end-4 z-[70] flex h-[min(560px,calc(100dvh-160px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-surface shadow-[var(--shadow-lift)] lg:end-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4 text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-pill bg-action-soft text-action">
              <Headset strokeWidth={1.75} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">התמיכה של SkillUp</p>
              <p className="text-sm text-ink-3">כאן לכל שאלה על האתר והשיעורים</p>
            </div>
            {!escalated && (
              <button
                type="button"
                onClick={() => setEscalating(true)}
                className="shrink-0 cursor-pointer rounded-pill border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
              >
                <UserRound strokeWidth={1.75} size={16} className="mb-0.5 inline" /> נציג
              </button>
            )}
          </div>

          {/* Conversation */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4">
            {messages.map((m, i) =>
              m.kind === "system" ? (
                <p key={i} className="text-center text-sm text-danger-text">
                  {m.text}
                </p>
              ) : (
                <div
                  key={i}
                  className={`flex ${m.kind === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[var(--r-md)] px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.kind === "user"
                        ? "rounded-ee-md bg-action text-on-action"
                        : "rounded-es-md border border-line bg-surface text-ink"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.kind === "bot" && m.linkHref && (
                      <a
                        href={m.linkHref}
                        className="mt-1.5 inline-block text-sm font-semibold text-action hover:underline"
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
                <div className="rounded-[var(--r-md)] rounded-es-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-3">
                  חושב...
                </div>
              </div>
            )}

            {/* Continuous conversation loop: after every answer the user
                gets follow-up chips or the full menu — never a dead end. */}
            {!escalating && !thinking && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(suggestions === "menu"
                  ? QUICK_TOPICS
                  : QUICK_TOPICS.filter((t) => suggestions.includes(t.id))
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickTopic(t.id)}
                    className="cursor-pointer rounded-pill border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                  >
                    {t.question}
                  </button>
                ))}
                {suggestions !== "menu" && (
                  <button
                    type="button"
                    onClick={() => setSuggestions("menu")}
                    className="cursor-pointer rounded-pill border border-ink bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                  >
                    {MAIN_MENU_LABEL}
                  </button>
                )}
              </div>
            )}

            {/* Escalation form */}
            {escalating && (
              <form
                onSubmit={submitEscalation}
                className="space-y-2.5 rounded-[var(--r-md)] border border-line bg-surface p-4"
              >
                <p className="text-sm font-semibold text-ink">
                  השארת הודעה לנציג
                </p>
                <input
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="שם"
                  className="h-10 w-full rounded-[var(--r-sm)] border border-line px-3 text-sm outline-none focus:border-ink"
                />
                <input
                  required
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="אימייל או טלפון לחזרה"
                  dir="auto"
                  className="h-10 w-full rounded-[var(--r-sm)] border border-line px-3 text-sm outline-none focus:border-ink"
                />
                <textarea
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="במה נוכל לעזור?"
                  className="w-full rounded-[var(--r-sm)] border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={sendingEscalation}
                    className="h-10 flex-1 cursor-pointer rounded-pill bg-action text-sm font-semibold text-on-action transition-colors hover:bg-action-hover disabled:opacity-60"
                  >
                    {sendingEscalation ? "שולחים..." : "שליחה לנציג"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscalating(false)}
                    className="h-10 cursor-pointer rounded-pill border border-line px-4 text-sm font-medium text-ink"
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
              className="border-t border-line flex items-center gap-2 bg-surface px-3 py-2.5"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="כתבו שאלה..."
                aria-label="שאלה לתמיכה"
                className="h-11 min-w-0 flex-1 rounded-pill border border-line bg-surface px-4 text-sm outline-none transition-colors focus:border-ink"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="שליחה"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-pill bg-action text-on-action transition-colors hover:bg-action-hover disabled:opacity-40"
              >
                <SendHorizontal strokeWidth={1.75} size={16} className="-scale-x-100" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
