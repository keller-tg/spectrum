import {
  countrySchema,
  figureSchema,
  partySchema,
  regimeSchema,
  type Country,
  type Figure,
  type Party,
  type Regime,
} from "@/lib/schema/entries";
import type { Issue } from "./validate";

/**
 * Build gate for countries, historical regimes, figures and parties (Phase 5,
 * D-093). Same source and content rules as ideologies (docs/content-style.md),
 * plus the per-kind policies: modern countries and current parties are
 * editorial estimates, and this phase admits deceased figures only.
 */

type Kind = "country" | "regime" | "figure" | "party";
type Entity = Country | Regime | Figure | Party;

const SCHEMAS = {
  country: countrySchema,
  regime: regimeSchema,
  figure: figureSchema,
  party: partySchema,
} as const;

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const LOADED =
  /\b(evil|heroic|glorious|brave|noble|monstrous|insane|crazy|so-called|obviously|undeniably|thankfully|sadly|tragically|rightly|wrongly)\b/i;

export function validateEntities<K extends Kind>(
  kind: K,
  raw: readonly unknown[],
  ideologyIds: ReadonlySet<string>,
): { parsed: Entity[]; issues: Issue[] } {
  const issues: Issue[] = [];
  const add = (level: Issue["level"], where: string, message: string) =>
    issues.push({ level, where, message });
  const parsed: Entity[] = [];
  for (const r of raw) {
    const result = SCHEMAS[kind].safeParse(r);
    const where = `${kind} ${(r as { id?: string }).id ?? "?"}`;
    if (result.success) parsed.push(result.data as Entity);
    else
      for (const i of result.error.issues)
        add("error", where, `${i.path.map(String).join(".") || "(root)"}: ${i.message}`);
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const e of parsed) {
    const where = `${kind} ${e.id}`;
    if (ids.has(e.id)) add("error", where, "duplicate id");
    ids.add(e.id);
    if (slugs.has(e.slugs.en)) add("error", where, `duplicate slug "${e.slugs.en}"`);
    slugs.add(e.slugs.en);

    const hosts = new Set(e.sources.map((s) => host(s.url)));
    if (hosts.size < 2)
      add("error", where, "sources must come from at least two independent sites");
    if (!e.sources.some((s) => !host(s.url).endsWith("wikipedia.org") && s.kind !== "primary"))
      add("error", where, "needs one secondary source that is not Wikipedia (D-031)");

    if (e.status === "complete") {
      const en = e.content?.en;
      if (!en) add("error", where, "complete entries need content.en");
      else {
        if (!en.criticisms?.length) add("error", where, "complete entries need criticisms");
        const m = en.summary.match(LOADED);
        if (m) add("warning", where, `loaded word "${m[0]}" in the summary`);
      }
    }

    if (e.kind === "country" && !e.estimate)
      add("error", where, "modern countries are editorial estimates (estimate: true)");
    if (e.kind === "figure") {
      if (e.living)
        add(
          "error",
          where,
          "living people need a separate sourcing and legal review before they enter (D-093)",
        );
      for (const id of e.ideologies)
        if (!ideologyIds.has(id)) add("error", where, `unknown ideology "${id}"`);
    }
    if (e.kind === "party")
      for (const id of e.ideologies)
        if (!ideologyIds.has(id)) add("error", where, `unknown ideology "${id}"`);
  }
  return { parsed, issues };
}
