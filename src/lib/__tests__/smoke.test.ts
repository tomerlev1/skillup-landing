import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

describe("test harness smoke", () => {
  it("formats a price containing 150", () => {
    expect(formatPrice(150)).toContain("150");
  });
});
