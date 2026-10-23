"use client";

import { SegmentIndicator } from "./Segmented";

/** An on/off switch drawn as a two-segment control; the indicator slides to the active word. */
export function Toggle({
  label,
  onText,
  offText,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  onText: string;
  offText: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className="label group flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 text-left aria-disabled:cursor-not-allowed"
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className="seg group-aria-disabled:border-dashed"
        style={{ "--seg-i": checked ? 0 : 1, "--seg-n": 2 } as React.CSSProperties}
      >
        <span className="seg-opt">{onText}</span>
        <span className="seg-opt">{offText}</span>
        <SegmentIndicator />
      </span>
    </button>
  );
}
