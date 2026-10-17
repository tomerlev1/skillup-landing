export interface CalendarEvent {
  uid: string;
  title: string;
  startIso: string;
  endIso: string;
  description?: string;
}

/** "2026-10-21T14:00:00Z" → "20261021T140000Z" (UTC, basic format). */
function utcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 TEXT escaping. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * A calendar file with one VEVENT per event, built in the browser (no server
 * round-trip). Accepts a single event or a list (e.g. every created booking).
 */
export function buildIcs(events: CalendarEvent | CalendarEvent[]): string {
  const list = Array.isArray(events) ? events : [events];
  const stamp = utcStamp(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillUp//Booking//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...list.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(e.startIso)}`,
      `DTEND:${utcStamp(e.endIso)}`,
      `SUMMARY:${escapeText(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** "Add to Google Calendar" template link for the same event. */
export function googleCalendarUrl(e: CalendarEvent): string {
  const params = [
    "action=TEMPLATE",
    `text=${encodeURIComponent(e.title)}`,
    `dates=${utcStamp(e.startIso)}/${utcStamp(e.endIso)}`,
    `details=${encodeURIComponent(e.description ?? "")}`,
  ];
  return `https://calendar.google.com/calendar/render?${params.join("&")}`;
}
