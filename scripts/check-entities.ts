/**
 * Checks country, regime, figure or party files the way the build will,
 * without the generated index, so content agents can check their batch:
 *
 *   npx tsx scripts/check-entities.ts <country|regime|figure|party> <id> [<id> …]
 *
 * Prints schema and policy errors for each id and the three nearest entries of
 * the same kind (to spot coordinate drift). Exit 1 on errors.
 */
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { IDEOLOGIES } from "@/data/ideologies";
import { validateEntities } from "@/lib/validation/entities";
import { entryDistance } from "@/lib/validation/validate";

const DIRS = {
  country: "countries",
  regime: "regimes",
  figure: "figures",
  party: "parties",
} as const;
const kind = process.argv[2] as keyof typeof DIRS;
const wanted = process.argv.slice(3);
if (!(kind in DIRS) || !wanted.length) {
  console.error("usage: npx tsx scripts/check-entities.ts <country|regime|figure|party> <id> …");
  process.exit(2);
}
const dir = resolve("data", DIRS[kind]);
const raw: unknown[] = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts"))
  raw.push((await import(pathToFileURL(join(dir, f)).href)).default);

// Ideology ids from the files too, so new Tier A entries count before the index is regenerated.
const ideologyDir = resolve("data/ideologies");
const ideologyIds = new Set<string>(IDEOLOGIES.map((e) => e.id));
for (const f of readdirSync(ideologyDir).filter((f) => f.endsWith(".ts") && f !== "index.ts"))
  ideologyIds.add(f.replace(/\.ts$/, ""));

const { parsed, issues } = validateEntities(kind, raw, ideologyIds);
let errors = 0;
for (const id of wanted) {
  const mine = issues.filter((i) => i.where === `${kind} ${id}`);
  const e = parsed.find((x) => x.id === id);
  const lines = mine.map((i) => `  ${i.level.toUpperCase()} ${i.message}`);
  if (!e && !mine.length) lines.push(`  ERROR no file data/${DIRS[kind]}/${id}.ts with this id`);
  if (e)
    for (const { x, d } of parsed
      .filter((x) => x.id !== id)
      .map((x) => ({ x, d: entryDistance(e, x) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3))
      lines.push(`  near ${x.id} ${d.toFixed(1)}`);
  errors += lines.filter((l) => l.includes("ERROR")).length;
  console.log(`${id}\n${lines.join("\n")}`);
}
console.log(`\ncheck-entities: ${wanted.length} checked, ${errors} errors`);
process.exit(errors ? 1 : 0);
