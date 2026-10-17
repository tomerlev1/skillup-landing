import { describe, expect, it } from "vitest";
import { resolveTheme, themeInitScript, THEME_STORAGE_KEY } from "@/lib/theme";

describe("resolveTheme", () => {
  it("honours explicit preferences", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("follows the system for 'system'", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("themeInitScript", () => {
  it("reads the storage key and sets data-theme", () => {
    expect(THEME_STORAGE_KEY).toBe("skillup-theme");
    expect(themeInitScript).toContain("skillup-theme");
    expect(themeInitScript).toContain("data-theme");
  });
});
