import { describe, expect, it } from "vitest";
import {
  addDays,
  dayPayload,
  hhmm,
  span,
  wallClock,
  weekStart,
  weekdayOf,
} from "@/lib/teacher";

describe("wall clock (Jerusalem)", () => {
  it("converts an instant to Jerusalem date + minutes", () => {
    // 2026-10-21 14:30Z = 17:30 IDT (UTC+3)
    expect(wallClock("2026-10-21T14:30:00Z")).toEqual({ date: "2026-10-21", minutes: 17 * 60 + 30 });
  });
  it("rolls the date over near midnight", () => {
    // 22:30Z = 01:30 next day in Jerusalem (summer time)
    expect(wallClock("2026-07-01T22:30:00Z").date).toBe("2026-07-02");
  });
  it("treats a slot ending at midnight as minute 1440", () => {
    expect(span("2026-10-21T20:00:00Z", "2026-10-21T21:00:00Z")).toEqual({
      date: "2026-10-21",
      start: 23 * 60,
      end: 1440,
    });
  });
});

describe("calendar dates", () => {
  it("weeks start on Sunday", () => {
    expect(weekdayOf("2026-10-18")).toBe(0);
    expect(weekStart("2026-10-21")).toBe("2026-10-18");
    expect(weekStart("2026-10-18")).toBe("2026-10-18");
  });
  it("adds days across months", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-11-02", -3)).toBe("2026-10-30");
  });
  it("formats minutes as HH:mm, wrapping midnight", () => {
    expect(hhmm(9 * 60 + 5)).toBe("09:05");
    expect(hhmm(1440)).toBe("00:00");
  });
});

describe("dayPayload", () => {
  const open = { start_at: "2026-10-21T06:00:00Z", end_at: "2026-10-21T07:00:00Z", is_booked: false, allowed_modes: ["online"] };
  const booked = { start_at: "2026-10-21T08:00:00Z", end_at: "2026-10-21T09:00:00Z", is_booked: true };

  it("never sends booked slots and keeps existing open ones with their modes", () => {
    expect(dayPayload([open, booked], {})).toEqual([
      { start_time: "09:00", end_time: "10:00", allowed_modes: ["online"] },
    ]);
  });
  it("adds a new slot in time order", () => {
    const out = dayPayload([open], { add: { start: 7 * 60, end: 8 * 60, modes: ["online", "teacher_home"] } });
    expect(out.map((s) => s.start_time)).toEqual(["07:00", "09:00"]);
    expect(out[0].allowed_modes).toEqual(["online", "teacher_home"]);
  });
  it("removes a slot by its start", () => {
    expect(dayPayload([open], { removeStartAt: open.start_at })).toEqual([]);
  });
});
