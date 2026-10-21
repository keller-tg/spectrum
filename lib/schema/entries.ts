import { z } from "zod";
import { SPECTRUM_IDS } from "@/data/spectrums";
import {
  atrocitySchema,
  coordsSchema,
  localizedPartial,
  localizedSlugs,
  nonEmpty,
  placementSchema,
  reviewSchema,
  salienceSchema,
  slugSchema,
  sourceSchema,
} from "./common";

export const TAG_IDS = [
  "religious",
  "ecological",
  "populist",
  "pacifist",
  "technological",
  "agrarian",
  "feminist",
  "ethnonationalist",
  "online-satirical",
] as const;
export type TagId = (typeof TAG_IDS)[number];

export const spectrumSchema = z.enum(SPECTRUM_IDS);

export const familySchema = z.object({
  id: slugSchema,
  names: localizedPartial,
  spectrumHome: spectrumSchema,
  description: localizedPartial,
});

/** Fields every catalog entry shares (ideology, country, regime, figure, party). */
const entryBase = {
  id: slugSchema,
  status: z.enum(["stub", "complete"]),
  names: localizedPartial,
  slugs: localizedSlugs,
  coords: coordsSchema,
  salience: salienceSchema,
  /** Short "why these coordinates". */
  rationale: localizedPartial,
  sources: z.array(sourceSchema).min(2),
  placement: placementSchema,
  /** True for living people, current parties and modern countries: labelled "editorial estimate". */
  estimate: z.boolean(),
  atrocity: atrocitySchema.optional(),
  review: reviewSchema,
};

const ideologyContent = z.object({
  summary: nonEmpty,
  /** One sentence. Third person for extremist entries (D-030). */
  voice: nonEmpty,
  coreBeliefs: z.array(nonEmpty).min(3).max(7),
  origins: nonEmpty,
  keyThinkers: z.array(z.object({ name: nonEmpty, years: z.string().optional(), note: z.string().optional() })).min(1),
  historicalExamples: z.array(nonEmpty).min(1),
  criticisms: z.array(z.object({ point: nonEmpty, from: nonEmpty })).min(2),
  /** Documented harms; required for extremist entries. */
  harms: z.string().optional(),
  /** Who uses the label, who disputes it, how adherents describe themselves; required for academic/contested labels. */
  nameNote: z.string().optional(),
});

export const ideologySchema = z
  .object({
    ...entryBase,
    kind: z.literal("ideology"),
    tier: z.enum(["A", "B"]),
    aka: z.array(nonEmpty).optional(),
    spectrum: spectrumSchema,
    tags: z.array(z.enum(TAG_IDS)),
    family: slugSchema,
    /** Present for variants: an ideology in the same family (family → ideology → variant). */
    parent: slugSchema.optional(),
    labelStatus: z.enum(["self-described", "academic", "contested"]),
    termOrigin: localizedPartial,
    extremist: z.boolean(),
    classificationNote: localizedPartial.optional(),
    content: z.object({ en: ideologyContent, de: ideologyContent.optional(), fr: ideologyContent.optional() }).optional(),
    avatar: z.object({ seed: nonEmpty, motif: nonEmpty }).optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.status !== "complete") return;
    const en = entry.content?.en;
    if (!en) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "complete entries need content.en" });
      return;
    }
    if (entry.labelStatus !== "self-described" && !en.nameNote) {
      ctx.addIssue({ code: "custom", path: ["content", "en", "nameNote"], message: "academic/contested labels need a name note" });
    }
    if (entry.extremist && !en.harms) {
      ctx.addIssue({ code: "custom", path: ["content", "en", "harms"], message: "extremist entries need a documented-harms section" });
    }
    if (!entry.avatar) {
      ctx.addIssue({ code: "custom", path: ["avatar"], message: "complete entries need an avatar" });
    }
  });

export type Family = z.infer<typeof familySchema>;
export type Ideology = z.infer<typeof ideologySchema>;
export type IdeologyInput = z.input<typeof ideologySchema>;
