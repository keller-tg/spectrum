import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES, type ModeId } from "@/data/modes";

/** Resolve a localized mode segment (e.g. "schnell") to its mode id. */
export function modeFromSlug(locale: Locale, slug: string): ModeId | undefined {
  return MODE_IDS.find((id) => MODES[id].slugs[locale] === slug);
}

export function modeSlug(locale: Locale, mode: ModeId): string {
  return MODES[mode].slugs[locale];
}

type Params = Record<string, string | string[] | undefined>;

/**
 * Translate dynamic route params when switching language, so /de/test/schnell/4
 * becomes /en/test/quick/4 rather than a broken /en/test/schnell/4.
 * Entry slugs (ideologies etc.) join this map in Phase 5.
 */
export function translateParams(params: Params, from: Locale, to: Locale): Params {
  // The locale segment is supplied separately by next-intl.
  const { locale: _locale, ...rest } = params;
  void _locale;
  const out: Params = { ...rest };
  const mode = params.mode;
  if (typeof mode === "string") {
    const id = modeFromSlug(from, mode);
    if (id) out.mode = modeSlug(to, id);
  }
  return out;
}
