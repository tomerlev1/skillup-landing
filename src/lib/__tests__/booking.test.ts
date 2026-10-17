import { describe, expect, it } from "vitest";
import { bookHref } from "../booking";

describe("bookHref", () => {
  it("without a slot", () => {
    expect(bookHref("t1")).toBe("/tutors/t1/book");
  });
  it("encodes the slot id", () => {
    expect(bookHref("t1", "s 2")).toBe("/tutors/t1/book?slot=s%202");
  });
});
