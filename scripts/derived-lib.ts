/** Shared by build-derived and the calibration report (Node only). */
import { createHash } from "node:crypto";
import { MODES } from "@/data/modes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { syntheticDeepBank } from "@/lib/engine/simulate";
import type { BankItem } from "@/lib/engine/types";

export const shortHash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 8);

export function banks(): Record<"quick" | "standard" | "deep", readonly BankItem[]> {
  const active = QUESTION_BANK.filter((q) => !q.retired);
  const standard = active.slice(0, MODES.standard.count);
  return {
    quick: active.slice(0, MODES.quick.count),
    standard,
    deep:
      active.length >= MODES.deep.count
        ? active.slice(0, MODES.deep.count)
        : syntheticDeepBank(standard),
  };
}
