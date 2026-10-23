import type { Locale } from "@/data/locales";
import { SPECTRUMS, type SpectrumId, type SpectrumShape } from "@/data/spectrums";

/**
 * The nine spectrum markers on a 16×16 box (D-077). Outline shapes are filled
 * with paper so they knock out halftone dots behind them; the two filled shapes
 * mark the outer ends of the left–right line. Never used without the code.
 */
const SHAPES: Record<SpectrumShape, { d: string; solid?: boolean }> = {
  "square-filled": { d: "M2 2h12v12H2z", solid: true },
  square: { d: "M2 2h12v12H2z" },
  circle: { d: "M8 1.75a6.25 6.25 0 1 1 0 12.5a6.25 6.25 0 1 1 0-12.5z" },
  diamond: { d: "M8 1 15 8 8 15 1 8z" },
  "diamond-filled": { d: "M8 1 15 8 8 15 1 8z", solid: true },
  bowtie: { d: "M1.5 2.5 8 8l-6.5 5.5zM14.5 2.5 8 8l6.5 5.5z" },
  "triangle-up": { d: "M8 1.5 15 14H1z" },
  "triangle-down": { d: "M1 2h14L8 14.5z" },
  hexagon: { d: "M8 1 14.1 4.5v7L8 15 1.9 11.5v-7z" },
};

/** The shape as SVG children, for use inside a chart (centred on x, y). */
export function SpectrumShapeG({
  id,
  x,
  y,
  size = 14,
  inverted = false,
  hollow = "paper",
}: {
  id: SpectrumId;
  x: number;
  y: number;
  size?: number;
  /** Selected nodes: paper shape on an ink block. */
  inverted?: boolean;
  /** Fill of outline shapes: paper (knocks out what is behind) or none (overlaps stay visible). */
  hollow?: "paper" | "none";
}) {
  const shape = SHAPES[SPECTRUMS[id].shape];
  const ink = inverted ? "var(--paper)" : "var(--ink)";
  const paper = inverted ? "var(--ink)" : "var(--paper)";
  const s = size / 16;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}>
      {inverted ? <rect x="-3" y="-3" width="22" height="22" fill="var(--ink)" /> : null}
      <path
        d={shape.d}
        fill={shape.solid ? ink : hollow === "none" ? "none" : paper}
        stroke={ink}
        strokeWidth={Math.min(3, 1.75 / s)}
        strokeLinejoin="miter"
      />
    </g>
  );
}

/** A standalone marker. */
export function SpectrumMarker({ id, size = 16 }: { id: SpectrumId; size?: number }) {
  return (
    <svg
      viewBox="-1 -1 18 18"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <SpectrumShapeG id={id} x={8} y={8} size={16} />
    </svg>
  );
}

/** Marker + code + name: the only way a spectrum is ever labelled. */
export function SpectrumTag({
  id,
  locale,
  withName = true,
}: {
  id: SpectrumId;
  locale: Locale;
  withName?: boolean;
}) {
  const spectrum = SPECTRUMS[id];
  return (
    <span className="inline-flex items-center gap-2 border-2 border-ink px-2 py-0.5">
      <SpectrumMarker id={id} size={14} />
      <span className="label">{spectrum.code[locale]}</span>
      {withName ? <span className="text-sm">{spectrum.name[locale]}</span> : null}
    </span>
  );
}
