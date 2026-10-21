/** Supported locales. Kept framework-free so data files and the engine can share it. */
export const LOCALES = ["en", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A string in every locale. Content locales other than `en` may lag until Phase 9 (D-027). */
export type Localized<T = string> = Record<Locale, T>;
/** English is required; other locales are filled in when their content is complete. */
export type PartialLocalized<T = string> = { en: T } & Partial<Record<Exclude<Locale, "en">, T>>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Whether a locale's *content* (questions, catalog) is complete. Incomplete
 * locales render with a notice, stay noindex and are left out of the sitemap (D-027).
 */
export const CONTENT_COMPLETE: Record<Locale, boolean> = { en: true, de: false, fr: false };
