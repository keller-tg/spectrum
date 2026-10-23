import type { MetadataRoute } from "next";
import { CONTENT_COMPLETE, LOCALES, type Locale } from "@/data/locales";
import { getPathname } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Public, indexable static routes. Personal pages (results, dashboard) never appear.
 * Not served before launch (D-088); `npm run sitemap` writes generated/sitemap.xml to check it.
 */
export const ROUTES = [
  "/",
  "/test",
  "/compass",
  "/web",
  "/sandbox",
  "/ideologies",
  "/countries",
  "/figures",
  "/parties",
  "/method",
  "/privacy",
  "/imprint",
] as const;

export function sitemapEntries(): MetadataRoute.Sitemap {
  const indexable = LOCALES.filter((l) => CONTENT_COMPLETE[l]);
  const url = (locale: Locale, href: (typeof ROUTES)[number]) =>
    `${SITE_URL}${getPathname({ locale, href })}`;
  return ROUTES.flatMap((href) =>
    indexable.map((locale) => ({
      url: url(locale, href),
      alternates: { languages: Object.fromEntries(indexable.map((l) => [l, url(l, href)])) },
    })),
  );
}
