import { describe, expect, it } from "vitest";
import { buildIcs, googleCalendarUrl } from "../ics";

const event = {
  uid: "b1@skillup",
  title: "שיעור מתמטיקה, עם רותם",
  startIso: "2026-10-21T14:00:00Z",
  endIso: "2026-10-21T15:00:00Z",
  description: "שורה ראשונה\nשורה; שנייה",
};

describe("buildIcs", () => {
  const ics = buildIcs(event);
  it("is a VCALENDAR with one VEVENT", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });
  it("uses UTC basic-format times", () => {
    expect(ics).toContain("DTSTART:20261021T140000Z");
    expect(ics).toContain("DTEND:20261021T150000Z");
  });
  it("uses CRLF line endings only", () => {
    expect(ics).toContain("\r\n");
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });
  it("escapes text", () => {
    expect(ics).toContain("SUMMARY:שיעור מתמטיקה\\, עם רותם");
    expect(ics).toContain("DESCRIPTION:שורה ראשונה\\nשורה\\; שנייה");
  });
  it("escapes each special character with a literal backslash", () => {
    const one = (title: string) =>
      buildIcs({ ...event, title }).split("\r\n").find((l) => l.startsWith("SUMMARY:"));
    expect(one("a;b")).toBe("SUMMARY:a" + String.fromCharCode(92) + ";b");
    expect(one("a,b")).toBe("SUMMARY:a" + String.fromCharCode(92) + ",b");
    expect(one("a\\b")).toBe("SUMMARY:a" + String.fromCharCode(92, 92) + "b");
    expect(one("a\nb")).toBe("SUMMARY:a" + String.fromCharCode(92) + "nb");
  });
  it("includes the uid", () => {
    expect(ics).toContain("UID:b1@skillup");
  });
});

describe("googleCalendarUrl", () => {
  const url = googleCalendarUrl(event);
  it("is a Google Calendar template link", () => {
    expect(url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE&text=")).toBe(true);
  });
  it("carries UTC dates", () => {
    expect(url).toContain("dates=20261021T140000Z/20261021T150000Z");
  });
  it("encodes the title and details", () => {
    expect(url).toContain(`text=${encodeURIComponent(event.title)}`);
    expect(url).toContain(`details=${encodeURIComponent(event.description)}`);
  });
});
