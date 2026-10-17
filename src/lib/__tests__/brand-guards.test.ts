/**
 * Brand v2 source guards (spec §7, §9, §12).
 *
 * Walks src/**\/*.{ts,tsx,css} and fails on any line that reintroduces a
 * retired brand pattern. Patterns are intentionally strict; when a match is
 * legitimately required, add a narrow, commented per-file exclusion below
 * instead of weakening the pattern.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../..");
const SRC = path.join(ROOT, "src");

/** Paths (relative to repo root, posix) excluded from every guard. */
const GLOBAL_EXCLUDES: RegExp[] = [
  /^src\/lib\/legal-content\.ts$/, // owner-supplied legal text, out of scope
  /^src\/lib\/__tests__\//, // tests (including this file) quote the patterns
  /^src\/app\/_og\//, // OG image renderer ships its own fonts
];

type Guard = {
  name: string;
  pattern: RegExp;
  /** Files (repo-relative, posix) where this one pattern is allowed. */
  allow?: Record<string, string>;
};

const GUARDS: Guard[] = [
  {
    name: "gendered slash in UI strings",
    pattern: /[א-ת]+\/(ה|ת|ית)(?![א-ת])/,
    allow: {
      // Compares against the literal default reviewer name the reviews RPC
      // returns ("תלמיד/ה") so it can be replaced with neutral copy.
      "src/lib/home-picks.ts": "matches DB output, never rendered",
    },
  },
  {
    name: "legacy marketplace/panel/dark/paper/mode tokens",
    pattern: /--mk-|--panel-|\bdark-\d|\bpaper-\d|\bmode-(online|teacher|student)\b/,
  },
  {
    name: "removed legacy components",
    pattern: /components\/landing|components\/layout\/(Navbar|Footer)|ui\/Button/,
  },
  {
    name: "retired fonts",
    pattern: /Heebo|JetBrains|font-heebo|font-mono-lc/,
    allow: {
      "src/app/opengraph-image.tsx": "OG image may keep its own fonts",
    },
  },
  {
    name: "retired star yellow",
    pattern: /amber-400|#F59E0B|#FBBF24/i,
  },
  {
    name: "retired effects / alert()",
    pattern: /title-gradient|orb-glow|alert\(/,
  },
  {
    name: "non-token radius",
    pattern: /rounded-(lg|xl|2xl|3xl|md)\b|rounded-\[(?!var\()/,
  },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC)
  .map((f) => path.relative(ROOT, f).split(path.sep).join("/"))
  .filter((rel) => !GLOBAL_EXCLUDES.some((re) => re.test(rel)))
  .sort();

function offenders(guard: Guard): string[] {
  const hits: string[] = [];
  for (const rel of FILES) {
    if (guard.allow && rel in guard.allow) continue;
    const lines = readFileSync(path.join(ROOT, rel), "utf8").split("\n");
    lines.forEach((line, i) => {
      if (guard.pattern.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  return hits;
}

describe("brand v2 source guards", () => {
  it("scans a non-trivial set of files", () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  for (const guard of GUARDS) {
    it(`no ${guard.name}`, () => {
      expect(offenders(guard)).toEqual([]);
    });
  }
});
