import { AXIS_IDS, type AxisId } from "@/data/axes";
import type { ModeId } from "@/data/modes";
import { plainDistance } from "./calibrate";
import { caseOutcome, OPPOSITE_DISTANCE } from "./calibration";
import { rank } from "./match";
import { createRng, gaussian, hashString, type Rng } from "./random";
import { scoreTest } from "./score";
import { RESPONSE_STYLES, simulateAnswers, type ResponseStyle } from "./simulate";
import type { AxisVector, BankItem, Matchable } from "./types";
import { axisVector, median } from "./vector";

/**
 * Robustness of the calibration (D-071). The gate suite assumes respondents who
 * use the whole scale and items that are equally easy to agree with. Here the
 * same archetypes answer with response styles, more noise and per-item
 * difficulty offsets, and a true centrist (every coordinate 0) is checked for
 * drift. Numbers are reported as they are; nothing here is a gate.
 */

export const STYLE_LIST: readonly ResponseStyle[] = Object.values(RESPONSE_STYLES);
export const ROBUST_SIGMAS = [0.5, 0.8, 1.2] as const;
/** SD of per-item difficulty offsets, in answer-scale units (1 = one answer step). */
export const OFFSET_SDS = [0, 0.3, 0.6] as const;

/** Item difficulty: offset_i ~ N(0, sd²), fixed per item for one draw. */
export function drawOffsets(
  items: readonly BankItem[],
  sd: number,
  draw: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of items) {
    out[q.id] = sd > 0 ? sd * gaussian(createRng(hashString(`offset|${sd}|${draw}|${q.id}`))) : 0;
  }
  return out;
}

