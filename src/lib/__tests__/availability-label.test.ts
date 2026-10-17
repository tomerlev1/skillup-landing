import { describe, expect, it } from "vitest";
import {
  availabilityLabel,
  availabilityTime,
  jerusalemDateShort,
  jerusalemDayKey,
  jerusalemWeekday,
} from "../availability-label";

const now = new Date("2026-10-20T09:00:00Z");

describe("availabilityLabel", () => {
  it("today", () => {
    expect(availabilityLabel("2026-10-20T16:30:00Z", now)).toBe("יש מקום היום · 19:30");
  });
  it("tomorrow", () => {
    expect(availabilityLabel("2026-10-21T14:00:00Z", now)).toBe("יש מקום מחר · 17:00");
  });
  it("uses Jerusalem calendar day, not UTC", () => {
    expect(availabilityLabel("2026-10-20T21:30:00Z", now)).toBe("יש מקום מחר · 00:30");
  });
  it("weekday", () => {
    expect(availabilityLabel("2026-10-22T13:00:00Z", now)).toBe("יש מקום ביום ה׳ · 16:00");
  });
  it("saturday", () => {
    expect(availabilityLabel("2026-10-24T10:00:00Z", now)).toBe("יש מקום בשבת · 13:00");
  });
  it("null when 7 days ahead", () => {
    expect(availabilityLabel("2026-10-27T13:00:00Z", now)).toBeNull();
  });
  it("null when in the past", () => {
    expect(availabilityLabel("2026-10-20T08:00:00Z", now)).toBeNull();
  });
});

describe("availabilityTime", () => {
  it("formats Jerusalem 24h time", () => {
    expect(availabilityTime("2026-10-21T14:00:00Z")).toBe("17:00");
  });
});

describe("jerusalemDayKey", () => {
  it("uses the Jerusalem calendar day, not UTC", () => {
    expect(jerusalemDayKey("2026-10-20T21:30:00Z")).toBe("2026-10-21");
  });
  it("same day before midnight", () => {
    expect(jerusalemDayKey("2026-10-20T20:30:00Z")).toBe("2026-10-20");
  });
});

describe("jerusalem day labels", () => {
  it("weekday follows the Jerusalem day", () => {
    // 2026-10-21 is a Wednesday.
    expect(jerusalemWeekday("2026-10-20T21:30:00Z")).toBe("יום רביעי");
  });
  it("short date follows the Jerusalem day", () => {
    expect(jerusalemDateShort("2026-10-20T21:30:00Z")).toBe("21 באוקטובר");
  });
});
