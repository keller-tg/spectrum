import { AXIS_IDS } from "@/data/axes";
import { gaussian, type Rng } from "./random";
import type { AnswerRecord, Answers, AxisVector, BankItem, RawAnswer } from "./types";
import { clamp } from "./vector";

export interface SimulationOptions {
  /** SD of answer noise on the −2 … +2 response scale. */
  sigma: number;
  rng: Rng;
  /** Probability of skipping a question. */
  skipRate?: number;
  /** Simulated time per answer (ms). */
  ms?: number;
}

/**
 * A simulated respondent at `coords`: for each item the latent response is
 * 2 · key · coord/100 + N(0, σ²), rounded and clamped to the 5-point scale.
 */
export function simulateAnswers(
  items: readonly BankItem[],
  coords: AxisVector,
  { sigma, rng, skipRate = 0, ms = 5000 }: SimulationOptions,
): Answers {
  const out: Record<string, AnswerRecord> = {};
  for (const q of items) {
    if (skipRate > 0 && rng() < skipRate) {
      out[q.id] = { r: null, ms };
      continue;
    }
    const latent = (2 * q.key * coords[q.axis]) / 100 + (sigma > 0 ? sigma * gaussian(rng) : 0);
    out[q.id] = { r: clamp(Math.round(latent), -2, 2) as RawAnswer, ms };
  }
  return out;
}

/** Everyone answers the same thing (straight-lining), e.g. all "agree". */
export function uniformAnswers(items: readonly BankItem[], r: RawAnswer, ms = 5000): Answers {
  return Object.fromEntries(items.map((q) => [q.id, { r, ms }]));
}

/**
 * Deep (144) has the same structure as Standard plus six more items per axis,
 * keyed 3+/3− (6+/6− overall). Until Phase 9 writes them, calibration uses this
 * structural stand-in so Deep numbers can be reported.
 */
export function syntheticDeepBank(standard: readonly BankItem[]): BankItem[] {
  const extra: BankItem[] = [];
  let order = standard.length;
  for (let round = 0; round < 6; round++) {
    for (const axis of AXIS_IDS) {
      order++;
      extra.push({ id: `sim-deep-${axis}-${round}`, axis, key: round % 2 === 0 ? 1 : -1, order });
    }
  }
  return [...standard, ...extra];
}
