import { AXES, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";

const TICKS = Array.from({ length: 21 }, (_, i) => -100 + i * 10);
const pct = (v: number) => (v + 100) / 2;

/** "−42", "0", "+42" with a real minus sign. */
export function formatScore(v: number) {
  const r = Math.round(v);
  return r > 0 ? `+${r}` : r < 0 ? `−${-r}` : "0";
}

/**
 * One result axis: a black bar from the centre to the score on a ruled track
 * with tick marks every 10 points, the score as a number, and the uncertainty
 * as a bracketed interval drawn with hairlines.
 */
export function AxisBar({
  axis,
  value,
  interval,
  locale,
  description,
}: {
  axis: AxisId;
  value: number;
  interval?: readonly [number, number];
  locale: Locale;
  /** Spoken version of the bar, e.g. "Distribution: +42, toward Markets". */
  description: string;
}) {
  const def = AXES[axis];
  const from = Math.min(0, value);
  const to = Math.max(0, value);
  return (
    <div>
      <div className="label flex items-baseline justify-between gap-3">
        <span>
          <span aria-hidden="true">{def.code[locale]} </span>
          {def.name[locale]}
        </span>
        <span className="text-base tabular-nums">{formatScore(value)}</span>
      </div>
      <div role="img" aria-label={description} className="relative mt-2 h-9">
        {/* Track and ticks: majors at −100, −50, 0, +50, +100. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-ink" />
        {TICKS.map((t) => (
          <span
            key={t}
            aria-hidden="true"
            className={`absolute w-px bg-ink ${t === 0 ? "inset-y-0" : t % 50 === 0 ? "top-2 bottom-2" : "top-3 bottom-3"}`}
            style={{ left: `${pct(t)}%` }}
          />
        ))}
        {/* The bar itself. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-3.5 -translate-y-1/2 bg-ink"
          style={{ left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-1 w-[3px] -translate-x-1/2 bg-ink"
          style={{ left: `${pct(value)}%` }}
        />
        {interval ? (
          <span
            aria-hidden="true"
            className="absolute top-0 h-2 border-x border-t border-ink"
            style={{
              left: `${pct(interval[0])}%`,
              width: `${pct(interval[1]) - pct(interval[0])}%`,
            }}
          />
        ) : null}
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm">
        <span>{def.neg.short[locale]}</span>
        <span className="text-right">{def.pos.short[locale]}</span>
      </div>
    </div>
  );
}
