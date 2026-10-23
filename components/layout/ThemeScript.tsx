import { PALETTE } from "@/lib/design/tokens";

export const THEME_STORAGE_KEY = "spectrum-theme";
/** Review-only: which control style (sharp, pill, offset) the styleguide switch picked (D-080). */
export const CONTROLS_STORAGE_KEY = "spectrum-controls";
export const CONTROL_STYLES = ["sharp", "pill", "offset"] as const;
export type ControlStyle = (typeof CONTROL_STYLES)[number];

const PAPER = { light: PALETTE.light.paper, dark: PALETTE.dark.paper };

// Runs during HTML parsing, before first paint, so there is no flash.
// Theme: a stored choice wins, otherwise the system preference applies; a
// stored choice also gets its own theme-color meta, placed first. Control
// style: sharp unless the styleguide switch stored another.
const script = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_STORAGE_KEY}"),s=t==="light"||t==="dark";if(!s){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t);if(s){var m=document.createElement("meta");m.name="theme-color";m.content=${JSON.stringify(PAPER)}[t];m.setAttribute("data-theme-choice","");document.head.prepend(m)}var c=localStorage.getItem("${CONTROLS_STORAGE_KEY}");d.setAttribute("data-controls",${JSON.stringify(CONTROL_STYLES)}.indexOf(c)>0?c:"sharp")}catch(e){d.setAttribute("data-controls","sharp")}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
