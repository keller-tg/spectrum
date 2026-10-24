import { z } from "zod";
import { AXIS_IDS } from "@/data/axes";
import { MODE_IDS } from "@/data/modes";

/**
 * "Export my data" file (D-092): every stored result with its answers, the
 * snapshot as taken, and private notes. It holds political views, so the
 * dashboard says so before saving. Import validates it with this schema and
 * skips results that are already stored.
 */
export const HISTORY_FORMAT = "spectrum-history";
export const HISTORY_VERSION = 1;

const axisVector = z.strictObject(
  Object.fromEntries(AXIS_IDS.map((a) => [a, z.number().min(-100).max(100)])) as Record<
    (typeof AXIS_IDS)[number],
    z.ZodNumber
  >,
);
const confidenceVector = z.strictObject(
  Object.fromEntries(AXIS_IDS.map((a) => [a, z.number().min(0).max(1)])) as Record<
    (typeof AXIS_IDS)[number],
    z.ZodNumber
  >,
);

export const storedResultSchema = z.strictObject({
  createdAt: z.iso.datetime(),
  mode: z.enum(MODE_IDS),
  answers: z.record(
    z.string().regex(/^q-[a-z]+-\d{2}$/),
    z.strictObject({
      r: z.union([
        z.literal(-2),
        z.literal(-1),
        z.literal(0),
        z.literal(1),
        z.literal(2),
        z.null(),
      ]),
      ms: z.number().min(0).max(3_600_000).optional(),
    }),
  ),
  bankVersion: z.string().min(1),
  engineVersion: z.string().min(1),
  scoresAsTaken: axisVector,
  confidences: confidenceVector,
  overallConfidence: z.number().min(0).max(1),
  qualityFlags: z.array(
    z.enum(["straightline", "acquiescence", "contradiction", "fast", "sparse"]),
  ),
  lowQuality: z.boolean(),
  note: z.string().max(5000).optional(),
});

export const historyFileSchema = z.strictObject({
  format: z.literal(HISTORY_FORMAT),
  version: z.literal(HISTORY_VERSION),
  exportedAt: z.iso.datetime(),
  results: z.array(storedResultSchema).max(10_000),
});

export type HistoryFile = z.infer<typeof historyFileSchema>;
