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
  keyThinkers: z
    .array(z.object({ name: nonEmpty, years: z.string().optional(), note: z.string().optional() }))
    .min(1),
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
    content: z
      .object({
        en: ideologyContent,
        de: ideologyContent.optional(),
        fr: ideologyContent.optional(),
      })
      .optional(),
    avatar: z.object({ seed: nonEmpty, motif: nonEmpty }).optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.status !== "complete") return;
    const en = entry.content?.en;
    if (!en) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "complete entries need content.en",
      });
      return;
    }
    if (entry.labelStatus !== "self-described" && !en.nameNote) {
      ctx.addIssue({
        code: "custom",
        path: ["content", "en", "nameNote"],
        message: "academic/contested labels need a name note",
      });
    }
    if (entry.extremist && !en.harms) {
      ctx.addIssue({
        code: "custom",
        path: ["content", "en", "harms"],
        message: "extremist entries need a documented-harms section",
      });
    }
    if (!entry.avatar) {
      ctx.addIssue({
        code: "custom",
        path: ["avatar"],
        message: "complete entries need an avatar",
      });
    }
  });

export type Family = z.infer<typeof familySchema>;
export type Ideology = z.infer<typeof ideologySchema>;
export type IdeologyInput = z.input<typeof ideologySchema>;

// ---------------------------------------------------------------------------
// Countries, regimes, figures, parties (populated in Phase 5)

const iso2 = z.string().regex(/^[A-Z]{2}$/, "ISO 3166-1 alpha-2");

/** Licence allowlist for Commons images (D-032). Metadata comes from the Commons API, never typed by hand. */
export const IMAGE_LICENSES = [
  "PD",
  "CC0",
  "CC BY 2.0",
  "CC BY 3.0",
  "CC BY 4.0",
  "CC BY-SA 2.0",
  "CC BY-SA 3.0",
  "CC BY-SA 4.0",
] as const;

export const commonsImageSchema = z.object({
  file: nonEmpty,
  sourceUrl: z.url({ protocol: /^https$/, hostname: /^commons\.wikimedia\.org$/ }),
  author: nonEmpty,
  license: z.enum(IMAGE_LICENSES),
  licenseUrl: z.url().optional(),
  attribution: nonEmpty,
});

export const bookSchema = z.object({
  title: nonEmpty,
  author: nonEmpty,
  year: z.int(),
  isbn: z
    .string()
    .regex(/^(97[89])?\d{9}[\dX]$/)
    .optional(),
  links: z.object({
    openLibrary: z.url().optional(),
    /** Off at launch; when used, the UI shows a visible disclosure (D-036). */
    affiliate: z.object({ url: z.url(), program: nonEmpty }).optional(),
  }),
});

const entryContent = z.object({
  summary: nonEmpty,
  criticisms: z
    .array(z.object({ point: nonEmpty, from: nonEmpty }))
    .min(1)
    .optional(),
});
const contentRecord = z
  .object({ en: entryContent, de: entryContent.optional(), fr: entryContent.optional() })
  .optional();

export const countrySchema = z.object({
  ...entryBase,
  kind: z.literal("country"),
  iso2,
  /** Coordinates describe the policy regime in force on this date, not public opinion (D-034). */
  asOf: z.iso.date(),
  government: localizedPartial,
  content: contentRecord,
});

export const regimeSchema = z
  .object({
    ...entryBase,
    kind: z.literal("regime"),
    country: iso2.optional(),
    period: z.object({ from: z.int(), to: z.int() }),
    asOf: z.int(),
    content: contentRecord,
  })
  .refine((r) => r.period.from <= r.asOf && r.asOf <= r.period.to, {
    message: "asOf must fall inside the period",
    path: ["asOf"],
  });

export const figureSchema = z
  .object({
    ...entryBase,
    kind: z.literal("figure"),
    born: z.int(),
    died: z.int().optional(),
    living: z.boolean(),
    roles: z.array(nonEmpty).min(1),
    countries: z.array(iso2).min(1),
    ideologies: z.array(slugSchema),
    image: commonsImageSchema.optional(),
    books: z.array(bookSchema).optional(),
    content: contentRecord,
  })
  .refine((f) => !f.living || f.estimate, {
    message: "living people are always editorial estimates",
    path: ["estimate"],
  })
  .refine((f) => f.living === (f.died === undefined), {
    message: "living ⇔ no death year",
    path: ["died"],
  });

export const partySchema = z
  .object({
    ...entryBase,
    kind: z.literal("party"),
    /** ISO country, or "EU" for European Parliament groups. */
    country: z.union([iso2, z.literal("EU")]),
    active: z.boolean(),
    asOf: z.iso.date(),
    /** Many-to-many: parties reference ideologies, never the reverse (spec v2). */
    ideologies: z.array(slugSchema).min(1),
    content: contentRecord,
  })
  .refine((p) => !p.active || p.estimate, {
    message: "current parties are always editorial estimates",
    path: ["estimate"],
  });

export type Country = z.infer<typeof countrySchema>;
export type Regime = z.infer<typeof regimeSchema>;
export type Figure = z.infer<typeof figureSchema>;
export type Party = z.infer<typeof partySchema>;
