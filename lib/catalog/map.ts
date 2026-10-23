import { AXIS_IDS } from "@/data/axes";
import { pca, project, type PcaResult } from "@/lib/engine/pca";
import { loadIdeologies, toMatchable } from "./ideologies";

/**
 * The overall map (D-016): PCA over the 12-axis coordinates of every visible
 * catalog entry. build-derived stores it in generated/derived.json; the hero
 * field and Map mode call this same function, so they share one projection.
 */
export function catalogMap(): { map: PcaResult; rows: number[][] } {
  const visible = loadIdeologies()
    .map(toMatchable)
    .filter((m) => !m.hidden);
  const rows = visible.map((m) => AXIS_IDS.map((a) => m.coords[a]));
  return { map: pca(rows), rows };
}

/** One entry's position on the map's first two components. */
export const mapPosition = (coords: Record<(typeof AXIS_IDS)[number], number>, map: PcaResult) =>
  project(
    AXIS_IDS.map((a) => coords[a]),
    map,
    2,
  ) as [number, number];
