"use client";

import { useSyncExternalStore } from "react";
import { CONTROL_STYLES, CONTROLS_STORAGE_KEY, type ControlStyle } from "@/lib/design/preferences";
import { Segmented } from "@/components/ui/Segmented";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-controls"],
  });
  return () => observer.disconnect();
}

const current = () =>
  (document.documentElement.getAttribute("data-controls") as ControlStyle | null) ?? "sharp";

function choose(style: ControlStyle) {
  document.documentElement.setAttribute("data-controls", style);
  try {
    localStorage.setItem(CONTROLS_STORAGE_KEY, style);
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
}

/** "[ SHARP / PILL / OFFSET ]": review-only switch for the whole site's control style. */
export function ControlsSwitch({ labels }: { labels: Record<ControlStyle | "label", string> }) {
  const style = useSyncExternalStore(subscribe, current, () => null);
  return (
    <Segmented<ControlStyle>
      label={labels.label}
      seg="controls"
      value={style}
      onChange={choose}
      options={CONTROL_STYLES.map((value) => ({ value, label: labels[value] }))}
    />
  );
}
