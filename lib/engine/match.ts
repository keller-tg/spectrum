import { AXIS_IDS } from "@/data/axes";
import type { AxisVector, Matchable, UserPoint } from "./types";
import { axisVector } from "./vector";

/** Floor on entry salience so narrowly defined entries cannot match everyone (D-012). */
export const SALIENCE_FLOOR = 0.2;
/** Displayed similarity never claims a perfect match. */
export const DISPLAY_CAP = 99;

/**
 * Weighted RMS gap in axis points (0 … 200):
 *   w_a = c_a · (floor + (1 − floor) · σ_a),  d = √(Σ w_a (s_a − e_a)² / Σ w_a)
 * c = user confidence (barely answered axes barely count), σ = entry salience.
 */
export function matchDistance(
  user: UserPoint,
  entry: Pick<Matchable, "coords" | "salience">,
): number {
  let num = 0;
  let den = 0;
  for (const a of AXIS_IDS) {
    const w = user.confidences[a] * (SALIENCE_FLOOR + (1 - SALIENCE_FLOOR) * entry.salience[a]);
    num += w * (user.scores[a] - entry.coords[a]) ** 2;
    den += w;
  }
  return den > 0 ? Math.sqrt(num / den) : Number.POSITIVE_INFINITY;
}

/**
 * Smooth similarity curve (D-013): 100 · 2^(−(d/τ)²); τ is the distance at which
 * similarity is 50 %. τ is a placeholder calibrated on simulated users and must be
 * re-tuned on real community data, because real users cluster near the centre.
 */
export function similarity(distance: number, tau: number): number {
  if (!Number.isFinite(distance)) return 0;
  return 100 * 2 ** -((distance / tau) ** 2);
}

export const displaySimilarity = (sim: number) => Math.min(DISPLAY_CAP, Math.round(sim));

export interface Ranked<T extends Matchable = Matchable> {
  entry: T;
  distance: number;
  similarity: number;
}

/** All visible entries, closest first (ties broken by id for determinism). */
export function rank<T extends Matchable>(
  user: UserPoint,
  entries: readonly T[],
  tau: number,
): Ranked<T>[] {
  return entries
    .filter((e) => !e.hidden)
    .map((entry) => {
      const distance = matchDistance(user, entry);
      return { entry, distance, similarity: similarity(distance, tau) };
    })
    .sort((a, b) => a.distance - b.distance || a.entry.id.localeCompare(b.entry.id));
}

/**
 * Family centroids: salience-weighted mean coordinates of each family's visible
 * members, with mean salience. Used for "closest family".
 */
export function familyCentroids(entries: readonly Matchable[]): Matchable[] {
  const groups = new Map<string, Matchable[]>();
  for (const e of entries) {
    if (e.hidden || !e.family) continue;
    groups.set(e.family, [...(groups.get(e.family) ?? []), e]);
  }
  return [...groups].map(([family, members]) => ({
    id: family,
    family,
    coords: axisVector((a) => {
      const w = members.reduce((s, m) => s + m.salience[a], 0);
      return w > 0
        ? members.reduce((s, m) => s + m.salience[a] * m.coords[a], 0) / w
        : members.reduce((s, m) => s + m.coords[a], 0) / members.length;
    }),
    salience: axisVector((a) => members.reduce((s, m) => s + m.salience[a], 0) / members.length),
  }));
}

export interface TopItem<T extends Matchable = Matchable> {
  /** The top-level ideology. */
  item: Ranked<T>;
  /** Its closest variant, when that variant is closer than the ideology itself. */
  bestVariant?: Ranked<T>;
  /** max(similarity of the ideology, similarity of its variants). */
  groupSimilarity: number;
}

export interface MatchSummary<T extends Matchable = Matchable> {
  ranked: Ranked<T>[];
  /** Top-level ideologies, variants collapsed into their parent (no near-duplicate flood). */
  top: TopItem<T>[];
  closestFamily: Ranked | null;
  closestIdeology: Ranked<T> | null;
  closestVariant: Ranked<T> | null;
  /** What the results lead with, after the placement-confidence rule. */
  headline: TopItem<T> | null;
  /** Share-card hero: never an atrocity-context entry (D-030). */
  shareHero: TopItem<T> | null;
  /** Set when the top two are within `inBetweenGap` points. */
  inBetween: [TopItem<T>, TopItem<T>] | null;
  furthest: Ranked<T> | null;
}

export interface SummaryOptions {
  topN?: number;
  inBetweenGap?: number;
  headlineMargin?: number;
}

export function summarizeMatches<T extends Matchable>(
  user: UserPoint,
  entries: readonly T[],
  tau: number,
  { topN = 5, inBetweenGap = 4, headlineMargin = 3 }: SummaryOptions = {},
): MatchSummary<T> {
  const ranked = rank(user, entries, tau);
  const byId = new Map(ranked.map((r) => [r.entry.id, r]));

  const groups = new Map<string, TopItem<T>>();
  for (const r of ranked) {
    const rootId = r.entry.parent && byId.has(r.entry.parent) ? r.entry.parent : r.entry.id;
    const root = byId.get(rootId) as Ranked<T>;
    const existing = groups.get(rootId) ?? { item: root, groupSimilarity: root.similarity };
    if (r.entry.id !== rootId && r.similarity > existing.groupSimilarity) {
      existing.bestVariant = r;
      existing.groupSimilarity = r.similarity;
    }
    groups.set(rootId, existing);
  }
  const allGroups = [...groups.values()].sort(
    (a, b) =>
      b.groupSimilarity - a.groupSimilarity || a.item.entry.id.localeCompare(b.item.entry.id),
  );
  const top = allGroups.slice(0, topN);

  // A low-placement entry yields the headline to a medium/high one within the margin.
  let headline = top[0] ?? null;
  if (headline?.item.entry.placement === "low") {
    const alt = top.find(
      (g) =>
        g.item.entry.placement !== "low" &&
        headline !== null &&
        g.groupSimilarity >= headline.groupSimilarity - headlineMargin,
    );
    if (alt) headline = alt;
  }
  const ordered = headline ? [headline, ...allGroups.filter((g) => g !== headline)] : allGroups;
  const shareHero =
    ordered.find((g) => !g.item.entry.atrocity && !g.bestVariant?.entry.atrocity) ?? null;

  const first = ordered[0];
  const second = ordered[1];
  const inBetween =
    first && second && first.groupSimilarity - second.groupSimilarity < inBetweenGap
      ? ([first, second] as [TopItem<T>, TopItem<T>])
      : null;

  const families = rank(user, familyCentroids(entries), tau);

  return {
    ranked,
    top,
    closestFamily: families[0] ?? null,
    closestIdeology: ranked.find((r) => !r.entry.parent || !byId.has(r.entry.parent)) ?? null,
    closestVariant: ranked.find((r) => r.entry.parent && byId.has(r.entry.parent)) ?? null,
    headline,
    shareHero,
    inBetween,
    furthest: ranked[ranked.length - 1] ?? null,
  };
}

/** Users and catalog points as plain user points (full confidence), for simulation and tooling. */
export const asUser = (coords: AxisVector, confidence = 1): UserPoint => ({
  scores: coords,
  confidences: axisVector(() => confidence),
});
