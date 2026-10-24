import { AXIS_IDS, type AxisId } from "@/data/axes";
import { MODES, type ModeId } from "@/data/modes";
import { modeQuestions } from "@/data/questions/bank";
import type { CatalogData, CatalogEntry } from "@/lib/catalog/client-data";
import { displaySimilarity, summarizeMatches } from "@/lib/engine/match";
import { scoreTest } from "@/lib/engine/score";
import type { AxisVector } from "@/lib/engine/types";
import { ENGINE_VERSION } from "@/lib/engine/version";
import { rangeHalfWidth } from "@/lib/results/report";
import type { StoredResult } from "@/lib/storage/db";

/**
 * The dashboard's reading of this browser's history (PLAN §10, D-092). Pure:
 * everything is derived from the stored answers, either as taken (the
 * snapshot frozen when the test was finished) or recomputed with the current
 * engine (§6.8). Nothing leaves the device.
 */

export type Basis = "taken" | "recomputed";

export interface Reading {
  result: StoredResult & { id: number };
  date: Date;
  scores: AxisVector;
  confidences: AxisVector;
  /** The engine or question bank changed since this result was taken. */
  versionChanged: boolean;
  closest: { entry: CatalogEntry; percent: number } | null;
}

export function readings(
  results: readonly StoredResult[],
  basis: Basis,
  catalog: Pick<CatalogData, "entries" | "tau" | "bankVersion">,
): Reading[] {
  return results
    .filter((r): r is StoredResult & { id: number } => typeof r.id === "number")
    .map((result) => {
      const recomputed =
        basis === "recomputed" ? scoreTest(modeQuestions(result.mode), result.answers) : null;
      const scores = recomputed ? recomputed.scores : result.scoresAsTaken;
      const confidences = recomputed ? recomputed.confidences : result.confidences;
      const summary = summarizeMatches({ scores, confidences }, catalog.entries, catalog.tau);
      const head = summary.headline;
      return {
        result,
        date: new Date(result.createdAt),
        scores,
        confidences,
        versionChanged:
          result.engineVersion !== ENGINE_VERSION || result.bankVersion !== catalog.bankVersion,
        closest: head
          ? { entry: head.item.entry, percent: displaySimilarity(head.groupSimilarity) }
          : null,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface SeriesPoint {
  date: Date;
  score: number;
  low: number;
  high: number;
}

/** One series per axis, oldest first, with the likely range as a band. */
export function axisSeries(list: readonly Reading[]): Record<AxisId, SeriesPoint[]> {
  return Object.fromEntries(
    AXIS_IDS.map((axis) => [
      axis,
      list.map((r) => {
        const half = rangeHalfWidth(r.confidences[axis]);
        const score = r.scores[axis];
        return {
          date: r.date,
          score,
          low: Math.max(-100, score - half),
          high: Math.min(100, score + half),
        };
      }),
    ]),
  ) as Record<AxisId, SeriesPoint[]>;
}

/** A move smaller than this (in points) is within the usual noise of a retake. */
export const DRIFT_THRESHOLD = 15;

export interface Drift {
  from: Reading;
  to: Reading;
  /** Axes that moved at least DRIFT_THRESHOLD points, largest first. */
  moved: { axis: AxisId; delta: number }[];
  /** Axes that moved less than that. */
  steady: AxisId[];
  closestChanged: boolean;
}

/** First against latest. Null with fewer than two results. */
export function drift(list: readonly Reading[]): Drift | null {
  const from = list[0];
  const to = list.at(-1);
  if (!from || !to || from === to) return null;
  const deltas = AXIS_IDS.map((axis) => ({ axis, delta: to.scores[axis] - from.scores[axis] }));
  return {
    from,
    to,
    moved: deltas
      .filter((d) => Math.abs(d.delta) >= DRIFT_THRESHOLD)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    steady: deltas.filter((d) => Math.abs(d.delta) < DRIFT_THRESHOLD).map((d) => d.axis),
    closestChanged: from.closest?.entry.id !== to.closest?.entry.id,
  };
}

export interface Comparison {
  rows: { axis: AxisId; a: number; b: number; delta: number }[];
  /** Mean absolute difference over the twelve axes, in points. */
  meanDistance: number;
}

export function compare(a: Reading, b: Reading): Comparison {
  const rows = AXIS_IDS.map((axis) => ({
    axis,
    a: a.scores[axis],
    b: b.scores[axis],
    delta: b.scores[axis] - a.scores[axis],
  }));
  return {
    rows,
    meanDistance: rows.reduce((s, r) => s + Math.abs(r.delta), 0) / rows.length,
  };
}

/** After this many days a retake is worth suggesting. */
export const RETAKE_AFTER_DAYS = 90;

export type Suggestion =
  | { kind: "first" }
  | { kind: "longer"; mode: ModeId; extra: number }
  | { kind: "lowQuality" }
  | { kind: "stale"; days: number }
  | { kind: "none"; days: number };

/** What the header suggests next, from the latest result only. */
export function suggestion(list: readonly Reading[], now = new Date()): Suggestion {
  const latest = list.at(-1);
  if (!latest) return { kind: "first" };
  const days = Math.floor((now.getTime() - latest.date.getTime()) / 86_400_000);
  if (latest.result.lowQuality) return { kind: "lowQuality" };
  if (days >= RETAKE_AFTER_DAYS) return { kind: "stale", days };
  const order: ModeId[] = ["quick", "standard", "deep"];
  const next = order[order.indexOf(latest.result.mode) + 1];
  if (next && modeQuestions(next).length === MODES[next].count)
    return {
      kind: "longer",
      mode: next,
      extra: MODES[next].count - MODES[latest.result.mode].count,
    };
  return { kind: "none", days };
}
