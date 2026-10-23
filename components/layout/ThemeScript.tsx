import { preferenceScript } from "@/lib/design/preferences";

export {
  CONTROL_STYLES,
  CONTROLS_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ControlStyle,
} from "@/lib/design/preferences";

/** Runs during HTML parsing, before first paint, so there is no theme flash. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: preferenceScript() }} />;
}
