import { HatchPattern } from "./patterns";

export interface SparkPoint {
  /** Milliseconds since epoch. */
  t: number;
  score: number;
  low: number;
  high: number;
}

const W = 240;
const H = 48;
const PAD = 4;

/**
 * One axis over time: the score as a line with dots, the likely range as a
 * hatched band, and the centre line dashed. Time runs left to right on a true
 * scale; one result shows as a single dot with its range. Ink only; the
 * description carries the numbers for screen readers.
 */
export function Sparkline({
  id,
  points,
  description,
}: {
  id: string;
  points: readonly SparkPoint[];
  description: string;
}) {
  const t0 = points[0]?.t ?? 0;
  const t1 = points.at(-1)?.t ?? t0;
  const span = Math.max(t1 - t0, 1);
  const x = (t: number) => (points.length < 2 ? W / 2 : PAD + ((t - t0) / span) * (W - 2 * PAD));
  const y = (v: number) => PAD + ((100 - v) / 200) * (H - 2 * PAD);
  const r = (v: number) => Math.round(v * 10) / 10;
  const band =
    points.length < 2
      ? null
      : [
          ...points.map((p) => `${r(x(p.t))},${r(y(p.high))}`),
          ...[...points].reverse().map((p) => `${r(x(p.t))},${r(y(p.low))}`),
        ].join(" ");
  const single = points.length === 1 ? points[0] : undefined;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={description}
      className="block h-12 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <HatchPattern id={`${id}-hatch`} gap={4} />
      </defs>
      <path
        d={`M0 ${y(0)}H${W}`}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
        vectorEffect="non-scaling-stroke"
      />
      {band ? (
        <polygon
          points={band}
          fill={`url(#${id}-hatch)`}
          stroke="currentColor"
          strokeWidth="0.75"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {single ? (
        <rect
          x={W / 2 - 6}
          y={r(y(single.high))}
          width="12"
          height={r(y(single.low) - y(single.high))}
          fill={`url(#${id}-hatch)`}
          stroke="currentColor"
          strokeWidth="0.75"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {points.length > 1 ? (
        <polyline
          points={points.map((p) => `${r(x(p.t))},${r(y(p.score))}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {/* Dots as zero-length square-capped strokes: they stay square however the chart stretches. */}
      {points.map((p) => (
        <g key={p.t} fill="none" vectorEffect="non-scaling-stroke">
          <path
            d={`M${r(x(p.t))} ${r(y(p.score))}h0`}
            stroke="var(--paper)"
            strokeWidth="8"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M${r(x(p.t))} ${r(y(p.score))}h0`}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}
