import type { Localized } from "./locales";

export const MODE_IDS = ["quick", "standard", "deep"] as const;
export type ModeId = (typeof MODE_IDS)[number];

export interface ModeDef {
  /** Questions in this mode. Modes are prefixes of one ordered bank (D-009). */
  count: number;
  perAxis: number;
  /** Honest estimate shown up front, at ~8 s per question. */
  minutes: number;
  /** Localized URL segment, e.g. /de/test/schnell/1. */
  slugs: Localized;
}

export const MODES: Record<ModeId, ModeDef> = {
  quick: { count: 36, perAxis: 3, minutes: 5, slugs: { en: "quick", de: "schnell", fr: "rapide" } },
  standard: {
    count: 72,
    perAxis: 6,
    minutes: 10,
    slugs: { en: "standard", de: "standard", fr: "standard" },
  },
  deep: {
    count: 144,
    perAxis: 12,
    minutes: 20,
    slugs: { en: "deep", de: "vertieft", fr: "approfondi" },
  },
};
