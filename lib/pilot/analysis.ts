import { AXIS_IDS, type AxisId } from "@/data/axes";
import { assessQuality, type QualityFlag } from "@/lib/engine/quality";
import { scoreTest } from "@/lib/engine/score";
import type { BankItem } from "@/lib/engine/types";
import type { PilotFile } from "@/lib/schema/pilot";

/**
 * Pilot analysis (PLAN §7a): what simulation cannot measure, from real answer
 * files. Pure: the CLI (scripts/pilot-analysis.ts) reads and validates files,
 * this computes and formats.
 */

export interface ItemStats {
  id: string;
  axis: AxisId;
  key: 1 | -1;
  n: number;
  skipRate: number;
  /** Counts of −2 … +2. */
  distribution: [number, number, number, number, number];
  /** Share of +1/+2 among answers. */
  agreeRate: number;
  mean: number;
  sd: number;
  /**
   * Mean (keyed answer × 50 − the respondent's axis score), in points: how far
   * this item pulls toward its own pole beyond what the rest of the axis says.
   * Feeds the difficulty offsets of the robustness grid (D-071).
   */
  difficultyOffset: number;
  /** Corrected item-total correlation (vs the keyed sum of the axis's other items). */
  itemTotal: number | null;
  /** Below 0.2 or negative: likely weak or mis-keyed. */
  flagged: boolean;
  medianMs: number | null;
}

export interface AxisStats {
  axis: AxisId;
  /** Respondents who answered every item of the axis (needed for α). */
  complete: number;
  alpha: number | null;
  alphaIfDeleted: Record<string, number | null>;
}

export interface MirrorStats {
  pair: [string, string];
  n: number;
  /** Share not contradicting themselves: never opposite keyed directions (neutral is fine). */
  consistent: number;
}

export interface PilotReport {
  files: number;
  modes: Record<string, number>;
  items: ItemStats[];
  axes: AxisStats[];
  correlations: { a: AxisId; b: AxisId; r: number | null; flagged: boolean }[];
  mirrors: MirrorStats[];
  qualityRates: Partial<Record<QualityFlag, number>>;
}

const mean = (xs: readonly number[]) =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN;
const variance = (xs: readonly number[]) => {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
};
const median = (xs: readonly number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2;
};
export function pearson(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 3) return null;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = (x[i] as number) - mx;
    const dy = (y[i] as number) - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}

/** Cronbach's α over complete rows (respondents × items, keyed values). */
export function cronbachAlpha(rows: readonly (readonly number[])[]): number | null {
  const k = rows[0]?.length ?? 0;
  if (rows.length < 3 || k < 2) return null;
  const itemVar = Array.from({ length: k }, (_, j) => variance(rows.map((r) => r[j] as number)));
  const totalVar = variance(rows.map((r) => r.reduce((s, x) => s + x, 0)));
  if (!(totalVar > 0)) return null;
  return (k / (k - 1)) * (1 - itemVar.reduce((s, v) => s + v, 0) / totalVar);
}

export function analyse(files: readonly PilotFile[], bank: readonly BankItem[]): PilotReport {
  const active = bank.filter((q) => !q.retired);
  const asked = active.filter((q) => files.some((f) => q.id in f.answers));
  const keyed = (q: BankItem, f: PilotFile) => {
    const a = f.answers[q.id];
    return a && a.r !== null ? (q.key * a.r) / 2 : null;
  };
  const scores = files.map((f) =>
    scoreTest(
      active.filter((q) => q.id in f.answers),
      f.answers,
    ),
  );

  const items: ItemStats[] = asked.map((q) => {
    const answered = files.filter((f) => f.answers[q.id]?.r != null);
    const seen = files.filter((f) => f.answers[q.id] !== undefined);
    const raw = answered.map((f) => f.answers[q.id]?.r as number);
    const dist = [-2, -1, 0, 1, 2].map(
      (v) => raw.filter((r) => r === v).length,
    ) as ItemStats["distribution"];
    const others = asked.filter((o) => o.axis === q.axis && o.id !== q.id);
    const pairs: [number, number][] = [];
    const offsets: number[] = [];
    files.forEach((f, i) => {
      const k = keyed(q, f);
      if (k === null) return;
      offsets.push(k * 100 - (scores[i]?.scores[q.axis] ?? 0));
      const rest = others.map((o) => keyed(o, f)).filter((v): v is number => v !== null);
      if (rest.length) pairs.push([k, rest.reduce((s, x) => s + x, 0)]);
    });
    const itemTotal = pearson(
      pairs.map((p) => p[0]),
      pairs.map((p) => p[1]),
    );
    const times = answered
      .map((f) => f.answers[q.id]?.ms)
      .filter((ms): ms is number => typeof ms === "number");
    return {
      id: q.id,
      axis: q.axis,
      key: q.key,
      n: answered.length,
      skipRate: seen.length ? (seen.length - answered.length) / seen.length : 0,
      distribution: dist,
      agreeRate: raw.length ? raw.filter((r) => r > 0).length / raw.length : 0,
      mean: mean(raw),
      sd: Math.sqrt(variance(raw)),
      difficultyOffset: mean(offsets),
      itemTotal,
      flagged: itemTotal !== null && itemTotal < 0.2,
      medianMs: median(times),
    };
  });

  const axes: AxisStats[] = AXIS_IDS.map((axis) => {
    const qs = asked.filter((q) => q.axis === axis);
    const rows = files
      .map((f) => qs.map((q) => keyed(q, f)))
      .filter((r): r is number[] => r.every((v) => v !== null));
    const alphaIfDeleted = Object.fromEntries(
      qs.map((q, j) => [q.id, cronbachAlpha(rows.map((r) => r.filter((_, c) => c !== j)))]),
    );
    return { axis, complete: rows.length, alpha: cronbachAlpha(rows), alphaIfDeleted };
  });

  const correlations: PilotReport["correlations"] = [];
  AXIS_IDS.forEach((a, i) =>
    AXIS_IDS.slice(i + 1).forEach((b) => {
      const r = pearson(
        scores.map((s) => s.scores[a]),
        scores.map((s) => s.scores[b]),
      );
      correlations.push({ a, b, r, flagged: r !== null && Math.abs(r) > 0.8 });
    }),
  );

  const mirrors: MirrorStats[] = asked
    .filter((q) => q.mirrorOf && asked.some((o) => o.id === q.mirrorOf))
    .map((q) => {
      const other = asked.find((o) => o.id === q.mirrorOf) as BankItem;
      const both = files
        .map((f) => [keyed(q, f), keyed(other, f)] as const)
        .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
      const consistent = both.filter(([x, y]) => x * y >= 0).length;
      return {
        pair: [other.id, q.id] as [string, string],
        n: both.length,
        consistent: both.length ? consistent / both.length : 0,
      };
    });

  const qualityRates: PilotReport["qualityRates"] = {};
  files.forEach((f) => {
    for (const flag of assessQuality(
      active.filter((q) => q.id in f.answers),
      f.answers,
    ).flags)
      qualityRates[flag] = (qualityRates[flag] ?? 0) + 1 / files.length;
  });

  const modes: Record<string, number> = {};
  for (const f of files) modes[f.mode] = (modes[f.mode] ?? 0) + 1;

  return { files: files.length, modes, items, axes, correlations, mirrors, qualityRates };
}

