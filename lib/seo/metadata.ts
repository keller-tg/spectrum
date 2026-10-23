import type { Metadata } from "next";
import { CONTENT_COMPLETE, LOCALES, type Locale } from "@/data/locales";
import { getPathname } from "@/i18n/navigation";
import { LAUNCHED } from "./launch";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Canonical + hreflang for one logical page, given its href in each locale. */
export function alternatesFor(
  locale: Locale,
  hrefFor: (locale: Locale) => Href,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = getPathname({ locale: l, href: hrefFor(l) });
  languages["x-default"] = languages.en ?? "/en";
  return { canonical: languages[locale] ?? null, languages };
}

interface PageMetaInput {
  locale: Locale;
  title: string;
  description: string;
  hrefFor: (locale: Locale) => Href;
  /** Personal or utility pages are never indexed. */
  noindex?: boolean;
}

export function pageMetadata({
  locale,
  title,
  description,
  hrefFor,
  noindex,
}: PageMetaInput): Metadata {
  const indexable = LAUNCHED && !noindex && CONTENT_COMPLETE[locale];
  return {
    title,
    description,
    alternates: alternatesFor(locale, hrefFor),
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: { title, description, locale, type: "website" },
  };
}
