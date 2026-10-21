import type { AxisId } from "@/data/axes";
import type { Answers, BankItem } from "./types";
import { median } from "./vector";

export type QualityFlag = "straightline" | "acquiescence" | "contradiction" | "fast" | "sparse";

/** Thresholds (PLAN §6.3). Provisional; documented in docs/scoring.md. */
export const QUALITY = {
  /** Pattern checks need enough answers to mean anything. */
  minAnswered: 12,
  /** Share of answers that are the single most common response. */
  modeShare: 0.8,
  /** Longest run of identical consecutive answers, as a share of answers. */
  runShare: 0.7,
  /** |mean raw answer| over a keying-balanced set; consistent views average near 0. */
  acquiescence: 1.0,
  /** Keyed values of a mirror pair this far apart count as a contradiction. */
  contradictionGap: 1.5,
  /** Share of answered mirror pairs that are contradictory before the result is low quality. */
  contradictionShare: 0.25,
  /** Median milliseconds per answer below which completion is implausibly fast. */
  fastMedianMs: 1200,
  /** Share of skipped questions that marks a result as sparse (confidence only). */
  sparseShare: 0.4,
} as const;

export interface QualityReport {
  flags: QualityFlag[];
  /** Low-quality results lead with a gentle note and are excluded from trends by default. */
  low: boolean;
  /** Axes with at least one contradictory mirror pair. */
  contradictedAxes: AxisId[];
  contradictions: [string, string][];
  stats: {
    answered: number;
    skipped: number;
    modeShare: number;
    longestRunShare: number;
    meanRaw: number;
    mirrorPairsAnswered: number;
    medianMs: number | null;
  };
}

export function assessQuality(items: readonly BankItem[], answers: Answers): QualityReport {
  const ordered = [...items].sort((a, b) => a.order - b.order);
  const responses: number[] = [];
  const times: number[] = [];
  let skipped = 0;
  for (const q of ordered) {
    const a = answers[q.id];
    if (!a) continue;
    if (a.r === null) skipped++;
    else responses.push(a.r);
    if (a.ms !== undefined && a.r !== null) times.push(a.ms);
  }
  const n = responses.length;

  const counts = new Map<number, number>();
  for (const r of responses) counts.set(r, (counts.get(r) ?? 0) + 1);
  const modeShare = n ? Math.max(...counts.values()) / n : 0;

  let longest = 0;
  let run = 0;
  for (let i = 0; i < n; i++) {
    run = i > 0 && responses[i] === responses[i - 1] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const longestRunShare = n ? longest / n : 0;
  const meanRaw = n ? responses.reduce((s, r) => s + r, 0) / n : 0;

  const byId = new Map(items.map((q) => [q.id, q]));
  const contradictions: [string, string][] = [];
  const contradictedAxes = new Set<AxisId>();
  let pairs = 0;
  for (const q of items) {
    if (!q.mirrorOf) continue;
    const m = byId.get(q.mirrorOf);
    const ra = answers[q.id]?.r;
    const rb = answers[q.mirrorOf]?.r;
    if (!m || ra === null || ra === undefined || rb === null || rb === undefined) continue;
    pairs++;
    if (Math.abs((q.key * ra) / 2 - (m.key * rb) / 2) >= QUALITY.contradictionGap) {
      contradictions.push([m.id, q.id]);
      contradictedAxes.add(q.axis);
    }
  }

  const medianMs = times.length >= QUALITY.minAnswered ? median(times) : null;
  const enough = n >= QUALITY.minAnswered;

  const flags: QualityFlag[] = [];
  if (enough && (modeShare >= QUALITY.modeShare || longestRunShare >= QUALITY.runShare))
    flags.push("straightline");
  if (enough && Math.abs(meanRaw) >= QUALITY.acquiescence) flags.push("acquiescence");
  if (contradictions.length >= 2 && contradictions.length / pairs >= QUALITY.contradictionShare)
    flags.push("contradiction");
  if (medianMs !== null && medianMs < QUALITY.fastMedianMs) flags.push("fast");
  if (items.length && skipped / items.length >= QUALITY.sparseShare) flags.push("sparse");

  return {
    flags,
    low: flags.some((f) => f !== "sparse"),
    contradictedAxes: [...contradictedAxes],
    contradictions,
    stats: {
      answered: n,
      skipped,
      modeShare,
      longestRunShare,
      meanRaw,
      mirrorPairsAnswered: pairs,
      medianMs,
    },
  };
}
