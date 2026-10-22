import type { Question } from "@/lib/schema/questions";
import { MODES, type ModeId } from "../modes";

/**
 * The single ordered question bank. Modes are prefixes: Quick = 1–36,
 * Standard = 1–72, Deep = 1–144 (Deep items arrive in Phase 9).
 *
 * Layout (D-061): blocks of 12, each with every axis exactly once, so any
 * 12k-prefix is balanced. Block 1 opens with low-heat items and holds each
 * axis's first mirror item; the second halves are split across blocks 2 and 3
 * (opposite key, ≥ 15 positions later) so they never arrive as a run. Blocks
 * 4–6 complete Standard at 3+/3− per axis. Quick alternates 2+/1− and 1+/2−
 * across axes (18/18 overall).
 *
 * key  1: agreeing moves toward the +100 pole (second-named);
 * key −1: agreeing moves toward the −100 pole (first-named).
 * Never change the meaning of an existing id: retire it and add a new one
 * (`replaces` names the retired item it stands in for). Revision 2 (D-067–D-070).
 */
export const QUESTION_BANK: readonly Question[] = [
  { id: "q-part-01", axis: "participation", key: -1, order: 1 },
  { id: "q-dist-01", axis: "distribution", key: -1, order: 2 },
  { id: "q-cent-01", axis: "centralization", key: 1, order: 3 },
  { id: "q-nat-01", axis: "nation", key: -1, order: 4 },
  { id: "q-own-07", axis: "ownership", key: 1, order: 5, replaces: "q-own-01" },
  { id: "q-eco-01", axis: "ecology", key: -1, order: 6 },
  { id: "q-int-01", axis: "intervention", key: -1, order: 7 },
  { id: "q-rel-01", axis: "religion", key: -1, order: 8 },
  { id: "q-lib-01", axis: "liberty", key: -1, order: 9 },
  { id: "q-trade-01", axis: "trade", key: -1, order: 10 },
  { id: "q-trad-08", axis: "tradition", key: 1, order: 11, replaces: "q-trad-04" },
  { id: "q-bord-07", axis: "borders", key: 1, order: 12, replaces: "q-bord-01" },
  { id: "q-rel-03", axis: "religion", key: 1, order: 13 },
  { id: "q-trade-03", axis: "trade", key: -1, order: 14 },
  { id: "q-lib-03", axis: "liberty", key: 1, order: 15 },
  { id: "q-int-03", axis: "intervention", key: -1, order: 16 },
  { id: "q-trad-02", axis: "tradition", key: -1, order: 17, empirical: true },
  { id: "q-bord-08", axis: "borders", key: 1, order: 18, replaces: "q-bord-03" },
  { id: "q-dist-02", axis: "distribution", key: 1, order: 19, mirrorOf: "q-dist-01" },
  { id: "q-part-02", axis: "participation", key: 1, order: 20, mirrorOf: "q-part-01" },
  { id: "q-eco-02", axis: "ecology", key: 1, order: 21, mirrorOf: "q-eco-01" },
  {
    id: "q-own-08",
    axis: "ownership",
    key: -1,
    order: 22,
    mirrorOf: "q-own-07",
    replaces: "q-own-04",
  },
  { id: "q-cent-02", axis: "centralization", key: -1, order: 23, mirrorOf: "q-cent-01" },
  { id: "q-nat-02", axis: "nation", key: 1, order: 24, mirrorOf: "q-nat-01" },
  { id: "q-eco-03", axis: "ecology", key: -1, order: 25, empirical: true },
  { id: "q-trade-02", axis: "trade", key: 1, order: 26, mirrorOf: "q-trade-01" },
  { id: "q-part-03", axis: "participation", key: 1, order: 27 },
  {
    id: "q-bord-09",
    axis: "borders",
    key: -1,
    order: 28,
    mirrorOf: "q-bord-07",
    replaces: "q-bord-02",
  },
  { id: "q-own-03", axis: "ownership", key: 1, order: 29, empirical: true },
  { id: "q-lib-02", axis: "liberty", key: 1, order: 30, mirrorOf: "q-lib-01" },
  { id: "q-trad-03", axis: "tradition", key: -1, order: 31, mirrorOf: "q-trad-08" },
  { id: "q-nat-07", axis: "nation", key: 1, order: 32, replaces: "q-nat-03" },
  { id: "q-dist-03", axis: "distribution", key: -1, order: 33 },
  { id: "q-rel-02", axis: "religion", key: 1, order: 34, mirrorOf: "q-rel-01" },
  { id: "q-cent-03", axis: "centralization", key: -1, order: 35, empirical: true },
  { id: "q-int-02", axis: "intervention", key: 1, order: 36, mirrorOf: "q-int-01" },
  { id: "q-lib-04", axis: "liberty", key: -1, order: 37 },
  { id: "q-trad-07", axis: "tradition", key: 1, order: 38, replaces: "q-trad-01" },
  { id: "q-nat-08", axis: "nation", key: -1, order: 39, replaces: "q-nat-04" },
  { id: "q-own-02", axis: "ownership", key: -1, order: 40 },
  { id: "q-cent-04", axis: "centralization", key: 1, order: 41 },
  { id: "q-rel-04", axis: "religion", key: -1, order: 42 },
  { id: "q-int-07", axis: "intervention", key: 1, order: 43, replaces: "q-int-04" },
  { id: "q-dist-04", axis: "distribution", key: 1, order: 44 },
  { id: "q-part-04", axis: "participation", key: 1, order: 45, empirical: true },
  { id: "q-eco-04", axis: "ecology", key: 1, order: 46 },
  { id: "q-bord-04", axis: "borders", key: -1, order: 47, empirical: true },
  { id: "q-trade-04", axis: "trade", key: 1, order: 48, empirical: true },
  { id: "q-eco-05", axis: "ecology", key: 1, order: 49 },
  { id: "q-bord-05", axis: "borders", key: -1, order: 50 },
  { id: "q-dist-05", axis: "distribution", key: 1, order: 51 },
  { id: "q-lib-05", axis: "liberty", key: 1, order: 52 },
  { id: "q-trad-05", axis: "tradition", key: 1, order: 53 },
  { id: "q-nat-05", axis: "nation", key: -1, order: 54 },
  { id: "q-trade-05", axis: "trade", key: 1, order: 55 },
  { id: "q-part-05", axis: "participation", key: -1, order: 56 },
  { id: "q-rel-05", axis: "religion", key: 1, order: 57 },
  { id: "q-int-05", axis: "intervention", key: 1, order: 58 },
  { id: "q-own-05", axis: "ownership", key: 1, order: 59 },
  { id: "q-cent-05", axis: "centralization", key: 1, order: 60 },
  { id: "q-bord-10", axis: "borders", key: 1, order: 61, replaces: "q-bord-06" },
  { id: "q-own-09", axis: "ownership", key: -1, order: 62, replaces: "q-own-06" },
  { id: "q-part-06", axis: "participation", key: -1, order: 63 },
  { id: "q-eco-06", axis: "ecology", key: -1, order: 64 },
  { id: "q-nat-06", axis: "nation", key: 1, order: 65 },
  { id: "q-trade-06", axis: "trade", key: -1, order: 66 },
  { id: "q-lib-06", axis: "liberty", key: -1, order: 67 },
  { id: "q-rel-06", axis: "religion", key: -1, order: 68 },
  { id: "q-dist-06", axis: "distribution", key: -1, order: 69 },
  { id: "q-cent-07", axis: "centralization", key: -1, order: 70, replaces: "q-cent-06" },
  { id: "q-trad-06", axis: "tradition", key: -1, order: 71 },
  { id: "q-int-08", axis: "intervention", key: -1, order: 72, replaces: "q-int-06" },

  // Retired in revision 2 (2026-10-22). Kept with their last position so old
  // answers stay scorable and the change log can show before/after.
  { id: "q-own-01", axis: "ownership", key: 1, order: 5, retired: true },
  { id: "q-trad-01", axis: "tradition", key: 1, order: 11, retired: true },
  { id: "q-bord-01", axis: "borders", key: 1, order: 12, retired: true },
  { id: "q-bord-03", axis: "borders", key: 1, order: 18, retired: true },
  { id: "q-trad-04", axis: "tradition", key: 1, order: 38, retired: true },
  { id: "q-own-04", axis: "ownership", key: -1, order: 40, retired: true },
  {
    id: "q-bord-02",
    axis: "borders",
    key: -1,
    order: 28,
    mirrorOf: "q-bord-01",
    retired: true,
  },
  { id: "q-nat-03", axis: "nation", key: 1, order: 32, retired: true },
  { id: "q-nat-04", axis: "nation", key: -1, order: 39, retired: true },
  { id: "q-int-04", axis: "intervention", key: 1, order: 43, retired: true },
  { id: "q-bord-06", axis: "borders", key: 1, order: 61, retired: true },
  { id: "q-own-06", axis: "ownership", key: -1, order: 62, retired: true },
  { id: "q-cent-06", axis: "centralization", key: -1, order: 70, retired: true },
  {
    id: "q-int-06",
    axis: "intervention",
    key: -1,
    order: 72,
    mirrorOf: "q-int-05",
    retired: true,
  },
];

/** Active items in display order. */
export const ACTIVE_QUESTIONS: readonly Question[] = QUESTION_BANK.filter((q) => !q.retired).sort(
  (a, b) => a.order - b.order,
);

/** The items of one mode: a prefix of the active bank (D-009). */
export const modeQuestions = (mode: ModeId): readonly Question[] =>
  ACTIVE_QUESTIONS.slice(0, MODES[mode].count);
