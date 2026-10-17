import { describe, expect, it } from "vitest";
import { bookHref, resolvePreselectedSlot, slotFitsMode, submitLabel } from "../booking";
import type { AvailabilitySlot } from "../types";

describe("bookHref", () => {
  it("without a slot", () => {
    expect(bookHref("t1")).toBe("/tutors/t1/book");
  });
  it("encodes the slot id", () => {
    expect(bookHref("t1", "s 2")).toBe("/tutors/t1/book?slot=s%202");
  });
});

function slot(id: string, over: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
  return {
    id,
    teacher_id: "t1",
    start_at: "2099-01-01T10:00:00Z",
    end_at: "2099-01-01T11:00:00Z",
    is_booked: false,
    allowed_modes: null,
    ...over,
  };
}

describe("resolvePreselectedSlot", () => {
  const s1 = slot("s1");
  const slots = [s1, slot("s2")];
  it("no slot id → nothing preselected, not stale", () => {
    expect(resolvePreselectedSlot(slots, undefined)).toEqual({ slot: null, stale: false });
  });
  it("unknown slot id → stale", () => {
    expect(resolvePreselectedSlot(slots, "missing")).toEqual({ slot: null, stale: true });
  });
  it("known slot id → that slot", () => {
    expect(resolvePreselectedSlot(slots, "s1")).toEqual({ slot: s1, stale: false });
  });
  it("booked slot → stale", () => {
    expect(resolvePreselectedSlot([slot("s1", { is_booked: true })], "s1")).toEqual({
      slot: null,
      stale: true,
    });
  });
  it("past slot → stale", () => {
    const past = slot("s1", { start_at: "2000-01-01T10:00:00Z" });
    expect(resolvePreselectedSlot([past], "s1")).toEqual({ slot: null, stale: true });
  });
});

describe("submitLabel", () => {
  it("one request", () => {
    expect(submitLabel("רותם", 1)).toBe("שליחת בקשה לרותם");
  });
  it("several requests", () => {
    expect(submitLabel("רותם", 2)).toBe("שליחת 2 בקשות לרותם");
  });
});

describe("slotFitsMode", () => {
  it("mode not allowed", () => {
    expect(slotFitsMode(slot("a", { allowed_modes: ["online"] }), "student_home")).toBe(false);
  });
  it("mode allowed", () => {
    expect(slotFitsMode(slot("a", { allowed_modes: ["online"] }), "online")).toBe(true);
  });
  it("no restriction", () => {
    expect(slotFitsMode(slot("a", { allowed_modes: null }), "online")).toBe(true);
    expect(slotFitsMode(slot("a", { allowed_modes: [] }), "online")).toBe(true);
  });
  it("no mode chosen yet", () => {
    expect(slotFitsMode(slot("a", { allowed_modes: ["online"] }), null)).toBe(true);
  });
});
