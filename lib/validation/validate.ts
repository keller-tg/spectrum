import { AXIS_IDS, type AxisId } from "@/data/axes";
import { MODES } from "@/data/modes";
import { RUBRIC } from "@/data/rubric";
import { familySchema, ideologySchema, type Family, type Ideology } from "@/lib/schema/entries";
import { questionSchema, questionTextSchema, type Question } from "@/lib/schema/questions";

export interface Issue {
  level: "error" | "warning";
  where: string;
  message: string;
}

/** Entries closer than this (weighted RMS, axis points) must be parent/child or merged (D-050). */
export const NEAR_DUPLICATE_DISTANCE = 8;

const issue = (level: Issue["level"], where: string, message: string): Issue => ({ level, where, message });

function zodIssues(where: string, error: { issues: { path: PropertyKey[]; message: string }[] }): Issue[] {
  return error.issues.map((i) => issue("error", where, `${i.path.map(String).join(".") || "(root)"}: ${i.message}`));
}

/** Salience-floored RMS distance between two entries, mirroring the matching weights (D-012). */
export function entryDistance(a: Pick<Ideology, "coords" | "salience">, b: Pick<Ideology, "coords" | "salience">): number {
  let num = 0;
  let den = 0;
  for (const axis of AXIS_IDS) {
    const w = 0.2 + 0.8 * ((a.salience[axis] + b.salience[axis]) / 2);
    num += w * (a.coords[axis] - b.coords[axis]) ** 2;
    den += w;
  }
  return Math.sqrt(num / den);
}

// ---------------------------------------------------------------------------
// Questions

const ABSOLUTES = /\b(all|every|everyone|everything|always|never|none|nobody|nothing|no one|any time)\b/i;
const LOADED = /\b(globalists?|elites?|regime|woke|illegals?|aliens?|libtards?|commies|snowflakes?|nazis?|traitors?)\b/i;
const US_SPECIFIC = /\b(congress|senate|supreme court|democrats?|republicans?|second amendment|medicare|medicaid|obamacare|gop|federal reserve)\b/i;

export function validateQuestions(bank: readonly unknown[], texts: Record<string, unknown>): Issue[] {
  const out: Issue[] = [];
  const parsed: Question[] = [];
  for (const raw of bank) {
    const r = questionSchema.safeParse(raw);
    if (r.success) parsed.push(r.data);
    else out.push(...zodIssues(`question ${(raw as { id?: string }).id ?? "?"}`, r.error));
  }

  const byId = new Map(parsed.map((q) => [q.id, q]));
  if (byId.size !== parsed.length) out.push(issue("error", "questions", "duplicate question ids"));

  const active = parsed.filter((q) => !q.retired).sort((a, b) => a.order - b.order);
  active.forEach((q, i) => {
    if (q.order !== i + 1) out.push(issue("error", q.id, `order ${q.order} breaks the 1..N sequence at position ${i + 1}`));
  });

  // Every block of 12 contains each axis exactly once → every 12k-prefix is balanced (D-009).
  for (let start = 0; start + 12 <= active.length; start += 12) {
    const axes = new Set(active.slice(start, start + 12).map((q) => q.axis));
    if (axes.size !== 12) out.push(issue("error", `block ${start / 12 + 1}`, "a block of 12 must contain every axis exactly once"));
  }
  for (let i = 1; i < active.length; i++) {
    const prev = active[i - 1];
    const cur = active[i];
    if (prev && cur && prev.axis === cur.axis) out.push(issue("error", cur.id, "two consecutive questions on the same axis"));
  }

  // Keying balance per mode (only for modes whose prefix exists).
  for (const [mode, def] of Object.entries(MODES)) {
    if (active.length < def.count) continue;
    const prefix = active.slice(0, def.count);
    let plus = 0;
    for (const axis of AXIS_IDS) {
      const items = prefix.filter((q) => q.axis === axis);
      const pos = items.filter((q) => q.key === 1).length;
      const neg = items.length - pos;
      plus += pos;
      if (items.length !== def.perAxis) out.push(issue("error", `${mode}/${axis}`, `expected ${def.perAxis} items, found ${items.length}`));
      if (def.perAxis >= 6 && Math.min(pos, neg) / items.length < 0.4) {
        out.push(issue("error", `${mode}/${axis}`, `reverse-keyed share below 40% (${pos}+/${neg}−)`));
      }
      if (def.perAxis < 6 && (pos === 0 || neg === 0)) out.push(issue("error", `${mode}/${axis}`, "both keying directions must be present"));
    }
    if (plus * 2 !== def.count) out.push(issue("error", mode, `overall keying is ${plus}+/${def.count - plus}−, expected an even split`));
  }

  // Mirror pairs: same axis, opposite key, ≥ 8 apart; at least one per axis inside Quick.
  for (const q of active) {
    if (!q.mirrorOf) continue;
    const m = byId.get(q.mirrorOf);
    if (!m) {
      out.push(issue("error", q.id, `mirrorOf ${q.mirrorOf} does not exist`));
      continue;
    }
    if (m.axis !== q.axis) out.push(issue("error", q.id, "mirror pair must share an axis"));
    if (m.key === q.key) out.push(issue("error", q.id, "mirror pair must have opposite keys"));
    if (Math.abs(m.order - q.order) < 8) out.push(issue("error", q.id, "mirror pair items must be at least 8 apart"));
  }
  if (active.length >= MODES.quick.count) {
    for (const axis of AXIS_IDS) {
      const ok = active.some((q) => q.axis === axis && q.mirrorOf && q.order <= MODES.quick.count && (byId.get(q.mirrorOf)?.order ?? 99) <= MODES.quick.count);
      if (!ok) out.push(issue("error", `quick/${axis}`, "needs at least one mirror pair inside Quick"));
    }
  }

  // Wording rules.
  for (const q of parsed) {
    const raw = texts[q.id];
    const r = questionTextSchema.safeParse(raw);
    if (!r.success) {
      out.push(issue("error", q.id, "missing or invalid English text/explainer"));
      continue;
    }
    const { text, explainer } = r.data;
    const words = text.split(/\s+/).length;
    if (words > 25) out.push(issue("error", q.id, `${words} words; keep items to 25 or fewer`));
    if (ABSOLUTES.test(text)) out.push(issue("error", q.id, `absolute wording: "${text.match(ABSOLUTES)?.[0]}"`));
    if (LOADED.test(text) || LOADED.test(explainer)) out.push(issue("error", q.id, "loaded term"));
    if (US_SPECIFIC.test(text) || US_SPECIFIC.test(explainer)) out.push(issue("error", q.id, "US-specific framing"));
    if (/\b(and|or)\b/i.test(text)) out.push(issue("warning", q.id, `contains and/or — check it is not double-barrelled: "${text}"`));
  }
  for (const id of Object.keys(texts)) if (!byId.has(id)) out.push(issue("warning", id, "text without a question"));
  return out;
}

