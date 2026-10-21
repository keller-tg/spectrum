/**
 * Link checker for catalog sources (CI job, not part of the build: the network
 * is flaky and some publishers block bots). Prints broken links; exit 1 if any.
 */
import { loadIdeologies } from "@/lib/catalog/ideologies";

/** Publishers that answer bots with 403 although the page exists. */
const BOT_BLOCKING = ["britannica.com"];

const urls = [...new Set(loadIdeologies().flatMap((e) => e.sources.map((s) => s.url)))];
let broken = 0;
const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (spectrum link checker)" },
      });
      return { url, status: res.status };
    } catch (error) {
      return { url, status: 0, error: String(error) };
    }
  }),
);
for (const r of results) {
  const blocked = r.status === 403 && BOT_BLOCKING.some((d) => r.url.includes(d));
  if (r.status >= 200 && r.status < 400) continue;
  if (blocked) {
    console.warn(`unverifiable (bot protection) ${r.url}`);
    continue;
  }
  broken++;
  console.error(`BROKEN ${r.status} ${r.url}`);
}
console.log(`check-sources: ${urls.length} URLs, ${broken} broken`);
process.exit(broken ? 1 : 0);
