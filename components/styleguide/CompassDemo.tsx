import { AXES, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { SPECTRUM_IDS, SPECTRUMS } from "@/data/spectrums";
import { SpectrumShapeG } from "@/components/charts/SpectrumMarker";
import { formatScore } from "@/components/charts/AxisBar";
import { halftoneRadius } from "@/components/charts/patterns";
import { Table } from "@/components/ui/Table";
import { loadIdeologies } from "@/lib/catalog/ideologies";

/**
 * Static preview of the Phase 4 compass encodings on real anchor data:
 * halftone density (bigger dots = more ideologies nearby), spectrum markers,
 * "you" (circle sized by uncertainty, with crosshair), the trail of past
 * results (dashed, arrowheads, dates, sparser dots with age) and a ghost.
 */
const X: AxisId = "distribution";
const Y: AxisId = "liberty";
const SIZE = 400;
const PAD = 20;
const CELL = 16;
const BANDWIDTH = 12;
/** Densities below this share of the maximum print no dot, so sparse areas stay clean. */
const FLOOR = 0.12;

const px = (v: number) => PAD + ((v + 100) / 200) * SIZE;
const py = (v: number) => PAD + ((100 - v) / 200) * SIZE;

const YOU = { x: -30, y: -20, confidence: 0.62 };
const TRAIL = [
  { x: -58, y: 14, date: "2026-01" },
  { x: -47, y: 2, date: "2026-04" },
  { x: -38, y: -10, date: "2026-07" },
] as const;
const GHOST = { x: 34, y: 30, confidence: 0.7 };
/** Older segments are sparser: the last entry belongs to the newest segment. */
const DASHES = ["1 5", "2 4", "6 3"] as const;

const radius = (confidence: number) => 10 + (1 - confidence) * 50;

export function CompassDemo({
  locale,
  idPrefix,
  labels,
}: {
  locale: Locale;
  /** Keeps ids unique when the demo appears more than once on a page. */
  idPrefix: string;
  labels: {
    title: string;
    summary: string;
    you: string;
    ghost: string;
    data: string;
    point: string;
  };
}) {
  const ideologies = loadIdeologies();
  const points = ideologies.map((e) => [e.coords[X], e.coords[Y]] as const);

  // Gaussian kernel density on a grid of halftone cells.
  const n = SIZE / CELL;
  const grid: number[] = [];
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++) {
      const vx = -100 + ((col + 0.5) / n) * 200;
      const vy = 100 - ((row + 0.5) / n) * 200;
      let d = 0;
      for (const [ex, ey] of points)
        d += Math.exp(-((vx - ex) ** 2 + (vy - ey) ** 2) / (2 * BANDWIDTH ** 2));
      grid.push(d);
    }
  const max = Math.max(...grid);

  const markers = SPECTRUM_IDS.flatMap((s) => {
    const entry = ideologies.find((e) => e.spectrum === s);
    return entry ? [{ spectrum: s, entry }] : [];
  });

  const steps = [...TRAIL, { ...YOU, date: "" }];
  const r = radius(YOU.confidence);
  const halo = { stroke: "var(--paper)", strokeWidth: 4, paintOrder: "stroke" } as const;
  const x = AXES[X];
  const y = AXES[Y];

  return (
    <figure>
      <p className="label text-center">+ {y.pos.short[locale]}</p>
      <svg
        viewBox={`0 0 ${SIZE + 2 * PAD} ${SIZE + 2 * PAD}`}
        role="img"
        aria-labelledby={`${idPrefix}-compass-title ${idPrefix}-compass-desc`}
        className="mx-auto mt-1 h-auto w-full max-w-lg font-mono"
      >
        <title id={`${idPrefix}-compass-title`}>{labels.title}</title>
        <desc id={`${idPrefix}-compass-desc`}>{labels.summary}</desc>
        <defs>
          <marker
            id={`${idPrefix}-compass-arrow`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10z" fill="currentColor" />
          </marker>
        </defs>

        <g fill="currentColor">
          {grid.map((d, i) => {
            const level = Math.max(0, (d / max - FLOOR) / (1 - FLOOR));
            const rr = halftoneRadius(level, CELL - 4);
            if (rr < 0.6) return null;
            const col = i % n;
            const row = Math.floor(i / n);
            return (
              <circle key={i} cx={PAD + (col + 0.5) * CELL} cy={PAD + (row + 0.5) * CELL} r={rr} />
            );
          })}
        </g>

        <g fill="none" stroke="currentColor">
          <rect x={PAD} y={PAD} width={SIZE} height={SIZE} strokeWidth="2" />
          <line x1={px(0)} y1={PAD} x2={px(0)} y2={PAD + SIZE} strokeWidth="1" />
          <line x1={PAD} y1={py(0)} x2={PAD + SIZE} y2={py(0)} strokeWidth="1" />
        </g>

        {markers.map(({ spectrum, entry }) => {
          const mx = px(entry.coords[X]);
          const my = py(entry.coords[Y]);
          const left = mx > PAD + SIZE * 0.85;
          return (
            <g key={spectrum}>
              <circle cx={mx} cy={my} r="11" fill="var(--paper)" />
              <SpectrumShapeG id={spectrum} x={mx} y={my} size={14} />
              <text
                x={left ? mx - 12 : mx + 12}
                y={my + 4}
                textAnchor={left ? "end" : "start"}
                fontSize="11"
                fontWeight="700"
                fill="currentColor"
                {...halo}
              >
                {SPECTRUMS[spectrum].code[locale]}
              </text>
            </g>
          );
        })}

        {/* Trail: one segment per step, stopping short of each point, on a paper underlay. */}
        {steps.slice(1).map((to, i) => {
          const from = steps[i] as (typeof steps)[number];
          const x1 = px(from.x);
          const y1 = py(from.y);
          const x2 = px(to.x);
          const y2 = py(to.y);
          const len = Math.hypot(x2 - x1, y2 - y1);
          const end = i === steps.length - 2 ? r + 4 : 7;
          const ux = (x2 - x1) / len;
          const uy = (y2 - y1) / len;
          const ends = { x1: x1 + ux * 7, y1: y1 + uy * 7, x2: x2 - ux * end, y2: y2 - uy * end };
          return (
            <g key={i} fill="none">
              <line {...ends} stroke="var(--paper)" strokeWidth="6" />
              <line
                {...ends}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray={DASHES[i]}
                markerEnd={`url(#${idPrefix}-compass-arrow)`}
              />
            </g>
          );
        })}
        {TRAIL.map((p) => (
          <g key={p.date}>
            <rect
              x={px(p.x) - 4}
              y={py(p.y) - 4}
              width="8"
              height="8"
              fill="var(--paper)"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text x={px(p.x) - 8} y={py(p.y) - 9} fontSize="11" fill="currentColor" {...halo}>
              {p.date}
            </text>
          </g>
        ))}

        {/* You: radius from confidence, crosshair through the centre. */}
        <g stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx={px(YOU.x)} cy={py(YOU.y)} r={r} fill="var(--paper)" />
          <line x1={px(YOU.x) - r - 10} y1={py(YOU.y)} x2={px(YOU.x) - 5} y2={py(YOU.y)} />
          <line x1={px(YOU.x) + 5} y1={py(YOU.y)} x2={px(YOU.x) + r + 10} y2={py(YOU.y)} />
          <line x1={px(YOU.x)} y1={py(YOU.y) - r - 10} x2={px(YOU.x)} y2={py(YOU.y) - 5} />
          <line x1={px(YOU.x)} y1={py(YOU.y) + 5} x2={px(YOU.x)} y2={py(YOU.y) + r + 10} />
        </g>
        <text
          x={px(YOU.x) + r + 6}
          y={py(YOU.y) + r + 12}
          fontSize="12"
          fontWeight="700"
          fill="currentColor"
          {...halo}
        >
          {labels.you}
        </text>

        {/* Ghost compare: hollow and dashed, no crosshair. */}
        <circle
          cx={px(GHOST.x)}
          cy={py(GHOST.y)}
          r={radius(GHOST.confidence)}
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <rect
          x={px(GHOST.x) - 4}
          y={py(GHOST.y) - 4}
          width="8"
          height="8"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={px(GHOST.x) + radius(GHOST.confidence) + 4}
          y={py(GHOST.y) - radius(GHOST.confidence) + 4}
          fontSize="12"
          fontWeight="700"
          fill="currentColor"
          {...halo}
        >
          {labels.ghost}
        </text>
      </svg>
      <p className="label mt-1 text-center">− {y.neg.short[locale]}</p>
      <p className="label mt-1 flex justify-between">
        <span>− {x.neg.short[locale]}</span>
        <span>{x.pos.short[locale]} +</span>
      </p>
      <details className="mt-3">
        <summary className="label inline-flex min-h-11 items-center hover:bg-ink hover:text-paper">
          {labels.data}
        </summary>
        <Table
          id={`${idPrefix}-compass-table`}
          className="mt-2"
          caption={labels.title}
          columns={[
            { key: "point", header: labels.point },
            { key: "x", header: x.code[locale], numeric: true },
            { key: "y", header: y.code[locale], numeric: true },
          ]}
          rows={[
            [labels.you, formatScore(YOU.x), formatScore(YOU.y)],
            ...TRAIL.map((p) => [p.date, formatScore(p.x), formatScore(p.y)]),
            [labels.ghost, formatScore(GHOST.x), formatScore(GHOST.y)],
            ...markers.map(({ spectrum, entry }) => [
              `${SPECTRUMS[spectrum].code[locale]} · ${entry.names[locale] ?? entry.names.en}`,
              formatScore(entry.coords[X]),
              formatScore(entry.coords[Y]),
            ]),
          ]}
        />
      </details>
    </figure>
  );
}