// ---------------------------------------------------------------------------
// Catalog

export function validateFamilies(families: readonly unknown[]): { parsed: Family[]; issues: Issue[] } {
  const parsed: Family[] = [];
  const issues: Issue[] = [];
  for (const raw of families) {
    const r = familySchema.safeParse(raw);
    if (r.success) parsed.push(r.data);
    else issues.push(...zodIssues(`family ${(raw as { id?: string }).id ?? "?"}`, r.error));
  }
  if (new Set(parsed.map((f) => f.id)).size !== parsed.length) issues.push(issue("error", "families", "duplicate family ids"));
  return { parsed, issues };
}

export function validateIdeologies(entries: readonly unknown[], families: readonly Family[]): { parsed: Ideology[]; issues: Issue[] } {
  const out: Issue[] = [];
  const parsed: Ideology[] = [];
  for (const raw of entries) {
    const r = ideologySchema.safeParse(raw);
    if (r.success) parsed.push(r.data);
    else out.push(...zodIssues(`ideology ${(raw as { id?: string }).id ?? "?"}`, r.error));
  }

  const byId = new Map<string, Ideology>();
  for (const e of parsed) {
    if (byId.has(e.id)) out.push(issue("error", e.id, "duplicate id"));
    byId.set(e.id, e);
  }
  for (const locale of ["en", "de", "fr"] as const) {
    const seen = new Map<string, string>();
    for (const e of parsed) {
      const slug = e.slugs[locale];
      if (!slug) continue;
      if (seen.has(slug)) out.push(issue("error", e.id, `${locale} slug "${slug}" also used by ${seen.get(slug)}`));
      seen.set(slug, e.id);
    }
  }

  const familyIds = new Set(families.map((f) => f.id));
  for (const e of parsed) {
    const where = e.id;
    if (!familyIds.has(e.family)) out.push(issue("error", where, `unknown family "${e.family}"`));
    if (e.parent) {
      const p = byId.get(e.parent);
      if (!p) out.push(issue("error", where, `parent "${e.parent}" does not exist`));
      else {
        if (p.id === e.id) out.push(issue("error", where, "an entry cannot be its own parent"));
        if (p.family !== e.family) out.push(issue("error", where, `parent "${p.id}" is in family "${p.family}", not "${e.family}"`));
        if (p.parent) out.push(issue("error", where, `parent "${p.id}" is itself a variant; depth is limited to family → ideology → variant`));
      }
    }
    const urls = new Set(e.sources.map((s) => s.url));
    if (urls.size < 2) out.push(issue("error", where, "needs at least two distinct sources"));
    const maxSalience = Math.max(...AXIS_IDS.map((a) => e.salience[a]));
    if (maxSalience < 0.8) out.push(issue("error", where, "at least one axis must be defining (salience ≥ 0.8)"));
    if (e.tags.includes("online-satirical") && e.tier === "A") out.push(issue("error", where, "online/satirical labels cannot be Tier A"));
  }

  // Near-duplicates must be related or merged (D-050).
  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i];
      const b = parsed[j];
      if (!a || !b) continue;
      const related = a.parent === b.id || b.parent === a.id || (a.parent !== undefined && a.parent === b.parent);
      const d = entryDistance(a, b);
      if (d < NEAR_DUPLICATE_DISTANCE && !related) {
        out.push(issue("error", `${a.id} ~ ${b.id}`, `near-duplicates (distance ${d.toFixed(1)} < ${NEAR_DUPLICATE_DISTANCE}); make one a variant or merge as alias`));
      }
    }
  }

  // Rubric references should point at real entries once the catalog is populated.
  if (parsed.length >= 20) {
    for (const axis of AXIS_IDS as readonly AxisId[]) {
      for (const anchor of RUBRIC[axis]) {
        for (const ref of anchor.references) {
          if (!byId.has(ref)) out.push(issue("warning", `rubric/${axis}`, `reference "${ref}" is not in the catalog`));
        }
      }
    }
  }
  return { parsed, issues: out };
}
