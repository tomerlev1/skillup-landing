import { NextResponse } from "next/server";
import { SUPPORT_SYSTEM_PROMPT } from "@/lib/support/knowledge";

// LLM fallback for free-form support questions. Scripted topics answer
// instantly client-side; only unmatched questions reach this route.
// Without ANTHROPIC_API_KEY the route degrades gracefully — the widget
// then offers the leave-a-message escalation instead.

const MAX_MESSAGES = 12;
const MAX_CHARS = 1200;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ unavailable: true }, { status: 200 });
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter(
      (m): m is IncomingMessage =>
        Boolean(m) &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system: SUPPORT_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ unavailable: true }, { status: 200 });
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("")
      .trim();

    if (!text) return NextResponse.json({ unavailable: true }, { status: 200 });
    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json({ unavailable: true }, { status: 200 });
  }
}
