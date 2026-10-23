import { expect, test } from "@playwright/test";
import { encodeResult } from "@/lib/engine/codec";
import { AXIS_IDS, type AxisId } from "@/data/axes";

/**
 * Pre-launch (D-088): every page must say noindex. This crawls every internal
 * link from the three home pages, plus the unlinked pages (pilot, a share
 * code, a 404), and fails on any response without the header.
 */
test("every page carries X-Robots-Tag: noindex before launch", async ({ request }, info) => {
  test.skip(info.project.name !== "desktop", "one crawl is enough");
  test.setTimeout(180_000);
  const scores = Object.fromEntries(AXIS_IDS.map((a) => [a, 10])) as Record<AxisId, number>;
  const confidences = Object.fromEntries(AXIS_IDS.map((a) => [a, 0.5])) as Record<AxisId, number>;
  const code = encodeResult({ mode: "quick", lowQuality: false, flags: [], scores, confidences });
  const queue = [
    "/",
    "/en",
    "/de",
    "/fr",
    "/en/pilot",
    "/de/pilot",
    "/fr/pilot",
    `/en/results/${code}`,
    "/en/no-such-page",
  ];
  const seen = new Set<string>();
  const missing: string[] = [];
  while (queue.length && seen.size < 600) {
    const path = queue.shift() as string;
    if (seen.has(path)) continue;
    seen.add(path);
    const response = await request.get(path, { failOnStatusCode: false });
    if (!/noindex/.test(response.headers()["x-robots-tag"] ?? ""))
      missing.push(`${path} (${response.status()})`);
    if (!(response.headers()["content-type"] ?? "").includes("text/html")) continue;
    const html = await response.text();
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (!href || href.startsWith("/_next") || /\.[a-z0-9]+$/i.test(href)) continue;
      if (!seen.has(href)) queue.push(href);
    }
  }
  expect(seen.size).toBeGreaterThan(30);
  expect(missing).toEqual([]);
});

test("robots.txt disallows everything and no sitemap is served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  const text = await robots.text();
  expect(text).toMatch(/Disallow: \/\s*$/m);
  expect(text).not.toMatch(/Sitemap:/i);
  expect(robots.headers()["x-robots-tag"]).toMatch(/noindex/);
  const sitemap = await request.get("/sitemap.xml", { failOnStatusCode: false });
  expect(sitemap.status()).toBe(404);
});
