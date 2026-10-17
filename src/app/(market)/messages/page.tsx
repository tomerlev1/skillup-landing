import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
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
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
      <h1 className="font-ed text-2xl font-bold text-ink">הודעות</h1>

      {conversations.length === 0 ? (
        <div className="mt-10 rounded-[var(--r-md)] bg-canvas px-6 py-16 text-center">
          <MessageCircle strokeWidth={1.75} size={24} className="mx-auto text-ink-3" />
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
              className="mt-6 inline-flex h-11 items-center rounded-[var(--r-pill)] bg-action px-6 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
            >
              למציאת מורה
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[var(--r-md)] border border-line bg-surface">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-canvas"
              >
                <Avatar src={c.peerAvatar} name={c.peerName} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span
                      className={`truncate text-[15px] ${
                        c.unread > 0 ? "font-bold" : "font-semibold"
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
                      <span className="tnum grid h-5 min-w-5 shrink-0 place-items-center rounded-[var(--r-pill)] bg-action px-1.5 text-xs font-bold text-on-action">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
