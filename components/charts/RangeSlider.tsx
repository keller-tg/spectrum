"use client";

import { useId, useState } from "react";
import { formatScore } from "./AxisBar";

const TICKS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Input slider for −100…+100 (sandbox, Phase 10): a ruled track, a solid
 * rectangular thumb, tick marks aligned to the thumb's travel and the value.
 */
export function RangeSlider({
  label,
  negLabel,
  posLabel,
  initial = 0,
  step = 5,
  disabled,
}: {
  label: string;
  negLabel: string;
  posLabel: string;
  initial?: number;
  step?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const id = useId();
  const toward = value < 0 ? negLabel : value > 0 ? posLabel : null;
  return (
    <div className={disabled ? "border-2 border-dashed border-ink p-2" : ""}>
      <div className="label flex items-baseline justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="text-base tabular-nums">
          {formatScore(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={-100}
        max={100}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-valuetext={toward ? `${formatScore(value)} · ${toward}` : formatScore(value)}
        className="range mt-1 disabled:cursor-not-allowed"
      />
      <div aria-hidden="true" className="relative h-3">
        {TICKS.map((f) => (
          <span
            key={f}
            className={`absolute top-0 w-px bg-ink ${f === 0.5 ? "h-3" : f % 0.25 === 0 ? "h-2" : "h-1"}`}
            style={{ left: `calc(0.5rem + (100% - 1rem) * ${f})` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm">
        <span>{negLabel}</span>
        <span className="text-right">{posLabel}</span>
      </div>
    </div>
  );
}
