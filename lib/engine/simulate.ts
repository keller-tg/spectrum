import { AXIS_IDS } from "@/data/axes";
import { gaussian, type Rng } from "./random";
import type { AnswerRecord, Answers, AxisVector, BankItem, RawAnswer } from "./types";
import { clamp } from "./vector";

/**
 * How a simulated respondent turns a latent opinion into one of the five answers
 * (D-071). `shift` is added to every latent response, whatever the item's key
 * (acquiescence: agreeing regardless of content). `cuts` are the four thresholds
 * between −2 | −1 | 0 | +1 | +2; a latent at or above a cut moves up one answer.
 */
export interface ResponseStyle {
  id: string;
  label: string;
  shift: number;
  cuts: readonly [number, number, number, number];
}

const FULL_SCALE = [-1.5, -0.5, 0.5, 1.5] as const;

export const RESPONSE_STYLES = {
  /** Plain rounding; identical to the default simulation. */
  baseline: { id: "baseline", label: "uses the whole scale", shift: 0, cuts: FULL_SCALE },
  acquiescent: {
    id: "acquiescent",
    label: "leans toward agreeing (+0.75 on every item)",
    shift: 0.75,
    cuts: FULL_SCALE,
  },
  midpoint: {
    id: "midpoint",
    label: "midpoint-heavy (neutral unless |latent| ≥ 1)",
    shift: 0,
    cuts: [-1.8, -1, 1, 1.8],
  },
  extremityAverse: {
    id: "extremity-averse",
    label: "never uses the strong answers",
    shift: 0,
    cuts: [Number.NEGATIVE_INFINITY, -0.5, 0.5, Number.POSITIVE_INFINITY],
  },
} as const satisfies Record<string, ResponseStyle>;

/** The answer a latent value falls into under a style's thresholds. */
export function categorize(latent: number, style: ResponseStyle): RawAnswer {
  let r = -2;
  for (const cut of style.cuts) if (latent >= cut) r++;
  return r as RawAnswer;
}

export interface SimulationOptions {
  /** SD of answer noise on the −2 … +2 response scale. */
  sigma: number;
  rng: Rng;
  /** Probability of skipping a question. */
  skipRate?: number;
  /** Simulated time per answer (ms). */
  ms?: number;
  /** Response style; omitted = plain rounding. */
  style?: ResponseStyle;
  /** Per-item difficulty: added to the latent response (+ = easier to agree with). */
  offsets?: Readonly<Record<string, number>>;
}

/**
 * A simulated respondent at `coords`: for each item the latent response is
 * 2 · key · coord/100 + offset + shift + N(0, σ²), mapped to the 5-point scale
 * (rounded and clamped by default, or by the style's thresholds).
 */
export function simulateAnswers(
  items: readonly BankItem[],
  coords: AxisVector,
  { sigma, rng, skipRate = 0, ms = 5000, style, offsets }: SimulationOptions,
): Answers {
  const out: Record<string, AnswerRecord> = {};
  for (const q of items) {
    if (skipRate > 0 && rng() < skipRate) {
      out[q.id] = { r: null, ms };
      continue;
    }
    const latent =
      (2 * q.key * coords[q.axis]) / 100 +
      (offsets?.[q.id] ?? 0) +
      (style?.shift ?? 0) +
      (sigma > 0 ? sigma * gaussian(rng) : 0);
    const r = style ? categorize(latent, style) : (clamp(Math.round(latent), -2, 2) as RawAnswer);
    out[q.id] = { r, ms };
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
