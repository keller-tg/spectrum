import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CategoryId } from "@/data/axes";
import type { IndexDef } from "@/lib/engine/indices";

/** The build-time derived data (scripts/build-derived.ts → generated/derived.json). */
export interface Derived {
  engineVersion: string;
  catalogVersion: string;
  questionBankVersion: string;
  catalogSize: number;
  tau: { ideology: { tau: number } };
  map: { axes: string[]; mean: number[]; components: number[][]; explained: number[] };
  indices: Record<CategoryId, IndexDef>;
}

let cached: Derived | null = null;

/**
 * Server-only. Read at build time by static pages; `prebuild` and `predev`
 * generate the file, so it always matches the catalog in this build.
 */
export function loadDerived(): Derived {
  cached ??= JSON.parse(
    readFileSync(join(process.cwd(), "generated", "derived.json"), "utf8"),
  ) as Derived;
  return cached;
}
