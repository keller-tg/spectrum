import type { ModeId } from "@/data/modes";
import { modeQuestions } from "@/data/questions/bank";
import { scoreTest } from "@/lib/engine/score";
import type { AnswerRecord } from "@/lib/engine/types";
import { ENGINE_VERSION } from "@/lib/engine/version";
import type { StoredResult } from "@/lib/storage/db";

/** Score a finished test and freeze it as a stored result (answers are the source of truth). */
export function buildResult(
  mode: ModeId,
  answers: Readonly<Record<string, AnswerRecord>>,
  bankVersion: string,
  now = new Date(),
): StoredResult {
  const items = modeQuestions(mode);
  const ids = new Set(items.map((q) => q.id));
  const own = Object.fromEntries(Object.entries(answers).filter(([id]) => ids.has(id)));
  const scored = scoreTest(items, own);
  return {
    createdAt: now.toISOString(),
    mode,
    answers: own,
    bankVersion,
    engineVersion: ENGINE_VERSION,
    scoresAsTaken: scored.scores,
    confidences: scored.confidences,
    overallConfidence: scored.overallConfidence,
    qualityFlags: scored.quality.flags,
    lowQuality: scored.quality.low,
  };
}

/** Every question of the mode has an answer or an explicit skip. */
export const isComplete = (mode: ModeId, answers: Readonly<Record<string, AnswerRecord>>) =>
  modeQuestions(mode).every((q) => answers[q.id] !== undefined);
