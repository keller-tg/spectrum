/**
 * Pre-launch switch (D-088). Until the owner says "launch", every response
 * carries `X-Robots-Tag: noindex, nofollow`, robots.txt disallows everything
 * and no sitemap is served. Launch = set SPECTRUM_LAUNCHED=1 in the Vercel
 * project and restore app/sitemap.ts (a three-line wrapper of sitemapEntries).
 */
export const LAUNCHED = process.env.SPECTRUM_LAUNCHED === "1";

export const NOINDEX_HEADER = { key: "X-Robots-Tag", value: "noindex, nofollow" } as const;
