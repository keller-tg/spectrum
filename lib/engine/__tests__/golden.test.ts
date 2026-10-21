import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { createRng } from "../random";
import { scoreTest } from "../score";
import { simulateAnswers } from "../simulate";
import type { BankItem } from "../types";
import { axisVector } from "../vector";
import { ENGINE_VERSION } from "../version";

/**
 * Golden fixtures: fixed answer sets and their exact outputs, stored under a
 * snapshot named after ENGINE_VERSION. If engine output changes without a
 * version bump, this fails. After an intentional change: bump ENGINE_VERSION,
 * run `npx vitest run -u` and delete the obsolete snapshot.
 */
const round = (x: number) => Math.round(x * 1e6) / 1e6;

/** A fixed bank (independent of the real questions, so editing questions never trips this test). */
function fixtureBank(perAxis: number): BankItem[] {
  const items: BankItem[] = [];
  let order = 0;
  for (let round = 0; round < perAxis; round++) {
    AXIS_IDS.forEach((axis, i) => {
      order++;
      items.push({
        id: `g-${axis}-${round}`,
        axis,
        key: (round + i) % 2 === 0 ? 1 : -1,
        order,
        ...(round === 2 ? { mirrorOf: `g-${axis}-0` } : {}),
      });
    });
  }
  return items;
}
const BANKS = { quick: fixtureBank(3), standard: fixtureBank(6) } as const;

const FIXTURES = [
  {
    name: "quick-left-libertarian",
    mode: "quick",
    coords: axisVector((a, i) => (a === "distribution" ? -80 : i % 3 === 0 ? -40 : 20)),
    sigma: 0.6,
    seed: 11,
    skipRate: 0.1,
  },
  {
    name: "standard-right-traditional",
    mode: "standard",
    coords: axisVector((_, i) => (i < 6 ? 55 : -25)),
    sigma: 0.8,
    seed: 23,
    skipRate: 0,
  },
  {
    name: "standard-centrist-noisy",
    mode: "standard",
    coords: axisVector(() => 0),
    sigma: 1.0,
    seed: 37,
    skipRate: 0.2,
  },
] as const;

describe(`golden outputs (engine ${ENGINE_VERSION})`, () => {
  for (const f of FIXTURES) {
    it(f.name, () => {
      const bank = BANKS[f.mode];
      const result = scoreTest(
        bank,
        simulateAnswers(bank, f.coords, {
          sigma: f.sigma,
          rng: createRng(f.seed),
          skipRate: f.skipRate,
        }),
      );
      const compact = {
        scores: AXIS_IDS.map((a) => round(result.scores[a])),
        confidences: AXIS_IDS.map((a) => round(result.confidences[a])),
        overall: round(result.overallConfidence),
        flags: result.quality.flags,
        tension: AXIS_IDS.filter((a) => result.axes[a].tension),
      };
      expect(compact).toMatchSnapshot(`engine-${ENGINE_VERSION}`);
    });
  }
});
