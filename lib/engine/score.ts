import { AXIS_IDS, type AxisId } from "@/data/axes";
import { assessQuality, type QualityReport } from "./quality";
import type { Answers, AxisVector, BankItem } from "./types";
import { ENGINE_VERSION } from "./version";

/** Answers needed before confidence approaches 1: c_count = n / (n + COUNT_PRIOR). */
const COUNT_PRIOR = 2;
/** Confidence multiplier when only one keying direction was answered on an axis. */
const ONE_SIDED = 0.8;
/** Standard deviation of keyed answers above which an axis gets a tension note. */
export const TENSION_SD = 0.5;
/** Overall confidence multiplier for low-quality results. */
const LOW_QUALITY_PENALTY = 0.5;

export interface AxisScore {
  axis: AxisId;
  /** −100 … +100. */
  score: number;
  /** 0 … 1 (count × consistency × balance). */
  confidence: number;
  answered: number;
  skipped: number;
  /** Answered items per keying direction. */
  sides: { pos: number; neg: number };
  /** Weighted SD of keyed answers (0 … 1). */
  sd: number;
  tension: boolean;
}

export interface ScoreResult {
  engineVersion: string;
  itemsTotal: number;
  answered: number;
  skipped: number;
  scores: AxisVector;
  confidences: AxisVector;
  axes: Record<AxisId, AxisScore>;
  /** Mean axis confidence, halved when quality is low. */
  overallConfidence: number;
  quality: QualityReport;
}

/** Keyed value of a raw answer: −1 … +1 toward the +100 pole. */
export const keyed = (item: Pick<BankItem, "key">, r: number) => (item.key * r) / 2;

/**
 * Score one axis (PLAN §6.1, D-008). Answered agree-side (+) items share half
 * the weight and answered disagree-side (−) items the other half, so the two
 * directions always carry equal total weight. With balanced keying and no
 * skips this equals the plain weighted mean; an all-"agree" pattern is exactly 0.
 */
export function scoreAxis(axis: AxisId, items: readonly BankItem[], answers: Answers): AxisScore {
  const onAxis = items.filter((q) => q.axis === axis && !q.retired);
  const answered = onAxis.flatMap((q) => {
    const r = answers[q.id]?.r;
    return r === null || r === undefined ? [] : [{ q, x: keyed(q, r), w: q.weight ?? 1 }];
  });
  const skipped = onAxis.filter((q) => answers[q.id]?.r === null).length;
  const pos = answered.filter((a) => a.q.key === 1);
  const neg = answered.filter((a) => a.q.key === -1);

  if (answered.length === 0) {
    return {
      axis,
      score: 0,
      confidence: 0,
      answered: 0,
      skipped,
      sides: { pos: 0, neg: 0 },
      sd: 0,
      tension: false,
    };
  }

  const both = pos.length > 0 && neg.length > 0;
  const sumW = (list: typeof answered) => list.reduce((s, a) => s + a.w, 0);
  const wPos = sumW(pos);
  const wNeg = sumW(neg);
  const wAll = wPos + wNeg;
  const effective = (a: (typeof answered)[number]) =>
    both ? (a.q.key === 1 ? (0.5 * a.w) / wPos : (0.5 * a.w) / wNeg) : a.w / wAll;

  // Average each side separately, then the two sides: identical answers on both
  // sides cancel exactly (no floating-point residue), so straight-lining is exactly 0.
  const sideMean = (list: typeof answered, w: number) =>
    list.reduce((s, a) => s + a.w * a.x, 0) / w;
  const mean = both ? (sideMean(pos, wPos) + sideMean(neg, wNeg)) / 2 : sideMean(answered, wAll);
  let variance = 0;
  for (const a of answered) variance += effective(a) * (a.x - mean) ** 2;
  const sd = Math.sqrt(variance);

  const n = answered.length;
  const confidence = (n / (n + COUNT_PRIOR)) * (1 - variance) * (both ? 1 : ONE_SIDED);

  return {
    axis,
    // Normalize −0 to 0 so "exactly 0" is exact.
    score: mean * 100 + 0,
    confidence: Math.max(0, confidence),
    answered: n,
    skipped,
    sides: { pos: pos.length, neg: neg.length },
    sd,
    tension: n >= 2 && sd > TENSION_SD,
  };
}

/** Score a whole test: the bank prefix for the chosen mode plus the user's answers. */
export function scoreTest(items: readonly BankItem[], answers: Answers): ScoreResult {
  const active = items.filter((q) => !q.retired);
  const quality = assessQuality(active, answers);
  const axes = {} as Record<AxisId, AxisScore>;
  for (const axis of AXIS_IDS) {
    const s = scoreAxis(axis, active, answers);
    axes[axis] = quality.contradictedAxes.includes(axis) ? { ...s, tension: true } : s;
  }
  const scores = {} as AxisVector;
  const confidences = {} as AxisVector;
  for (const axis of AXIS_IDS) {
    scores[axis] = axes[axis].score;
    confidences[axis] = axes[axis].confidence;
  }
  const meanConfidence = AXIS_IDS.reduce((s, a) => s + confidences[a], 0) / AXIS_IDS.length;
  const answered = AXIS_IDS.reduce((s, a) => s + axes[a].answered, 0);
  return {
    engineVersion: ENGINE_VERSION,
    itemsTotal: active.length,
    answered,
    skipped: active.length - answered,
    scores,
    confidences,
    axes,
    overallConfidence: meanConfidence * (quality.low ? LOW_QUALITY_PENALTY : 1),
    quality,
  };
}
