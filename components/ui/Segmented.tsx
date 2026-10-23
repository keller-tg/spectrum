"use client";

import { useRef } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

const KEYS: Record<string, (i: number, n: number) => number> = {
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowDown: (i, n) => (i + 1) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  ArrowUp: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
};

/** Classes and the inverted indicator layer shared by every segmented control. */
export function SegmentIndicator({ labels }: { labels: readonly string[] }) {
  return (
    <span className="seg-ind" aria-hidden="true">
      {labels.map((label, i) => (
        <span key={i}>{label}</span>
      ))}
    </span>
  );
}

/**
 * Segmented control with radiogroup semantics: equal segments, a sliding
 * inverted indicator, roving focus and arrow-key selection. `seg` names a
 * control whose position CSS already knows before hydration (theme, control
 * style); those get no inline index.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  seg,
  className = "",
}: {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  seg?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = options.findIndex((o) => o.value === value);
  const style = {
    "--seg-n": options.length,
    ...(seg ? {} : { "--seg-i": Math.max(0, index) }),
  } as React.CSSProperties;

  const onKeyDown = (event: React.KeyboardEvent, i: number) => {
    const move = KEYS[event.key];
    if (!move) return;
    event.preventDefault();
    const next = move(i, options.length);
    refs.current[next]?.focus();
    const option = options[next];
    if (option) onChange(option.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`seg ${className}`}
      data-seg={seg}
      style={style}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          tabIndex={i === index || (index < 0 && i === 0) ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className="seg-opt"
        >
          {o.label}
        </button>
      ))}
      <SegmentIndicator labels={options.map((o) => o.label)} />
    </div>
  );
}
