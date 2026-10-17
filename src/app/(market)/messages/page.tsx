import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, MessageCircle, MessagesSquare } from "lucide-react";
import AccountHeader from "@/components/page/AccountHeader";
import Avatar from "@/components/ui/Avatar";
import { getConversations } from "@/lib/data/messaging";
import { getSessionProfile } from "@/lib/data/session";
import { formatRelative } from "@/lib/format";

export const metadata: Metadata = {
  title: "הודעות | SkillUp",
  robots: { index: false },
};

export default async function MessagesPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/messages");

  const conversations = await getConversations(profile);

  return (
    <>
      <AccountHeader
        icon={MessagesSquare}
        tone="bg-tint-sky text-tint-sky-fg"
        title="הודעות"
        subtitle={
          conversations.length
            ? `${conversations.length} שיחות${conversations.some((c) => c.unread > 0) ? ` · ${conversations.filter((c) => c.unread > 0).length} עם הודעות חדשות` : ""}`
            : "השיחות שלכם עם מורים ותלמידים"
        }
      />
    <div className="relative mx-auto max-w-[960px] px-4 pb-16 sm:px-6">

      {conversations.length === 0 ? (
        <div className="mt-4 rounded-[var(--r-lg)] bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)] ring-1 ring-line/60">
          <span className="mx-auto grid size-16 place-items-center rounded-[var(--r-lg)] bg-tint-sky text-tint-sky-fg"><MessageCircle strokeWidth={2} size={30} /></span>
          <h2 className="mt-4 text-lg font-semibold text-ink">
            עדיין אין שיחות
          </h2>
          <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-ink-2">
            {profile.role === "teacher"
              ? "כשתלמידים יפנו אליכם, השיחות יופיעו כאן."
              : "מצאתם מורה מעניין? שלחו הודעה מהפרופיל שלו והשיחה תופיע כאן."}
          </p>
          {profile.role === "student" && (
            <Link
              href="/search"
              className="mt-6 inline-flex h-11 items-center rounded-[var(--r-pill)] bg-action px-6 text-[15px] font-bold text-on-action shadow-[0_10px_24px_-12px_rgba(79,70,229,0.85)] transition-colors hover:bg-action-hover"
            >
              למציאת מורה
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-line/70 overflow-hidden rounded-[var(--r-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/60">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className={`group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-brand-50 sm:px-6 ${c.unread > 0 ? "bg-brand-50/60" : ""}`}
              >
                <span className="relative shrink-0">
                  <Avatar src={c.peerAvatar} name={c.peerName} size={52} />
                  {c.unread > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 size-3.5 rounded-full bg-action ring-2 ring-surface" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={`truncate text-base ${
                        c.unread > 0 ? "font-black" : "font-bold"
                      } text-ink`}
                    >
                      {c.peerName}
                    </span>
                    {c.last_message_at && (
                      <span className="shrink-0 text-sm text-ink-3">
                        {formatRelative(c.last_message_at)}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-3">
                    <span
                      className={`truncate text-sm ${
                        c.unread > 0
                          ? "font-medium text-ink"
                          : "text-ink-3"
                      }`}
                    >
                      {c.last_message_preview ?? "שיחה חדשה"}
                    </span>
                    {c.unread > 0 && (
                      <span className="tnum grid h-6 min-w-6 shrink-0 place-items-center rounded-[var(--r-pill)] bg-action px-1.5 text-xs font-bold text-on-action shadow-[0_6px_14px_-8px_rgba(79,70,229,0.9)]">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
                <ChevronLeft strokeWidth={2} size={18} aria-hidden="true" className="shrink-0 text-ink-3 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}
