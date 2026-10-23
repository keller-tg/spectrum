import { AXIS_IDS, type AxisId } from "@/data/axes";
import { rangeHalfWidth } from "@/lib/results/report";
import type { UserInput } from "./geometry";

/** A result as a compass mark: scores plus the same likely-range widths the results page shows. */
export const userInput = (
  scores: Readonly<Record<AxisId, number>>,
  confidences: Readonly<Record<AxisId, number>>,
): UserInput => ({
  scores,
  half: Object.fromEntries(AXIS_IDS.map((a) => [a, rangeHalfWidth(confidences[a])])) as Record<
    AxisId,
    number
  >,
});
