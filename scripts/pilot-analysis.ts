/**
 * Pilot analysis (PLAN §7a, D-072): reads every spectrum-pilot JSON file in a
 * folder, validates it, and reports item statistics, reliability and
 * correlations as Markdown on stdout and in generated/pilot-report.md
 * (gitignored). Pilot files are personal data: keep them outside the repo or
 * in the gitignored pilot-data/ folder.
 *
 *   npm run pilot-analysis -- <folder>
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { QUESTION_BANK } from "@/data/questions/bank";
import { analyse, toMarkdown } from "@/lib/pilot/analysis";
import { pilotFileSchema, type PilotFile } from "@/lib/schema/pilot";

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: npm run pilot-analysis -- <folder with spectrum-pilot-*.json files>");
  process.exit(1);
}

const files: PilotFile[] = [];
const rejected: string[] = [];
for (const name of readdirSync(folder)
  .filter((n) => n.endsWith(".json"))
  .sort()) {
  try {
    const parsed = pilotFileSchema.safeParse(JSON.parse(readFileSync(join(folder, name), "utf8")));
    if (parsed.success) files.push(parsed.data);
    else rejected.push(`${name}: ${parsed.error.issues[0]?.message ?? "invalid"}`);
  } catch {
    rejected.push(`${name}: not JSON`);
  }
}
if (rejected.length)
  console.error(`pilot-analysis: skipped ${rejected.length} file(s):\n  ${rejected.join("\n  ")}`);
if (!files.length) {
  console.error("pilot-analysis: no valid pilot files found.");
  process.exit(1);
}
const markdown = toMarkdown(analyse(files, QUESTION_BANK));
mkdirSync("generated", { recursive: true });
writeFileSync("generated/pilot-report.md", markdown);
process.stdout.write(markdown);
