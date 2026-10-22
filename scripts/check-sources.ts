/**
 * Link checker for catalog sources (CI job, not part of the build: the network
 * is flaky and some publishers block bots). Prints broken links; exit 1 if any.
 * Requests are throttled (a burst of parallel requests gets rate-limited).
 */
import { loadIdeologies } from "@/lib/catalog/ideologies";

/** Publishers that answer bots with 403 although the page exists. */
const BOT_BLOCKING = ["britannica.com", "globalgreens.org"];
/** Identifies the checker; the contact is the public repo, never personal data (D-073). */
const USER_AGENT =
  "Mozilla/5.0 (compatible; SpectrumSourceCheck/1.0; +https://github.com/keller-tg/spectrum)";
const CONCURRENCY = 4;
const TIMEOUT_MS = 20_000;

async function check(url: string): Promise<{ url: string; status: number; error?: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": USER_AGENT },
      });
      await res.body?.cancel();
      if (res.status < 500 || attempt === 1) return { url, status: res.status };
    } catch (error) {
      if (attempt === 1)
        return {
          url,
          status: 0,
          error: (error as Error).cause ? String((error as Error).cause) : String(error),
        };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { url, status: 0 };
}

const urls = [...new Set(loadIdeologies().flatMap((e) => e.sources.map((s) => s.url)))];
const results: Awaited<ReturnType<typeof check>>[] = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const url = urls[next++] as string;
      results.push(await check(url));
    }
  }),
);

let broken = 0;
for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
  if (r.status >= 200 && r.status < 400) continue;
  if (r.status === 403 && BOT_BLOCKING.some((d) => r.url.includes(d))) {
    console.warn(`unverifiable (bot protection) ${r.url}`);
    continue;
  }
  // Server errors and network failures are usually outages, not dead links: recheck later.
  if (r.status === 0 || r.status >= 500) {
    console.warn(
      `recheck later (${r.status || "network"}) ${r.url}${r.error ? ` (${r.error})` : ""}`,
    );
    continue;
  }
  broken++;
  console.error(`BROKEN ${r.status} ${r.url}${r.error ? ` (${r.error})` : ""}`);
}
console.log(`check-sources: ${urls.length} URLs, ${broken} broken`);
process.exit(broken ? 1 : 0);
