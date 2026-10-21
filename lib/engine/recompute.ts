import { scoreTest, type ScoreResult } from "./score";
import type { Answers, AxisVector, BankItem } from "./types";
import { ENGINE_VERSION } from "./version";

/** What a stored result keeps so it can always be recomputed (PLAN §6.8). */
export interface StoredScoring {
  answers: Answers;
  engineVersion: string;
  scoresAsTaken: AxisVector;
}

export const needsRecompute = (stored: Pick<StoredScoring, "engineVersion">) =>
  stored.engineVersion !== ENGINE_VERSION;

/**
 * Re-score stored answers with the current engine. Retired questions stay in
 * the bank (never deleted), so old answers remain scorable.
 */
export function recompute(
  items: readonly BankItem[],
  stored: StoredScoring,
): { asTaken: AxisVector; current: ScoreResult; changed: boolean } {
  const current = scoreTest(items, stored.answers);
  return { asTaken: stored.scoresAsTaken, current, changed: needsRecompute(stored) };
}
