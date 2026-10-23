import type { Ideology } from "@/lib/schema/entries";

/**
 * Content rules the schema cannot express (docs/content-style.md, D-030,
 * D-031, D-048). Errors fail the build; warnings are for the reviewer.
 */
export interface LintMessage {
  level: "error" | "warning";
  message: string;
}

const FIRST_PERSON = /\b(we|our|ours|us)\b/i;
/** Words that judge instead of describe; fine inside a quoted or attributed criticism. */
const LOADED =
  /\b(evil|heroic|glorious|brave|noble|monstrous|insane|crazy|so-called|obviously|undeniably|thankfully|sadly|tragically|correctly|rightly|wrongly)\b/i;
const LONG_QUOTE = /["“]([^"”]{0,400})["”]/g;

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function contentLint(e: Ideology): LintMessage[] {
  const out: LintMessage[] = [];
  const err = (message: string) => out.push({ level: "error", message });
  const warn = (message: string) => out.push({ level: "warning", message });

  const hosts = new Set(e.sources.map((s) => host(s.url)));
  if (hosts.size < 2) err("sources must come from at least two independent sites");

  if (e.status !== "complete") return out;
  const en = e.content?.en;
  if (!en) return out;

  // Independent support: at least one source that is not Wikipedia and not a primary text.
  const independent = e.sources.some(
    (s) => !host(s.url).endsWith("wikipedia.org") && s.kind !== "primary",
  );
  if (!independent) err("needs one secondary source that is not Wikipedia (D-031)");

  const perspectives = new Set(en.criticisms.map((c) => c.from.trim().toLowerCase()));
  if (perspectives.size < 2) err("criticisms must come from at least two different perspectives");

  if (e.extremist) {
    if (FIRST_PERSON.test(en.voice)) err("extremist entries use a third-person voice (D-030)");
    const texts = [en.summary, en.voice, en.origins, ...en.coreBeliefs, en.harms ?? ""];
    if (texts.some((t) => t.includes("!"))) err("no slogans or exclamations in extremist entries");
  }

  const prose = [en.summary, en.origins, ...en.coreBeliefs, en.harms ?? "", en.nameNote ?? ""];
  for (const t of prose) {
    const m = t.match(LOADED);
    if (m) warn(`loaded word "${m[0]}" in descriptive text`);
  }
  for (const t of [...prose, en.voice]) {
    for (const [, quoted] of t.matchAll(LONG_QUOTE))
      if (quoted && words(quoted) > 15)
        warn(`quotation longer than 15 words: "${quoted.slice(0, 40)}…"`);
  }
  const summaryWords = words(en.summary);
  if (summaryWords < 35 || summaryWords > 160)
    warn(`summary has ${summaryWords} words (aim for 50–120)`);
  return out;
}
