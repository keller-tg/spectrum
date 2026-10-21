export const THEME_STORAGE_KEY = "spectrum-theme";

// Runs during HTML parsing, before first paint, so there is no theme flash.
// Stored choice wins; otherwise the system preference applies.
const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
