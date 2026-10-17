import { describe, expect, it } from "vitest";
import { safeNextPath } from "../safe-next";

describe("safeNextPath", () => {
  it("keeps a same-origin path with a query", () => {
    expect(safeNextPath("/tutors/a/book?slot=1")).toBe("/tutors/a/book?slot=1");
  });
  it("keeps the root", () => {
    expect(safeNextPath("/")).toBe("/");
  });
  it.each([
    "//evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "/\\evil.com",
    "evil.com/path",
    "",
    "/\t/evil.com",
    "/\n/evil.com",
  ])("rejects %j", (raw) => {
    expect(safeNextPath(raw)).toBe("/");
  });
  it("rejects null and undefined", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });
});
