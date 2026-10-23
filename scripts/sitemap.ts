/**
 * Writes generated/sitemap.xml from the same entries the launched site will
 * serve (D-088), so the sitemap can be checked before it is published.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { sitemapEntries } from "@/lib/seo/sitemap";

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...sitemapEntries().map((e) =>
    [
      `  <url><loc>${e.url}</loc>`,
      ...Object.entries(e.alternates?.languages ?? {}).map(
        ([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`,
      ),
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
].join("\n");
mkdirSync("generated", { recursive: true });
writeFileSync("generated/sitemap.xml", `${xml}\n`);
console.log(
  `sitemap: ${sitemapEntries().length} URLs → generated/sitemap.xml (not published before launch)`,
);
