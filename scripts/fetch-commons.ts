/**
 * Fetches one Wikimedia Commons file for a catalog entry (D-032, D-078):
 * licence, author and attribution come from the Commons API, never from
 * memory; only allowlisted licences pass; the image is downloaded to
 * data/images/<id>.jpg (a 640px rendition) for the build-time dither.
 *
 *   npx tsx scripts/fetch-commons.ts <entry-id> "File:Some portrait.jpg"
 *
 * Prints the `image` object to paste into the entry. The User-Agent names the
 * project and its public repository only.
 */
import { writeFileSync } from "node:fs";
import { commonsImageSchema, IMAGE_LICENSES } from "@/lib/schema/entries";

const UA = "SpectrumCatalogBuild/1.0 (+https://github.com/keller-tg/spectrum)";
const [id, rawTitle] = process.argv.slice(2);
if (!id || !rawTitle) {
  console.error('usage: npx tsx scripts/fetch-commons.ts <entry-id> "File:Name.jpg"');
  process.exit(2);
}
const title = rawTitle.startsWith("File:") ? rawTitle : `File:${rawTitle}`;

const strip = (html = "") =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Commons short names → the allowlist (D-032). */
function licence(short: string): (typeof IMAGE_LICENSES)[number] | null {
  const s = short.trim();
  if (/^public domain$/i.test(s) || /^PD\b/i.test(s)) return "PD";
  if (/^CC0/i.test(s)) return "CC0";
  const m = s.match(/^CC BY(-SA)? (\d\.\d)$/i);
  if (!m) return null;
  const name = `CC BY${m[1] ? "-SA" : ""} ${m[2]}`;
  return (IMAGE_LICENSES as readonly string[]).includes(name)
    ? (name as (typeof IMAGE_LICENSES)[number])
    : null;
}

const api = new URL("https://commons.wikimedia.org/w/api.php");
api.search = new URLSearchParams({
  action: "query",
  titles: title,
  prop: "imageinfo",
  iiprop: "url|extmetadata|mime",
  iiurlwidth: "640",
  format: "json",
  formatversion: "2",
}).toString();
const response = await fetch(api, { headers: { "User-Agent": UA } });
const json = (await response.json()) as {
  query?: {
    pages?: {
      missing?: boolean;
      title: string;
      imageinfo?: {
        thumburl?: string;
        descriptionurl: string;
        mime: string;
        extmetadata?: Record<string, { value: string }>;
      }[];
    }[];
  };
};
const page = json.query?.pages?.[0];
const info = page?.imageinfo?.[0];
if (!page || page.missing || !info?.thumburl) {
  console.error(`fetch-commons: ${title} not found on Commons`);
  process.exit(1);
}
const meta = info.extmetadata ?? {};
const short = strip(meta.LicenseShortName?.value);
const license = licence(short);
if (!license) {
  console.error(
    `fetch-commons: licence "${short}" is not on the allowlist (D-032); pick another file`,
  );
  process.exit(1);
}
const author = strip(meta.Artist?.value) || "Unknown author";
const credit = strip(meta.Credit?.value);
const image = commonsImageSchema.parse({
  file: `${id}.jpg`,
  sourceUrl: info.descriptionurl.replace(/^http:/, "https:"),
  author,
  license,
  ...(meta.LicenseUrl?.value ? { licenseUrl: meta.LicenseUrl.value } : {}),
  attribution: `${author}${credit && credit !== author ? ` (${credit})` : ""}, ${license === "PD" ? "public domain" : license}, via Wikimedia Commons`,
});

const bytes = await fetch(info.thumburl, { headers: { "User-Agent": UA } });
if (!bytes.ok) {
  console.error(`fetch-commons: download failed (${bytes.status})`);
  process.exit(1);
}
writeFileSync(`data/images/${id}.jpg`, Buffer.from(await bytes.arrayBuffer()));
console.log(JSON.stringify(image, null, 2));
