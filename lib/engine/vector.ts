import { AXIS_IDS } from "@/data/axes";
import type { AxisVector } from "./types";

export function axisVector(
  fill: (axis: (typeof AXIS_IDS)[number], index: number) => number,
): AxisVector {
  return Object.fromEntries(AXIS_IDS.map((a, i) => [a, fill(a, i)])) as AxisVector;
}

export const zeroVector = (): AxisVector => axisVector(() => 0);

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function median(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2;
}
