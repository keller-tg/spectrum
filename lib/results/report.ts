import { AXIS_IDS, type AxisId, type CategoryId } from "@/data/axes";
import { computeIndex, type IndexDef } from "@/lib/engine/indices";
import { displaySimilarity, summarizeMatches, type MatchSummary } from "@/lib/engine/match";
import type { AxisVector, UserPoint } from "@/lib/engine/types";
import type { CatalogData, CatalogEntry } from "@/lib/catalog/client-data";

/** Half-width of the shown range at zero confidence, in points (display only). */
const RANGE_AT_ZERO_CONFIDENCE = 45;
/** Catalog entries within this many points count as "nearby" on an axis. */
const NEARBY = 15;

export interface AxisRow {
  axis: AxisId;
  score: number;
  confidence: number;
  /** Likely range for display: narrower with more confidence. */
  range: [number, number];
  /** Share of catalog entries within ±15 points on this axis. */
  company: number;
}

export interface IndexRow {
  category: CategoryId;
  def: IndexDef;
  value: number;
  confidence: number;
}

export interface Report {
  summary: MatchSummary<CatalogEntry>;
  headlinePercent: number | null;
  axes: AxisRow[];
  /** Least and most shared positions, among axes measured with some confidence. */
  unusual: AxisRow | null;
  typical: AxisRow | null;
  indices: IndexRow[];
}

/** Half-width of the likely range, in points; the compass draws the same width. */
export const rangeHalfWidth = (confidence: number) =>
  RANGE_AT_ZERO_CONFIDENCE * (1 - confidence) + 4;

export function axisRange(score: number, confidence: number): [number, number] {
  const half = rangeHalfWidth(confidence);
  return [Math.max(-100, score - half), Math.min(100, score + half)];
}

/** Everything the results page shows, from a user's scores and the catalog. Pure. */
export function buildReport(
  scores: AxisVector,
  confidences: AxisVector,
  catalog: Pick<CatalogData, "entries" | "tau" | "indices">,
): Report {
  const user: UserPoint = { scores, confidences };
  const summary = summarizeMatches(user, catalog.entries, catalog.tau);
  const n = catalog.entries.length || 1;
  const axes: AxisRow[] = AXIS_IDS.map((axis) => ({
    axis,
    score: scores[axis],
    confidence: confidences[axis],
    range: axisRange(scores[axis], confidences[axis]),
    company:
      catalog.entries.filter((e) => Math.abs(e.coords[axis] - scores[axis]) <= NEARBY).length / n,
  }));
  const measured = axes.filter((a) => a.confidence >= 0.3);
  const byCompany = [...measured].sort(
    (a, b) => a.company - b.company || a.axis.localeCompare(b.axis),
  );
  const indices = (Object.values(catalog.indices) as IndexDef[]).map((def) => ({
    category: def.category,
    def,
    ...computeIndex(def, scores, confidences),
  }));
  return {
    summary,
    headlinePercent: summary.headline ? displaySimilarity(summary.headline.groupSimilarity) : null,
    axes,
    unusual: byCompany[0] ?? null,
    typical: byCompany.at(-1) ?? null,
    indices,
  };
}