// Standard normal CDF via erf (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7).
function normalCdf(x: number): number {
  if (x === Number.POSITIVE_INFINITY) return 1;
  if (x === Number.NEGATIVE_INFINITY) return 0;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const poly =
    t *
    (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Mean and variance of the answer when the latent is N(mu, sigma²) under a style. */
export function answerMoments(
  mu: number,
  sigma: number,
  style: ResponseStyle,
): { mean: number; variance: number } {
  // P(answer ≥ −2 + k) = P(latent ≥ cut_k); the answer is −2 + Σ_k 1[latent ≥ cut_k].
  const above = style.cuts.map((c) =>
    sigma > 0 ? 1 - normalCdf((c - mu) / sigma) : mu >= c ? 1 : 0,
  );
  const probs = [
    1 - above[0]!,
    above[0]! - above[1]!,
    above[1]! - above[2]!,
    above[2]! - above[3]!,
    above[3]!,
  ];
  let mean = 0;
  let second = 0;
  probs.forEach((p, i) => {
    const r = i - 2;
    mean += p * r;
    second += p * r * r;
  });
  return { mean, variance: Math.max(0, second - mean * mean) };
}

/**
 * Exact expected score and SD per axis for a true centrist (all coordinates 0)
 * who answers every item. With balanced keying, score = 25 · (mean r on +items
 * − mean r on −items), so a shift that hits every item equally cancels; only
 * item offsets can move a centrist.
 */
export function centristExpectation(
  bank: readonly BankItem[],
  style: ResponseStyle,
  sigma: number,
  offsets: Readonly<Record<string, number>>,
): Record<AxisId, { mean: number; sd: number }> {
  const out = {} as Record<AxisId, { mean: number; sd: number }>;
  for (const axis of AXIS_IDS) {
    const side = (key: 1 | -1) => {
      const items = bank.filter((q) => q.axis === axis && q.key === key && !q.retired);
      const m = items.map((q) => answerMoments((offsets[q.id] ?? 0) + style.shift, sigma, style));
      const n = m.length || 1;
      return {
        mean: m.reduce((s, x) => s + x.mean, 0) / n,
        variance: m.reduce((s, x) => s + x.variance, 0) / (n * n),
      };
    };
    const pos = side(1);
    const neg = side(-1);
    out[axis] = {
      mean: 25 * (pos.mean - neg.mean) + 0,
      sd: 25 * Math.sqrt(pos.variance + neg.variance),
    };
  }
  return out;
}

export interface RobustnessRow {
  mode: ModeId;
  style: string;
  sigma: number;
  offsetSd: number;
  cases: number;
  strict1: number;
  strict3: number;
  hit3: number;
  quickHit: number;
  family1: number;
  /** Mean |score − true coordinate| over axes, in points. */
  mae: number;
  /** Least-squares slope of score on true coordinate (1 = no shrinkage). */
  slope: number;
  /** Share of results the quality checks mark as low quality. */
  lowQuality: number;
  inversions: number;
  centrist: {
    /** Worst axis |expected score| for a true centrist, median over offset draws. */
    maxBias: number;
    /** 90th percentile of the worst-axis bias over offset draws. */
    maxBiasP90: number;
    /** Mean |expected score| over axes and draws. */
    meanBias: number;
    /** Typical SD of one centrist's axis score (answer noise alone). */
    sd: number;
  };
}

export interface RobustnessOptions {
  entries: readonly Matchable[];
  banks: Record<ModeId, readonly BankItem[]>;
  tau: number;
  styles?: readonly ResponseStyle[];
  sigmas?: readonly number[];
  offsetSds?: readonly number[];
  /** Simulated respondents per archetype and condition. */
  repeats?: number;
  /** Independent item-difficulty draws per offset SD. */
  draws?: number;
  seed?: number;
  /** Add a "mixed" row per mode: style drawn at random per respondent. */
  mixed?: { sigma: number; offsetSd: number };
}

const MIXED = "mixed";

export function runRobustness({
  entries,
  banks,
  tau,
  styles = STYLE_LIST,
  sigmas = ROBUST_SIGMAS,
  offsetSds = OFFSET_SDS,
  repeats = 10,
  draws = 10,
  seed = 11,
  mixed,
}: RobustnessOptions): RobustnessRow[] {
  const visible = entries.filter((e) => !e.hidden);
  const opposites = new Map(
    visible.map((a) => [
      a.id,
      visible.filter((o) => plainDistance(o.coords, a.coords) >= OPPOSITE_DISTANCE),
    ]),
  );
  const rows: RobustnessRow[] = [];

  const conditions: { style: ResponseStyle | typeof MIXED; sigma: number; offsetSd: number }[] = [];
  for (const style of styles)
    for (const sigma of sigmas)
      for (const offsetSd of offsetSds) conditions.push({ style, sigma, offsetSd });
  if (mixed) conditions.push({ style: MIXED, ...mixed });

  for (const mode of ["quick", "standard", "deep"] as const) {
    const bank = banks[mode];
    for (const { style, sigma, offsetSd } of conditions) {
      const styleId = style === MIXED ? MIXED : style.id;
      const nDraws = offsetSd > 0 ? draws : 1;
      const offsetSets = Array.from({ length: nDraws }, (_, d) => drawOffsets(bank, offsetSd, d));
      const pick = (rng: Rng) =>
        style === MIXED ? (styles[Math.floor(rng() * styles.length)] as ResponseStyle) : style;

      let cases = 0;
      let strict1 = 0;
      let strict3 = 0;
      let hit3 = 0;
      let quickHit = 0;
      let family1 = 0;
      let inversions = 0;
      let low = 0;
      let absErr = 0;
      let xy = 0;
      let xx = 0;
      for (const archetype of visible) {
        for (let rep = 0; rep < repeats; rep++) {
          const rng = createRng(
            seed ^ hashString(`${mode}|${styleId}|${sigma}|${offsetSd}|${archetype.id}|${rep}`),
          );
          const answers = simulateAnswers(bank, archetype.coords, {
            sigma,
            rng,
            style: pick(rng),
            offsets: offsetSets[rep % nDraws],
          });
          const result = scoreTest(bank, answers);
          const c = caseOutcome(
            rank(result, visible, tau),
            archetype,
            opposites.get(archetype.id) ?? [],
          );
          cases++;
          if (c.pos === 0) strict1++;
          if (c.pos >= 0 && c.pos < 3) strict3++;
          if (c.hit3) hit3++;
          if (c.quickHit) quickHit++;
          if (c.family1) family1++;
          if (c.inversion) inversions++;
          if (result.quality.low) low++;
          for (const a of AXIS_IDS) {
            absErr += Math.abs(result.scores[a] - archetype.coords[a]);
            xy += result.scores[a] * archetype.coords[a];
            xx += archetype.coords[a] ** 2;
          }
        }
      }

      // Centrist drift: exact expectations per offset draw (styles averaged for "mixed").
      const centristStyles = style === MIXED ? styles : [style];
      const worst: number[] = [];
      let biasSum = 0;
      let sdSum = 0;
      let n = 0;
      for (const offsets of offsetSets) {
        const mean: AxisVector = axisVector(() => 0);
        for (const st of centristStyles) {
          const e = centristExpectation(bank, st, sigma, offsets);
          for (const a of AXIS_IDS) {
            mean[a] += e[a].mean / centristStyles.length;
            sdSum += e[a].sd;
            n++;
          }
        }
        worst.push(Math.max(...AXIS_IDS.map((a) => Math.abs(mean[a]))));
        biasSum += AXIS_IDS.reduce((s, a) => s + Math.abs(mean[a]), 0) / AXIS_IDS.length;
      }
      const sorted = [...worst].sort((a, b) => a - b);

      rows.push({
        mode,
        style: styleId,
        sigma,
        offsetSd,
        cases,
        strict1: strict1 / cases,
        strict3: strict3 / cases,
        hit3: hit3 / cases,
        quickHit: quickHit / cases,
        family1: family1 / cases,
        mae: absErr / (cases * AXIS_IDS.length),
        slope: xx > 0 ? xy / xx : 1,
        lowQuality: low / cases,
        inversions,
        centrist: {
          maxBias: median(worst),
          maxBiasP90: sorted[Math.min(sorted.length - 1, Math.floor(0.9 * sorted.length))] ?? 0,
          meanBias: biasSum / offsetSets.length,
          sd: sdSum / n,
        },
      });
    }
  }
  return rows;
}

/** Which entries a simulated true centrist is matched to most often. */
export function centristTopMatches(
  bank: readonly BankItem[],
  entries: readonly Matchable[],
  tau: number,
  { sigma = 0.8, count = 2000, seed = 5 }: { sigma?: number; count?: number; seed?: number } = {},
): { id: string; share: number }[] {
  const visible = entries.filter((e) => !e.hidden);
  const zero = axisVector(() => 0);
  const tally = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const rng = createRng(seed ^ hashString(`centrist|${sigma}|${i}`));
    const result = scoreTest(bank, simulateAnswers(bank, zero, { sigma, rng }));
    const top = rank(result, visible, tau)[0]?.entry.id;
    if (top) tally.set(top, (tally.get(top) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([id, k]) => ({ id, share: k / count }))
    .sort((a, b) => b.share - a.share);
}
