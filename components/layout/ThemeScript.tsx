import { PALETTE } from "@/lib/design/tokens";

export const THEME_STORAGE_KEY = "spectrum-theme";

const PAPER = { light: PALETTE.light.paper, dark: PALETTE.dark.paper };

// Runs during HTML parsing, before first paint, so there is no theme flash.
// Stored choice wins; otherwise the system preference applies. A stored choice
// also gets its own theme-color meta, placed first so the browser UI follows it.
const script = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_STORAGE_KEY}"),s=t==="light"||t==="dark";if(!s){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t);if(s){var m=document.createElement("meta");m.name="theme-color";m.content=${JSON.stringify(PAPER)}[t];m.setAttribute("data-theme-choice","");document.head.prepend(m)}}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
