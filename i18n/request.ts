import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // An explicit locale comes from page params too, so it is checked like the root param:
  // "/sitemap.xml" reaches [locale] as "sitemap.xml" and must be a 404, not a missing module.
  const resolved = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, resolved)) notFound();
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
