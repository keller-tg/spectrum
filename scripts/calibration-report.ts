/** Prints the calibration table and writes generated/calibration-report.md (PLAN §6.6). */
import { mkdirSync, writeFileSync } from "node:fs";
import { loadIdeologies, toMatchable } from "@/lib/catalog/ideologies";
import { fitTau } from "@/lib/engine/calibrate";
import { runCalibration, GATE_SIGMA } from "@/lib/engine/calibration";
import { banks } from "./derived-lib";

const repeats = Number(process.env.CALIBRATION_REPEATS ?? 30);
const entries = loadIdeologies().map(toMatchable);
const tau = fitTau(entries);
const report = runCalibration({ entries, banks: banks(), tau: tau.tau, repeats });

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const lines = [
  "# Calibration report",
  "",
  `Catalog: ${report.entries} ideologies · ${repeats} simulated respondents per entry and noise level · τ = ${tau.tau.toFixed(1)}.`,
  "Simulated answer = 2·key·coord/100 + N(0, σ²), rounded to the 5-point scale. Deep uses the bank structure until its items exist.",
  "",
  "## Gates (σ = " + GATE_SIGMA + ")",
  "",
  "| Mode | Gate | Value | Threshold | Result |",
  "|---|---|---|---|---|",
  ...report.gates.map(
    (g) =>
      `| ${g.mode} | ${g.label} | ${pct(g.value)} | ${pct(g.threshold)} | ${g.pass ? "pass" : "**FAIL**"} |`,
  ),
  `| all | (c) archetype never ranked below a clearly opposite entry (σ ≤ ${GATE_SIGMA}) | | 0 inversions | ${report.inversionPass ? "pass" : "**FAIL**"} |`,
  "",
  "## All numbers",
  "",
  "| Mode | σ | strict@1 | strict@3 | strict@5 | parent/child@3 | family@1 | spec hit@3 | quick hit | inversions |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...report.rows.map(
    (r) =>
      `| ${r.mode} | ${r.sigma} | ${pct(r.strict1)} | ${pct(r.strict3)} | ${pct(r.strict5)} | ${pct(r.lineage3)} | ${pct(r.family1)} | ${pct(r.hit3)} | ${pct(r.quickHit)} | ${r.inversions} |`,
  ),
  "",
  "## Straight-lining (test b)",
  "",
  "| Mode | Answer to everything | max |score| | flagged |",
  "|---|---|---|---|",
  ...report.straightLine.map(
    (s) => `| ${s.mode} | ${s.answer} | ${s.maxAbsScore} | ${s.flagged ? "yes" : "no"} |`,
  ),
  "",
  "## Similarity curve (placeholder, re-tune on real data)",
  "",
  `Median best match ${tau.medianTop1Similarity.toFixed(1)}% · median 5th match ${tau.medianTop5Similarity.toFixed(1)}% · users with 3+ matches ≥ 90 %: ${pct(tau.shareThreeAbove90)} (population ${tau.population}).`,
  "",
];
mkdirSync("generated", { recursive: true });
writeFileSync("generated/calibration-report.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(report.gates.every((g) => g.pass) && report.inversionPass ? 0 : 1);
