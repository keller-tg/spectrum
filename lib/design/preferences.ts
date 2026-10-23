import { PALETTE } from "./tokens";

/**
 * Per-browser display preferences that live on <html> (D-082): the theme and
 * the review-only control style. They are applied by one self-contained
 * function, run twice:
 * - as the inline pre-paint script (no flash on load), and
 * - by <PreferenceSync /> in the root layout, on every mount of that layout.
 *
 * Why both: the [locale] layout renders <html>, so a language switch remounts
 * it, and React 19 strips every attribute it does not render from the <html>
 * singleton. The attributes set by the inline script would be lost and the
 * script does not run again on a client-side navigation.
 */
export const THEME_STORAGE_KEY = "spectrum-theme";
export const CONTROLS_STORAGE_KEY = "spectrum-controls";
export const CONTROL_STYLES = ["sharp", "pill", "offset"] as const;
export type ControlStyle = (typeof CONTROL_STYLES)[number];

export interface PreferenceConfig {
  themeKey: string;
  controlsKey: string;
  styles: readonly string[];
  paper: { light: string; dark: string };
}

export const PREFERENCES: PreferenceConfig = {
  themeKey: THEME_STORAGE_KEY,
  controlsKey: CONTROLS_STORAGE_KEY,
  styles: CONTROL_STYLES,
  paper: { light: PALETTE.light.paper, dark: PALETTE.dark.paper },
};

/**
 * Must stay self-contained (no imports, no closures): its source is inlined
 * into the pre-paint script. A stored theme wins over the system preference
 * and gets its own theme-color meta, placed first so the browser UI follows it.
 */
export function applyPreferences(c: PreferenceConfig): void {
  const d = document.documentElement;
  try {
    let theme = localStorage.getItem(c.themeKey);
    const stored = theme === "light" || theme === "dark";
    if (!stored) theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    d.setAttribute("data-theme", theme as string);
    if (stored) {
      let meta = document.querySelector("meta[data-theme-choice]");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        meta.setAttribute("data-theme-choice", "");
        document.head.prepend(meta);
      }
      meta.setAttribute("content", theme === "dark" ? c.paper.dark : c.paper.light);
    }
    const style = localStorage.getItem(c.controlsKey);
    d.setAttribute("data-controls", style && c.styles.indexOf(style) > 0 ? style : "sharp");
  } catch {
    if (!d.hasAttribute("data-theme"))
      d.setAttribute(
        "data-theme",
        matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      );
    d.setAttribute("data-controls", "sharp");
  }
}

/** The inline script: the same function, serialized with its configuration. */
export const preferenceScript = () =>
  `(${applyPreferences.toString()})(${JSON.stringify(PREFERENCES)})`;