const f2 = (v: number | null | undefined) =>
  v === null || v === undefined || Number.isNaN(v) ? "—" : v.toFixed(2);
const pct = (v: number) => `${Math.round(v * 100)}%`;

export function toMarkdown(report: PilotReport): string {
  const lines: string[] = [];
  lines.push("# Pilot report", "");
  lines.push(
    `${report.files} answer files (${Object.entries(report.modes)
      .map(([m, n]) => `${m} ${n}`)
      .join(", ")}).`,
    "Generated by `npm run pilot-analysis`. Small samples are noisy: treat every number as a lead, not a verdict.",
    "",
  );
  if (report.files < 30)
    lines.push(`> Fewer than 30 files: correlations and α are unstable at this size.`, "");
  lines.push("## Items", "");
  lines.push(
    "| Item | Axis | Key | n | Skip | −2/−1/0/+1/+2 | Agree | Mean | SD | Offset (pts) | Item-total | Median s |",
  );
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const i of report.items)
    lines.push(
      `| ${i.flagged ? "**" + i.id + "** ⚑" : i.id} | ${i.axis} | ${i.key > 0 ? "+" : "−"} | ${i.n} | ${pct(i.skipRate)} | ${i.distribution.join("/")} | ${pct(i.agreeRate)} | ${f2(i.mean)} | ${f2(i.sd)} | ${Number.isNaN(i.difficultyOffset) ? "—" : Math.round(i.difficultyOffset)} | ${f2(i.itemTotal)} | ${i.medianMs === null ? "—" : (i.medianMs / 1000).toFixed(1)} |`,
    );
  lines.push(
    "",
    "⚑ corrected item-total correlation below 0.2 or negative: weak or possibly mis-keyed.",
    "",
  );
  lines.push("## Reliability per axis (Cronbach's α)", "");
  lines.push("| Axis | Complete | α | α if item deleted |", "|---|---|---|---|");
  for (const a of report.axes)
    lines.push(
      `| ${a.axis} | ${a.complete} | ${f2(a.alpha)} | ${Object.entries(a.alphaIfDeleted)
        .map(([id, v]) => `${id} ${f2(v)}`)
        .join(", ")} |`,
    );
  lines.push("", "## Inter-axis correlations (engine scores)", "");
  const flagged = report.correlations.filter((c) => c.flagged);
  lines.push(
    flagged.length
      ? flagged.map((c) => `- **${c.a} × ${c.b}: ${f2(c.r)}** (above |0.8|)`).join("\n")
      : "No pair above |0.8|.",
    "",
    "| Pair | r |",
    "|---|---|",
    ...report.correlations.map((c) => `| ${c.a} × ${c.b} | ${f2(c.r)} |`),
  );
  lines.push("", "## Mirror pairs", "", "| Pair | n | Consistent |", "|---|---|---|");
  for (const m of report.mirrors)
    lines.push(`| ${m.pair.join(" ↔ ")} | ${m.n} | ${pct(m.consistent)} |`);
  lines.push("", "## Quality flags", "");
  const q = Object.entries(report.qualityRates);
  lines.push(
    q.length ? q.map(([k, v]) => `- ${k}: ${pct(v)} of files`).join("\n") : "No quality flags.",
  );
  return lines.join("\n") + "\n";
}
