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

describe("buildIcs with several events", () => {
  const second = {
    uid: "b2@skillup",
    title: "בקשת שיעור עם רותם",
    startIso: "2026-10-23T16:30:00Z",
    endIso: "2026-10-23T17:30:00Z",
  };
  const ics = buildIcs([event, second]);
  it("has one calendar with one VEVENT per event", () => {
    expect(ics.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(2);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });
  it("keeps each event's uid, times and title, in order", () => {
    expect(ics).toContain("UID:b1@skillup");
    expect(ics).toContain("UID:b2@skillup");
    expect(ics).toContain("DTSTART:20261023T163000Z");
    expect(ics).toContain("DTEND:20261023T173000Z");
    expect(ics).toContain("SUMMARY:בקשת שיעור עם רותם");
    expect(ics.indexOf("UID:b1@skillup")).toBeLessThan(ics.indexOf("UID:b2@skillup"));
  });
  it("omits DESCRIPTION only for the event without one", () => {
    expect(ics.match(/^DESCRIPTION:/gm)).toHaveLength(1);
  });
  it("matches the single-event form for a one-item list", () => {
    const strip = (s: string) => s.replace(/^DTSTAMP:.*$/m, "");
    expect(strip(buildIcs([event]))).toBe(strip(buildIcs(event)));
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
