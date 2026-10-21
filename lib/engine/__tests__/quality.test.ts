import { describe, expect, it } from "vitest";
import { MODES } from "@/data/modes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { assessQuality } from "../quality";
import { createRng } from "../random";
import { simulateAnswers } from "../simulate";
import type { Answers } from "../types";
import { axisVector } from "../vector";

const standard = QUESTION_BANK.slice(0, MODES.standard.count);

describe("quality checks", () => {
  it("does not flag an honest, varied respondent", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const coords = axisVector((_, i) => ((seed * 37 + i * 53) % 181) - 90);
      const q = assessQuality(
        standard,
        simulateAnswers(standard, coords, { sigma: 0.5, rng: createRng(seed) }),
      );
      expect(q.low, `seed ${seed}: ${q.flags.join(",")}`).toBe(false);
    }
  });

  it("flags contradictions on mirror pairs and names the axis", () => {
    // Strongly agree with every item: each mirror pair is fully contradictory.
    const answers: Answers = Object.fromEntries(standard.map((q) => [q.id, { r: 2, ms: 5000 }]));
    const q = assessQuality(standard, answers);
    expect(q.flags).toContain("contradiction");
    expect(q.contradictedAxes.length).toBe(12);
  });

  it("flags implausibly fast completion", () => {
    const answers = simulateAnswers(
      standard,
      axisVector(() => 40),
      { sigma: 0.5, rng: createRng(9), ms: 600 },
    );
    expect(assessQuality(standard, answers).flags).toContain("fast");
  });

  it("marks heavy skipping as sparse without calling it low quality", () => {
    const answers = simulateAnswers(
      standard,
      axisVector(() => -30),
      { sigma: 0.5, rng: createRng(4), skipRate: 0.5 },
    );
    const q = assessQuality(standard, answers);
    expect(q.flags).toContain("sparse");
    expect(q.flags.filter((f) => f !== "sparse")).toEqual([]);
  });
});
