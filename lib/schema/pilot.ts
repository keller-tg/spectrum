import { z } from "zod";
import { LOCALES } from "@/data/locales";
import { MODE_IDS } from "@/data/modes";

/**
 * The anonymous pilot answers file (PLAN §7a, D-072): no name, no date, no
 * device data; an optional country code is the only profile field. Validated
 * when the page writes it and again when pilot-analysis reads it.
 */
export const PILOT_FORMAT = "spectrum-pilot";
export const PILOT_VERSION = 1;

export const pilotFileSchema = z
  .object({
    format: z.literal(PILOT_FORMAT),
    version: z.literal(PILOT_VERSION),
    bankVersion: z.string().min(1),
    engineVersion: z.string().min(1),
    mode: z.enum(MODE_IDS),
    locale: z.enum(LOCALES),
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
        ms: z.int().min(0).max(3_600_000).optional(),
      }),
    ),
    country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
  })
  .strict();

export type PilotFile = z.infer<typeof pilotFileSchema>;
