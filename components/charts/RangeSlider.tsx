"use client";

import { useId, useState } from "react";
import { formatScore } from "./AxisBar";

const TICKS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * Input slider for −100…+100 (sandbox, axis tuning): a ruled track with tick
 * marks aligned to the thumb's travel, a thumb that grows while dragged, and a
 * bordered value readout that follows it. Arrow keys step; `snap` steps by
 * whole ticks (10 points).
 */
export function RangeSlider({
  label,
  negLabel,
  posLabel,
  initial = 0,
  snap = false,
  disabled,
}: {
  label: string;
  negLabel: string;
  posLabel: string;
  initial?: number;
  snap?: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const id = useId();
  const toward = value < 0 ? negLabel : value > 0 ? posLabel : null;
  const fraction = (value + 100) / 200;
  return (
    <div className={disabled ? "border-[1.5px] border-dashed border-ink p-3" : ""}>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <div className="relative mt-9">
        <output
          htmlFor={id}
          className="label absolute -top-8 border-[1.5px] border-ink bg-paper px-1.5 py-0.5 tabular-nums"
          style={{
            left: `clamp(1.75rem, calc(0.5rem + (100% - 1rem) * ${fraction}), calc(100% - 1.75rem))`,
            translate: "-50% 0",
          }}
        >
          {formatScore(value)}
        </output>
        <input
          id={id}
          type="range"
          min={-100}
          max={100}
          step={snap ? 10 : 1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-valuetext={toward ? `${formatScore(value)} · ${toward}` : formatScore(value)}
          className="range disabled:cursor-not-allowed"
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
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm">
        <span>{negLabel}</span>
        <span className="text-right">{posLabel}</span>
      </div>
    </div>
  );
}
