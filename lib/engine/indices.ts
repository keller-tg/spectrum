import { CATEGORIES, CATEGORY_IDS, type AxisId, type CategoryId } from "@/data/axes";
import { pca } from "./pca";
import type { AxisVector } from "./types";

/** Below this share of explained variance, a category shows its three axes instead of one index. */
export const MIN_EXPLAINED = 0.5;

export interface IndexDef {
  category: CategoryId;
  axes: readonly AxisId[];
  /** First principal component, oriented so the category's first axis loads positively. */
  loadings: number[];
  explained: number;
  usable: boolean;
}

/**
 * Derive the four category indices from the catalog (D-015): PC1 of each
 * category's three axes over the given coordinates. No editorial sign choices:
 * orientation follows the first-listed pole of the category's first axis.
 */
export function deriveIndexDefs(
  catalog: readonly { coords: AxisVector }[],
): Record<CategoryId, IndexDef> {
  const out = {} as Record<CategoryId, IndexDef>;
  for (const category of CATEGORY_IDS) {
    const axes = CATEGORIES[category].axes;
    const rows = catalog.map((e) => axes.map((a) => e.coords[a]));
    const result = pca(rows);
    let pc1 = result.components[0] ?? axes.map(() => 0);
    const anchor = pc1[0] ?? 0;
    const flip = Math.abs(anchor) > 1e-9 ? anchor < 0 : pc1.reduce((s, x) => s + x, 0) < 0;
    if (flip) pc1 = pc1.map((x) => -x);
    const explained = result.explained[0] ?? 0;
    out[category] = {
      category,
      axes,
      loadings: pc1,
      explained,
      usable: explained >= MIN_EXPLAINED,
    };
  }
  return out;
}

/**
 * Index value in [−100, 100]: 100 · Σ lᵢsᵢ / (100 · Σ|lᵢ|). Not mean-centred, so 0
 * means neutral on all three axes. Confidence is the loading-weighted mean.
 */
export function computeIndex(
  def: IndexDef,
  scores: AxisVector,
  confidences?: AxisVector,
): { value: number; confidence: number } {
  const sumAbs = def.loadings.reduce((s, l) => s + Math.abs(l), 0) || 1;
  let value = 0;
  let confidence = 0;
  def.axes.forEach((axis, i) => {
    const l = def.loadings[i] ?? 0;
    value += l * scores[axis];
    confidence += Math.abs(l) * (confidences?.[axis] ?? 1);
  });
  return { value: value / sumAbs, confidence: confidence / sumAbs };
}
