import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { modeQuestions } from "@/data/questions/bank";
import { createRng } from "../random";
import { scoreAxis, scoreTest } from "../score";
import { simulateAnswers, syntheticDeepBank, uniformAnswers } from "../simulate";
import type { Answers, BankItem, RawAnswer } from "../types";
import { axisVector } from "../vector";

const quick = modeQuestions("quick");
const standard = modeQuestions("standard");
const deep = syntheticDeepBank(standard);

const tiny: BankItem[] = [
  { id: "a", axis: "distribution", key: 1, order: 1 },
  { id: "b", axis: "distribution", key: 1, order: 2 },
  { id: "c", axis: "distribution", key: -1, order: 3 },
];

describe("axis score", () => {
  it("gives agree-side and disagree-side equal total weight (Quick 2+/1−)", () => {
    // Two + items agree (x = +0.5), the − item strongly disagrees (x = +1): (0.5 + 1) / 2 = 0.75.
    const s = scoreAxis("distribution", tiny, { a: { r: 1 }, b: { r: 1 }, c: { r: -2 } });
    expect(s.score).toBeCloseTo(75, 10);
    expect(s.sides).toEqual({ pos: 2, neg: 1 });
  });

  it("excludes skips and keeps neutral answers", () => {
    const skipped = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: null }, c: { r: -2 } });
    expect(skipped.answered).toBe(2);
    expect(skipped.skipped).toBe(1);
    expect(skipped.score).toBe(100);
    const neutral = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: 0 }, c: { r: -2 } });
    expect(neutral.score).toBeCloseTo(75, 10);
  });

  it("falls back to the plain mean with a confidence penalty when one keying side is missing", () => {
    const both = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: 2 }, c: { r: -2 } });
    const oneSided = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: 2 }, c: { r: null } });
    expect(oneSided.score).toBe(100);
    expect(oneSided.confidence).toBeLessThan(both.confidence);
  });

  it("has zero score and zero confidence with no answers", () => {
    const s = scoreAxis("distribution", tiny, {});
    expect(s).toMatchObject({ score: 0, confidence: 0, answered: 0 });
  });

  it("lowers confidence and raises a tension note when answers contradict", () => {
    const consistent = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: 2 }, c: { r: -2 } });
    const torn = scoreAxis("distribution", tiny, { a: { r: 2 }, b: { r: 2 }, c: { r: 2 } });
    expect(consistent.tension).toBe(false);
    expect(torn.tension).toBe(true);
    expect(torn.confidence).toBeLessThan(consistent.confidence);
  });

  it("confidence grows with the number of answers (Quick < Standard < Deep)", () => {
    const coords = axisVector(() => 60);
    const conf = (bank: readonly BankItem[]) =>
      scoreTest(bank, simulateAnswers(bank, coords, { sigma: 0, rng: createRng(1) })).confidences
        .distribution;
    expect(conf(quick)).toBeLessThan(conf(standard));
    expect(conf(standard)).toBeLessThan(conf(deep));
  });
});

describe("straight-lining (calibration test b)", () => {
  for (const [name, bank] of [
    ["quick", quick],
    ["standard", standard],
    ["deep", deep],
  ] as const) {
    for (const r of [-2, -1, 0, 1, 2] as RawAnswer[]) {
      it(`answering ${r} to everything in ${name} lands at exactly 0 and is flagged`, () => {
        const result = scoreTest(bank, uniformAnswers(bank, r));
        for (const a of AXIS_IDS)
          expect(Object.is(result.scores[a], 0), `${a}=${result.scores[a]}`).toBe(true);
        expect(result.quality.flags).toContain("straightline");
        expect(result.quality.low).toBe(true);
      });
    }
  }
});

describe("whole test", () => {
  it("recovers a consistent respondent's position closely", () => {
    const coords = axisVector((_, i) => (i % 2 ? 50 : -50));
    const result = scoreTest(
      standard,
      simulateAnswers(standard, coords, { sigma: 0, rng: createRng(3) }),
    );
    for (const a of AXIS_IDS)
      expect(Math.abs(result.scores[a] - coords[a])).toBeLessThanOrEqual(1e-9);
    expect(result.quality.low).toBe(false);
  });

  it("reports answered/skipped counts", () => {
    const answers: Answers = Object.fromEntries(
      quick.map((q, i) => [q.id, { r: i < 6 ? null : 1 }]),
    );
    const result = scoreTest(quick, answers);
    expect(result.answered).toBe(30);
    expect(result.skipped).toBe(6);
  });
});
