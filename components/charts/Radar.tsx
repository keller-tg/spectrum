import { AXES, AXIS_IDS, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { Table } from "@/components/ui/Table";
import { formatScore } from "./AxisBar";
import { HatchPattern } from "./patterns";

export interface RadarSeries {
  label: string;
  values: Record<AxisId, number>;
}

const C = 200;
const R = 140;

function point(i: number, value: number) {
  const angle = ((i * 30 - 90) * Math.PI) / 180;
  const r = (R * (value + 100)) / 200;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}

const ring = (value: number) => AXIS_IDS.map((_, i) => point(i, value).join(",")).join(" ");

/**
 * Twelve-axis radar. The centre is −100 and the outer ring +100 on every axis,
 * so the solid inner ring is 0. First series: solid line, hatched fill, solid
 * vertices. Second series: dashed line, empty fill, hollow vertices. A data
 * table carries the same numbers for screen readers and print.
 */
export function Radar({
  id,
  series,
  locale,
  title,
  dataLabel,
  axisHeader,
}: {
  /** Unique per page; namespaces the hatch pattern. */
  id: string;
  series: readonly [RadarSeries] | readonly [RadarSeries, RadarSeries];
  locale: Locale;
  title: string;
  dataLabel: string;
  axisHeader: string;
}) {
  const [a, b] = series;
  const poly = (s: RadarSeries) =>
    AXIS_IDS.map((ax, i) => point(i, s.values[ax]).join(",")).join(" ");

  return (
    <figure>
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-labelledby={`${id}-title`}
        className="h-auto w-full max-w-md font-mono"
      >
        <title id={`${id}-title`}>{title}</title>
        <defs>
          <HatchPattern id={`${id}-hatch`} />
        </defs>
        <g fill="none" stroke="currentColor">
          <polygon points={ring(100)} strokeWidth="2" />
          <polygon points={ring(50)} strokeWidth="1" strokeDasharray="2 4" />
          <polygon points={ring(0)} strokeWidth="1" />
          <polygon points={ring(-50)} strokeWidth="1" strokeDasharray="2 4" />
          {AXIS_IDS.map((ax, i) => {
            const [x, y] = point(i, 100);
            return <line key={ax} x1={C} y1={C} x2={x} y2={y} strokeWidth="1" />;
          })}
        </g>
        <g fill="currentColor" fontSize="13" fontWeight="700" textAnchor="middle">
          {AXIS_IDS.map((ax, i) => {
            const [x, y] = point(i, 130);
            return (
              <text key={ax} x={x} y={y + 4.5}>
                {AXES[ax].code[locale]}
              </text>
            );
          })}
        </g>
        <polygon
          points={poly(a)}
          fill={`url(#${id}-hatch)`}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        {b ? (
          <polygon
            points={poly(b)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="7 4"
            strokeLinejoin="miter"
          />
        ) : null}
        {AXIS_IDS.map((ax, i) => {
          const [x, y] = point(i, a.values[ax]);
          return <rect key={ax} x={x - 3.5} y={y - 3.5} width="7" height="7" fill="currentColor" />;
        })}
        {b
          ? AXIS_IDS.map((ax, i) => {
              const [x, y] = point(i, b.values[ax]);
              return (
                <rect
                  key={ax}
                  x={x - 3.5}
                  y={y - 3.5}
                  width="7"
                  height="7"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              );
            })
          : null}
      </svg>
      <details className="mt-3">
        <summary className="label inline-flex min-h-11 items-center hover:bg-ink hover:text-paper">
          {dataLabel}
        </summary>
        <Table
          id={`${id}-table`}
          className="mt-2"
          caption={title}
          columns={[
            { key: "axis", header: axisHeader },
            { key: "a", header: a.label, numeric: true },
            ...(b ? [{ key: "b", header: b.label, numeric: true }] : []),
          ]}
          rows={AXIS_IDS.map((ax) => [
            `${AXES[ax].code[locale]} · ${AXES[ax].name[locale]}`,
            formatScore(a.values[ax]),
            ...(b ? [formatScore(b.values[ax])] : []),
          ])}
        />
      </details>
    </figure>
  );
}
