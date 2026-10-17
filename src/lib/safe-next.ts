/**
 * Post-auth redirect target. Only same-origin relative paths pass; anything
 * that a browser could read as another origin ("//x", "/\x", "https:",
 * "javascript:", control characters that browsers strip) falls back to "/".
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (/[\u0000-\u001f\u007f]/.test(raw)) return "/";
  const firstSlash = raw.indexOf("/");
  const colon = raw.indexOf(":");
  if (colon !== -1 && colon < firstSlash) return "/";
  return raw;
}
