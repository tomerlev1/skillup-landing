export type ThemePref = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "skillup-theme";

export function resolveTheme(
  pref: ThemePref,
  systemDark: boolean,
): "light" | "dark" {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

/**
 * Inline <head> script: sets data-theme on <html> before first paint.
 * "system" is represented by a missing/invalid stored value.
 */
export const themeInitScript = `(function(){try{var p=null;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=p==="light"||p==="dark"?p:(d?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;
