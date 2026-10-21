import { AXIS_IDS } from "@/data/axes";
import { matchDistance, similarity } from "./match";
import { createRng, gaussian, type Rng } from "./random";
import type { AxisVector, Matchable, UserPoint } from "./types";
import { axisVector, clamp, median } from "./vector";

/**
 * Similarity-curve calibration (D-013). τ is fitted so the median best match of
 * a seeded synthetic population has the target similarity. This is a
 * PLACEHOLDER: real users cluster near the centre, so τ must be re-tuned on
 * opt-in community data once it exists.
 */
export interface PopulationOptions {
  seed?: number;
  size?: number;
  /** Share of users drawn near a catalog entry (the rest are uniform). */
  entryShare?: number;
  /** SD (axis points) of the scatter around an entry. */
  scatter?: number;
  /** Uniform users are drawn from [−range, range] on every axis. */
  uniformRange?: number;
  /** Assumed per-axis confidence (a Standard-mode respondent). */
  confidence?: number;
}

export const POPULATION_DEFAULTS: Required<PopulationOptions> = {
  seed: 20261021,
  size: 20000,
  entryShare: 0.7,
  scatter: 25,
  uniformRange: 80,
  confidence: 0.75,
};

export function syntheticPopulation(
  entries: readonly Matchable[],
  options: PopulationOptions = {},
): UserPoint[] {
  const o = { ...POPULATION_DEFAULTS, ...options };
  const rng: Rng = createRng(o.seed);
  const visible = entries.filter((e) => !e.hidden);
  const users: UserPoint[] = [];
  for (let i = 0; i < o.size; i++) {
    let scores: AxisVector;
    if (visible.length && rng() < o.entryShare) {
      const e = visible[Math.floor(rng() * visible.length)] as Matchable;
      scores = axisVector((a) => clamp(e.coords[a] + o.scatter * gaussian(rng), -100, 100));
    } else {
      scores = axisVector(() => (rng() * 2 - 1) * o.uniformRange);
    }
    users.push({ scores, confidences: axisVector(() => o.confidence) });
  }
  return users;
}

/** The k smallest distances from a user to the entries, ascending. */
function nearest(user: UserPoint, entries: readonly Matchable[], k: number): number[] {
  const best: number[] = [];
  for (const e of entries) {
    if (e.hidden) continue;
    const d = matchDistance(user, e);
    if (best.length < k) {
      best.push(d);
      best.sort((a, b) => a - b);
    } else if (d < (best[k - 1] as number)) {
      best[k - 1] = d;
      best.sort((a, b) => a - b);
    }
  }
  return best;
}

export interface TauFit {
  tau: number;
  targetTop1: number;
  medianTop1Distance: number;
  medianTop1Similarity: number;
  medianTop5Similarity: number;
  /** Share of users whose 3rd-best match is ≥ 90 % (should be small). */
  shareThreeAbove90: number;
  population: number;
}

/** Fit τ so that the population's median top-1 similarity equals `targetTop1` (default 0.75). */
export function fitTau(
  entries: readonly Matchable[],
  { targetTop1 = 0.75, ...population }: PopulationOptions & { targetTop1?: number } = {},
): TauFit {
  const users = syntheticPopulation(entries, population);
  const nearestLists = users.map((u) => nearest(u, entries, 5));
  const d1 = median(nearestLists.map((l) => l[0] as number));
  // 2^(−(d/τ)²) = target  ⇒  τ = d / √(log2(1/target))
  const tau = d1 / Math.sqrt(Math.log2(1 / targetTop1));
  const sims5 = nearestLists.map((l) => similarity(l[Math.min(4, l.length - 1)] as number, tau));
  const third = nearestLists.filter(
    (l) => similarity(l[Math.min(2, l.length - 1)] as number, tau) >= 90,
  ).length;
  return {
    tau,
    targetTop1,
    medianTop1Distance: d1,
    medianTop1Similarity: similarity(d1, tau),
    medianTop5Similarity: median(sims5),
    shareThreeAbove90: third / users.length,
    population: users.length,
  };
}

/** Unweighted RMS distance between two coordinate vectors (used to define "clearly opposite"). */
export function plainDistance(a: AxisVector, b: AxisVector): number {
  return Math.sqrt(AXIS_IDS.reduce((s, x) => s + (a[x] - b[x]) ** 2, 0) / AXIS_IDS.length);
}
