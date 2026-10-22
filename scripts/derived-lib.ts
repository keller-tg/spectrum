/** Shared by build-derived and the calibration report (Node only). */
import { createHash } from "node:crypto";
import { MODES } from "@/data/modes";
import { ACTIVE_QUESTIONS, modeQuestions } from "@/data/questions/bank";
import { syntheticDeepBank } from "@/lib/engine/simulate";
import type { BankItem } from "@/lib/engine/types";

export const shortHash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 8);

export function banks(): Record<"quick" | "standard" | "deep", readonly BankItem[]> {
  const standard = modeQuestions("standard");
  return {
    quick: modeQuestions("quick"),
    standard,
    deep:
      ACTIVE_QUESTIONS.length >= MODES.deep.count
        ? modeQuestions("deep")
        : syntheticDeepBank(standard),
  };
}
