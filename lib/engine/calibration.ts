import { AXIS_IDS } from "@/data/axes";
import type { ModeId } from "@/data/modes";
import { plainDistance } from "./calibrate";
import { rank } from "./match";
import { createRng, hashString } from "./random";
import { scoreTest } from "./score";
import { simulateAnswers, uniformAnswers } from "./simulate";
import type { BankItem, Matchable, RawAnswer } from "./types";

/**
 * Calibration suite (PLAN §6.6, D-014). Simulated respondents are generated from
 * catalog coordinates with answer noise, scored with the real engine and matched
 * against the catalog. The numbers are reported as they are: catalog data is
 * never bent to pass a gate.
 */

export const GATE_SIGMA = 0.5;
export const SIGMAS = [0, 0.5, 0.8, 1.0] as const;
/** "Clearly opposite": unweighted RMS distance between two entries of at least this. */
export const OPPOSITE_DISTANCE = 100;

export const GATES: Record<
  ModeId,
  { metric: "hit3" | "quickHit"; threshold: number; label: string }
> = {
  deep: { metric: "hit3", threshold: 0.9, label: "own ideology (or parent/child/family) in top 3" },
  standard: {
    metric: "hit3",
    threshold: 0.8,
    label: "own ideology (or parent/child/family) in top 3",
  },
  quick: {
    metric: "quickHit",
    threshold: 0.8,
    label: "own ideology in top 5, or top match in same family",
  },
};

export interface CalibrationRow {
  mode: ModeId;
  sigma: number;
  cases: number;
  /** Exact entry ranked first / in top 3 / in top 5. */
  strict1: number;
  strict3: number;
  strict5: number;
  /** Exact or parent/child in top 3. */
  lineage3: number;
  /** Top match in the same family. */
  family1: number;
  /** Spec hit: exact, parent/child or same family within top 3. */
  hit3: number;
  /** Quick gate: exact in top 5 or top match in same family. */
  quickHit: number;
  /** Cases where a clearly opposite entry outranked the archetype itself. */
  inversions: number;
}

export interface StraightLineRow {
  mode: ModeId;
  answer: RawAnswer;
  maxAbsScore: number;
  flagged: boolean;
}

export interface CalibrationReport {
  rows: CalibrationRow[];
  straightLine: StraightLineRow[];
  gates: { mode: ModeId; label: string; threshold: number; value: number; pass: boolean }[];
  inversionPass: boolean;
  entries: number;
  repeats: number;
}

export interface CalibrationOptions {
  entries: readonly Matchable[];
  banks: Record<ModeId, readonly BankItem[]>;
  tau: number;
  repeats?: number;
  seed?: number;
  sigmas?: readonly number[];
}

const related = (a: Matchable, b: Matchable) =>
  a.id === b.id || a.parent === b.id || b.parent === a.id;

export interface CaseOutcome {
  /** Rank of the archetype itself (0 = first, −1 = absent). */
  pos: number;
  lineage3: boolean;
  family1: boolean;
  hit3: boolean;
  quickHit: boolean;
  inversion: boolean;
}

/** How one simulated respondent's ranking scores against the archetype they were drawn from. */
export function caseOutcome(
  ranked: readonly { entry: Matchable }[],
  archetype: Matchable,
  opposites: readonly Matchable[],
): CaseOutcome {
  const ids = ranked.map((r) => r.entry.id);
  const pos = ids.indexOf(archetype.id);
  const top3 = ranked.slice(0, 3).map((r) => r.entry);
  const first = ranked[0]?.entry;
  const family1 = first?.family !== undefined && first.family === archetype.family;
  return {
    pos,
    lineage3: top3.some((e) => related(e, archetype)),
    family1,
    hit3: top3.some(
      (e) => related(e, archetype) || (e.family !== undefined && e.family === archetype.family),
    ),
    quickHit: (pos >= 0 && pos < 5) || family1,
    inversion: opposites.some((o) => ids.indexOf(o.id) < pos),
  };
}

export function runCalibration({
  entries,
  banks,
  tau,
  repeats = 20,
  seed = 7,
  sigmas = SIGMAS,
}: CalibrationOptions): CalibrationReport {
  const visible = entries.filter((e) => !e.hidden);
  const rows: CalibrationRow[] = [];

  for (const mode of ["quick", "standard", "deep"] as const) {
    const bank = banks[mode];
    for (const sigma of sigmas) {
      const row: CalibrationRow = {
        mode,
        sigma,
        cases: 0,
        strict1: 0,
        strict3: 0,
        strict5: 0,
        lineage3: 0,
        family1: 0,
        hit3: 0,
        quickHit: 0,
        inversions: 0,
      };
      for (const archetype of visible) {
        const opposites = visible.filter(
          (o) => plainDistance(o.coords, archetype.coords) >= OPPOSITE_DISTANCE,
        );
        const reps = sigma === 0 ? 1 : repeats;
        for (let rep = 0; rep < reps; rep++) {
          const rng = createRng(seed ^ hashString(`${mode}|${sigma}|${archetype.id}|${rep}`));
          const result = scoreTest(bank, simulateAnswers(bank, archetype.coords, { sigma, rng }));
          const c = caseOutcome(rank(result, visible, tau), archetype, opposites);

          row.cases++;
          if (c.pos === 0) row.strict1++;
          if (c.pos >= 0 && c.pos < 3) row.strict3++;
          if (c.pos >= 0 && c.pos < 5) row.strict5++;
          if (c.lineage3) row.lineage3++;
          if (c.family1) row.family1++;
          if (c.hit3) row.hit3++;
          if (c.quickHit) row.quickHit++;
          if (c.inversion) row.inversions++;
        }
      }
      for (const k of [
        "strict1",
        "strict3",
        "strict5",
        "lineage3",
        "family1",
        "hit3",
        "quickHit",
      ] as const) {
        row[k] = row.cases ? row[k] / row.cases : 0;
      }
      rows.push(row);
    }
  }

  const straightLine: StraightLineRow[] = [];
  for (const mode of ["quick", "standard", "deep"] as const) {
    for (const answer of [-2, -1, 0, 1, 2] as const) {
      const result = scoreTest(banks[mode], uniformAnswers(banks[mode], answer));
      straightLine.push({
        mode,
        answer,
        maxAbsScore: Math.max(...AXIS_IDS.map((a) => Math.abs(result.scores[a]))),
        flagged: result.quality.flags.includes("straightline"),
      });
    }
  }

  const gates = (["quick", "standard", "deep"] as const).map((mode) => {
    const gate = GATES[mode];
    const row = rows.find((r) => r.mode === mode && r.sigma === GATE_SIGMA);
    const value = row ? row[gate.metric] : 0;
    return {
      mode,
      label: gate.label,
      threshold: gate.threshold,
      value,
      pass: value >= gate.threshold,
    };
  });
  const inversionPass = rows.filter((r) => r.sigma <= GATE_SIGMA).every((r) => r.inversions === 0);

  return { rows, straightLine, gates, inversionPass, entries: visible.length, repeats };
}
