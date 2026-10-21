import { z } from "zod";
import { AXIS_IDS } from "@/data/axes";

export const nonEmpty = z.string().trim().min(1);

/** All three locales (UI-adjacent data such as axis and spectrum names). */
export const localizedFull = z.object({ en: nonEmpty, de: nonEmpty, fr: nonEmpty });

/** English required; de/fr added when that locale's content is completed (Phase 9). */
export const localizedPartial = z.object({
  en: nonEmpty,
  de: nonEmpty.optional(),
  fr: nonEmpty.optional(),
});

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ASCII kebab-case slug");

export const localizedSlugs = z.object({
  en: slugSchema,
  de: slugSchema.optional(),
  fr: slugSchema.optional(),
});

export const axisIdSchema = z.enum(AXIS_IDS);

/** Exhaustive per-axis record: every one of the twelve axes is required. */
export const coordsSchema = z.record(axisIdSchema, z.number().min(-100).max(100));
export const salienceSchema = z.record(axisIdSchema, z.number().min(0).max(1));

export const sourceSchema = z.object({
  title: nonEmpty,
  publisher: nonEmpty,
  url: z.url({ protocol: /^https$/ }),
  kind: z.enum(["encyclopedia", "academic", "dataset", "primary"]),
  /** Date the URL was opened and checked (YYYY-MM-DD). */
  accessed: z.iso.date(),
});

export const reviewSchema = z.object({
  status: z.enum(["draft", "reviewed"]),
  by: nonEmpty,
  date: z.iso.date(),
  notes: z.string().optional(),
});

/** One policy for every entry kind (D-030). */
export const atrocitySchema = z.object({
  basis: z.enum(["tribunal", "scholarly-consensus"]),
  note: localizedPartial,
  sources: z.array(sourceSchema).min(1),
});

export const placementSchema = z.object({
  confidence: z.enum(["high", "medium", "low"]),
  reason: localizedPartial,
});

export type Source = z.infer<typeof sourceSchema>;
