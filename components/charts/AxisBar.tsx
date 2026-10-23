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
 * The ruled −100…+100 track: ticks every 10 points (majors at ±50 and 0), a
 * black bar from the centre to the value, and the uncertainty as a hairline
 * bracket or a hatched band. Shared by axis bars and category indices.
 */
export function ScaleTrack({
  value,
  interval,
  band = "bracket",
  description,
}: {
  value: number;
  interval?: readonly [number, number];
  band?: "bracket" | "hatch";
  description: string;
}) {
  const from = Math.min(0, value);
  const to = Math.max(0, value);
  return (
    <div role="img" aria-label={description} className="relative h-9">
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-ink" />
      {TICKS.map((t) => (
        <span
          key={t}
          aria-hidden="true"
          className={`absolute w-px bg-ink ${t === 0 ? "inset-y-0" : t % 50 === 0 ? "top-2 bottom-2" : "top-3 bottom-3"}`}
          style={{ left: `${pct(t)}%` }}
        />
      ))}
      {interval && band === "hatch" ? (
        <span
          aria-hidden="true"
          className="hatch absolute inset-y-1.5"
          style={{ left: `${pct(interval[0])}%`, width: `${pct(interval[1]) - pct(interval[0])}%` }}
        />
      ) : null}
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
      {interval && band === "bracket" ? (
        <span
          aria-hidden="true"
          className="absolute top-0 h-2 border-x border-t border-ink"
          style={{ left: `${pct(interval[0])}%`, width: `${pct(interval[1]) - pct(interval[0])}%` }}
        />
      ) : null}
    </div>
  );
}

/** One result axis: code and name, the score, the ruled track, both pole names. */
export function AxisBar({
  axis,
  value,
  interval,
  locale,
  description,
  band = "bracket",
}: {
  axis: AxisId;
  value: number;
  interval?: readonly [number, number];
  locale: Locale;
  /** Spoken version of the bar, e.g. "Distribution: +42, toward Markets". */
  description: string;
  /** How the uncertainty range is drawn: a hairline bracket or a hatched band. */
  band?: "bracket" | "hatch";
}) {
  const def = AXES[axis];
  return (
    <div>
      <div className="label flex items-baseline justify-between gap-3">
        <span>
          <span aria-hidden="true">{def.code[locale]} </span>
          {def.name[locale]}
        </span>
        <span className="text-base tabular-nums">{formatScore(value)}</span>
      </div>
      <div className="mt-2">
        <ScaleTrack value={value} interval={interval} band={band} description={description} />
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm">
        <span>{def.neg.short[locale]}</span>
        <span className="text-right">{def.pos.short[locale]}</span>
      </div>
    </div>
  );
}
