import { z } from "zod";
import { MODE_IDS } from "@/data/modes";

/**
 * The anonymous pilot answers file (PLAN §7a, D-072, minimised in D-089):
 * answers, rounded answer times, test length and the versions needed to
 * score them. No name, no date or time, no language, no device or browser
 * data, no ID; an optional country code is the only profile field.
 * Validated when the page writes it and again when pilot-analysis reads it.
 */
export const PILOT_FORMAT = "spectrum-pilot";
export const PILOT_VERSION = 2;
/** Answer times are rounded to this many milliseconds, so they carry no device timing detail. */
export const PILOT_MS_STEP = 100;
/** One fixed name for every file: the name is not an identifier either. */
export const PILOT_FILE_NAME = "spectrum-pilot.json";

export const pilotFileSchema = z
  .object({
    format: z.literal(PILOT_FORMAT),
    version: z.literal(PILOT_VERSION),
    bankVersion: z.string().min(1),
    engineVersion: z.string().min(1),
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
        ms: z
          .int()
          .min(0)
          .max(3_600_000)
          .refine((v) => v % PILOT_MS_STEP === 0, "rounded to 100 ms")
          .optional(),
      }),
    ),
    country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
  })
  .strict();

export type PilotFile = z.infer<typeof pilotFileSchema>;
