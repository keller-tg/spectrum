import { z } from "zod";
import { axisIdSchema, nonEmpty } from "./common";

export const questionSchema = z.object({
  /** Stable forever: never change the meaning of an existing id; retire and add a new one. */
  id: z.string().regex(/^q-[a-z]+-\d{2}$/),
  axis: axisIdSchema,
  /** +1: agreeing moves toward the +100 pole; −1: toward the −100 pole. */
  key: z.union([z.literal(1), z.literal(-1)]),
  /** 1-based position in the single ordered bank; modes are prefixes (D-009). */
  order: z.int().positive(),
  /** Base weight before keying balance; reserved for later discrimination estimates. */
  weight: z.number().positive().optional(),
  /** Opposite-keyed, near-opposite item on the same axis, for contradiction checks. */
  mirrorOf: z.string().optional(),
  /** Kept so old results stay scorable; never shown again. */
  retired: z.boolean().optional(),
});

export const questionTextSchema = z.object({ text: nonEmpty, explainer: nonEmpty });

export type Question = z.infer<typeof questionSchema>;
export type QuestionText = z.infer<typeof questionTextSchema>;
