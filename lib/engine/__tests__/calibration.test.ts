import { describe, expect, it } from "vitest";
import { MODES } from "@/data/modes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { loadIdeologies, toMatchable } from "@/lib/catalog/ideologies";
import { fitTau } from "../calibrate";
import { runCalibration } from "../calibration";
import { syntheticDeepBank } from "../simulate";

/**
 * Calibration gates on the real catalog (PLAN §6.6). Numbers are printed so
 * every run shows them; `npm run calibration` writes the full report.
 */
const entries = loadIdeologies().map(toMatchable);
const standard = QUESTION_BANK.slice(0, MODES.standard.count);
const banks = {
  quick: QUESTION_BANK.slice(0, MODES.quick.count),
  standard,
  deep: syntheticDeepBank(standard),
};

describe.runIf(entries.length >= 20)("calibration on the catalog", () => {
  const tau = fitTau(entries, { size: 5000 });
  const report = runCalibration({ entries, banks, tau: tau.tau, repeats: 12 });

  it("prints the numbers", () => {
    console.table(
      report.gates.map((g) => ({
        mode: g.mode,
        value: `${(g.value * 100).toFixed(1)}%`,
        threshold: `${g.threshold * 100}%`,
        pass: g.pass,
      })),
    );
    expect(report.rows.length).toBeGreaterThan(0);
  });

  it("(a) archetypes come back near themselves in every mode", () => {
    for (const g of report.gates)
      expect(g.value, `${g.mode}: ${g.label}`).toBeGreaterThanOrEqual(g.threshold);
  });

  it("(b) all-agree and other straight-liners land at exactly 0 and are flagged", () => {
    for (const s of report.straightLine) {
      expect(s.maxAbsScore, `${s.mode} ${s.answer}`).toBe(0);
      expect(s.flagged).toBe(true);
    }
  });

  it("(c) an archetype never ranks below a clearly opposite entry", () => {
    expect(report.inversionPass).toBe(true);
  });

  it("similarity spreads: best ≈ 75 %, few users get three 90 %+ matches", () => {
    expect(tau.medianTop1Similarity).toBeCloseTo(75, 0);
    expect(tau.shareThreeAbove90).toBeLessThan(0.1);
  });
});
