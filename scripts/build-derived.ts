/**
 * Build-time derived data (PLAN §3): PCA map, category indices, similarity τ,
 * neighbours, versions and correlation warnings → generated/derived.json.
 * Deterministic: same data in, same file out.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { AXIS_IDS } from "@/data/axes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import { loadIdeologies, toMatchable } from "@/lib/catalog/ideologies";
import { catalogMap } from "@/lib/catalog/map";
import { fitTau } from "@/lib/engine/calibrate";
import { deriveIndexDefs } from "@/lib/engine/indices";
import { asUser, rank } from "@/lib/engine/match";
import { ENGINE_VERSION } from "@/lib/engine/version";
import { shortHash } from "./derived-lib";

const ideologies = loadIdeologies();
const matchables = ideologies.map(toMatchable).filter((m) => !m.hidden);

const { map, rows } = catalogMap();
const tau = fitTau(matchables);

const neighbours = Object.fromEntries(
  matchables.map((m) => [
    m.id,
    rank(asUser(m.coords), matchables, tau.tau)
      .filter((r) => r.entry.id !== m.id)
      .slice(0, 8)
      .map((r) => r.entry.id),
  ]),
);

// Correlations between axes across the catalog: a warning, not a failure (PLAN §5.1).
const correlations: { a: string; b: string; r: number }[] = [];
const sd = AXIS_IDS.map((_, i) =>
  Math.sqrt(
    rows.reduce((s, r) => s + ((r[i] as number) - (map.mean[i] as number)) ** 2, 0) /
      Math.max(1, rows.length - 1),
  ),
);
for (let i = 0; i < AXIS_IDS.length; i++) {
  for (let j = i + 1; j < AXIS_IDS.length; j++) {
    const cov =
      rows.reduce(
        (s, r) =>
          s +
          ((r[i] as number) - (map.mean[i] as number)) *
            ((r[j] as number) - (map.mean[j] as number)),
        0,
      ) / Math.max(1, rows.length - 1);
    const r = cov / ((sd[i] as number) * (sd[j] as number) || 1);
    if (Math.abs(r) > 0.8)
      correlations.push({
        a: AXIS_IDS[i] as string,
        b: AXIS_IDS[j] as string,
        r: Number(r.toFixed(3)),
      });
  }
}

const derived = {
  engineVersion: ENGINE_VERSION,
  catalogVersion: `2026.10-${shortHash(ideologies)}`,
  questionBankVersion: shortHash({ QUESTION_BANK, QUESTION_TEXT_EN }),
  catalogSize: matchables.length,
  tau: { ideology: tau },
  map: {
    axes: AXIS_IDS,
    mean: map.mean,
    components: map.components.slice(0, 2),
    explained: map.explained.slice(0, 2),
  },
  indices: deriveIndexDefs(matchables),
  neighbours,
  correlationWarnings: correlations,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/derived.json", `${JSON.stringify(derived, null, 2)}\n`);
console.log(
  `build-derived: ${matchables.length} ideologies · τ=${tau.tau.toFixed(1)} (median top-1 ${tau.medianTop1Similarity.toFixed(0)}%, top-5 ${tau.medianTop5Similarity.toFixed(0)}%) · map explains ${(((map.explained[0] ?? 0) + (map.explained[1] ?? 0)) * 100).toFixed(0)}% · indices ${Object.values(
    derived.indices,
  )
    .map(
      (d) => `${d.category} ${(d.explained * 100).toFixed(0)}%${d.usable ? "" : " (axes shown)"}`,
    )
    .join(", ")}${correlations.length ? ` · ${correlations.length} correlation warning(s)` : ""}`,
);
