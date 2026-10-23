/**
 * Checks catalog entry files the way the build will, without the generated
 * index, so content agents can check their own batch in parallel:
 *
 *   npx tsx scripts/check-entries.ts <id> [<id> …]
 *
 * For each id: schema errors, content lint (D-030, D-048, D-089 style rules),
 * source independence, and the five nearest entries with their distance, so
 * coordinate drift and near-duplicates show up before review. Exit 1 on errors.
 */
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { FAMILIES } from "@/data/families";
import { ideologySchema, type Ideology } from "@/lib/schema/entries";
import { contentLint } from "@/lib/validation/content-lint";
import { entryDistance, NEAR_DUPLICATE_DISTANCE } from "@/lib/validation/validate";

const dir = resolve("data/ideologies");
const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
const all: Ideology[] = [];
const broken = new Map<string, string[]>();
for (const f of files) {
  const raw = (await import(pathToFileURL(join(dir, f)).href)).default as { id?: string };
  const r = ideologySchema.safeParse(raw);
  if (r.success) all.push(r.data);
  else
    broken.set(
      raw?.id ?? f,
      r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
}

const wanted = process.argv.slice(2);
if (!wanted.length) {
  console.error("usage: npx tsx scripts/check-entries.ts <id> [<id> …]");
  process.exit(2);
}
const families = new Set(FAMILIES.map((f) => f.id));
let errors = 0;
for (const id of wanted) {
  const lines: string[] = [];
  const schema = broken.get(id);
  const e = all.find((x) => x.id === id);
  if (schema) {
    errors += schema.length;
    lines.push(...schema.map((m) => `  ERROR schema ${m}`));
  } else if (!e) {
    errors++;
    lines.push(`  ERROR no file data/ideologies/${id}.ts with this id`);
  } else {
    if (!families.has(e.family)) lines.push(`  ERROR unknown family "${e.family}"`);
    if (e.parent) {
      const p = all.find((x) => x.id === e.parent);
      if (!p) lines.push(`  ERROR parent "${e.parent}" not found`);
      else if (p.family !== e.family) lines.push(`  ERROR parent is in family ${p.family}`);
      else if (p.parent) lines.push(`  ERROR parent "${p.id}" is itself a variant`);
    }
    for (const m of contentLint(e)) lines.push(`  ${m.level.toUpperCase()} ${m.message}`);
    const near = all
      .filter((x) => x.id !== e.id)
      .map((x) => ({ x, d: entryDistance(e, x) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 5);
    for (const { x, d } of near) {
      const related =
        e.parent === x.id || x.parent === e.id || (e.parent !== undefined && e.parent === x.parent);
      const flag = d < NEAR_DUPLICATE_DISTANCE && !related ? "  ERROR near-duplicate" : "  near";
      lines.push(`${flag} ${x.id} (${x.spectrum}) ${d.toFixed(1)}`);
    }
    errors += lines.filter((l) => l.includes("ERROR")).length;
  }
  console.log(`${id}\n${lines.join("\n")}`);
}
console.log(`\ncheck-entries: ${wanted.length} checked, ${errors} errors`);
process.exit(errors ? 1 : 0);
