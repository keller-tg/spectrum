import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { modeQuestions } from "@/data/questions/bank";
import { createRng } from "../random";
import { answerMoments, centristExpectation, drawOffsets, STYLE_LIST } from "../robustness";
import { RESPONSE_STYLES, simulateAnswers } from "../simulate";
import { axisVector } from "../vector";

const standard = modeQuestions("standard");
const quick = modeQuestions("quick");

describe("response styles", () => {
  it("baseline thresholds reproduce plain rounding", () => {
    const coords = axisVector((a) => ((AXIS_IDS.indexOf(a) * 37) % 201) - 100);
    const plain = simulateAnswers(standard, coords, { sigma: 0.8, rng: createRng(3) });
    const styled = simulateAnswers(standard, coords, {
      sigma: 0.8,
      rng: createRng(3),
      style: RESPONSE_STYLES.baseline,
    });
    for (const q of standard)
      expect(styled[q.id]?.r).toBe(plain[q.id]?.r === 0 ? 0 : plain[q.id]?.r);
  });

  it("extremity-averse respondents never give a strong answer", () => {
    const coords = axisVector(() => 100);
    const answers = simulateAnswers(standard, coords, {
      sigma: 1.2,
      rng: createRng(9),
      style: RESPONSE_STYLES.extremityAverse,
    });
    for (const q of standard) expect(Math.abs(answers[q.id]?.r ?? 0)).toBeLessThanOrEqual(1);
  });

  it("answer moments match the deterministic case at σ = 0", () => {
    expect(answerMoments(0.6, 0, RESPONSE_STYLES.baseline)).toEqual({ mean: 1, variance: 0 });
    expect(answerMoments(0.9, 0, RESPONSE_STYLES.midpoint).mean).toBe(0);
  });
});

describe("true centrist", () => {
  it("lands exactly at 0 under every style when items are equally easy (any mode, any noise)", () => {
    for (const bank of [quick, standard])
      for (const style of STYLE_LIST)
        for (const sigma of [0, 0.5, 1.2]) {
          const e = centristExpectation(bank, style, sigma, {});
          for (const a of AXIS_IDS)
            expect(Math.abs(e[a].mean), `${style.id} ${a}`).toBeLessThan(1e-9);
        }
  });

  it("drifts once items differ in how easy they are to agree with", () => {
    const e = centristExpectation(
      standard,
      RESPONSE_STYLES.baseline,
      0.8,
      drawOffsets(standard, 0.6, 0),
    );
    expect(Math.max(...AXIS_IDS.map((a) => Math.abs(e[a].mean)))).toBeGreaterThan(1);
  });
});
