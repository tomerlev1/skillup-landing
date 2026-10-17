import { describe, expect, it } from "vitest";
import {
  computeProgress,
  isDone,
  jerusalemMonthKey,
  profileCompleteness,
  type ProgressBooking,
} from "@/lib/progress";

const now = new Date("2026-10-17T12:00:00Z");

function b(over: Partial<ProgressBooking>): ProgressBooking {
  return {
    start_at: "2026-10-10T14:00:00Z",
    end_at: "2026-10-10T15:00:00Z",
    status: "completed",
    teacher_id: "t1",
    student_id: "s1",
    subject_id: "math",
    ...over,
  };
}

describe("progress", () => {
  it("counts completed and past-confirmed lessons as done", () => {
    expect(isDone(b({ status: "completed" }), now)).toBe(true);
    expect(isDone(b({ status: "confirmed" }), now)).toBe(true);
    expect(isDone(b({ status: "confirmed", start_at: "2026-10-20T14:00:00Z", end_at: "2026-10-20T15:00:00Z" }), now)).toBe(false);
    expect(isDone(b({ status: "pending" }), now)).toBe(false);
    expect(isDone(b({ status: "cancelled" }), now)).toBe(false);
  });

  it("sums hours, peers and subjects for a student", () => {
    const p = computeProgress(
      [
        b({}),
        b({ teacher_id: "t2", subject_id: "eng", end_at: "2026-10-10T15:30:00Z" }),
        b({ status: "cancelled", teacher_id: "t3" }),
      ],
      "student",
      now,
    );
    expect(p.completed).toBe(2);
    expect(p.hours).toBe(2.5);
    expect(p.peers).toBe(2);
    expect(p.subjects).toBe(2);
  });

  it("builds six months ending with the current Jerusalem month", () => {
    const p = computeProgress(
      [b({}), b({ start_at: "2026-08-03T10:00:00Z", end_at: "2026-08-03T11:00:00Z" }), b({ start_at: "2025-01-01T10:00:00Z", end_at: "2025-01-01T11:00:00Z" })],
      "student",
      now,
    );
    expect(p.monthly.map((m) => m.key)).toEqual(["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]);
    expect(p.monthly.find((m) => m.key === "2026-10")?.count).toBe(1);
    expect(p.monthly.find((m) => m.key === "2026-08")?.count).toBe(1);
    expect(p.monthly.at(-1)?.label).toBe("אוק׳");
  });

  it("wraps months across the year boundary", () => {
    const p = computeProgress([], "student", new Date("2026-02-10T10:00:00Z"));
    expect(p.monthly.map((m) => m.key)).toEqual(["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"]);
  });

  it("uses Jerusalem time for the month key", () => {
    // 22:30 UTC on 31 Oct is already 1 Nov 00:30 in Israel (UTC+2 after DST).
    expect(jerusalemMonthKey(new Date("2026-10-31T22:30:00Z"))).toBe("2026-11");
  });

  it("counts upcoming lessons and picks the next milestone", () => {
    const p = computeProgress(
      [b({}), b({ status: "confirmed", start_at: "2026-10-20T14:00:00Z", end_at: "2026-10-20T15:00:00Z" })],
      "student",
      now,
    );
    expect(p.upcoming).toBe(1);
    expect(p.nextMilestone?.target).toBe(5);
    expect(p.milestones[0].achieved).toBe(true);
  });

  it("uses distinct students as peers for a teacher", () => {
    const p = computeProgress([b({ student_id: "a" }), b({ student_id: "b" }), b({ student_id: "a" })], "teacher", now);
    expect(p.peers).toBe(2);
  });

  it("computes profile completeness", () => {
    expect(
      profileCompleteness([
        { label: "תמונה", done: true },
        { label: "עיר", done: false },
        { label: "קצת עליי", done: true },
        { label: "טלפון", done: false },
      ]),
    ).toEqual({ percent: 50, missing: ["עיר", "טלפון"] });
  });
});
