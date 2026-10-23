import { AXIS_IDS, CATEGORY_IDS, type AxisId, type CategoryId } from "@/data/axes";
import type { CatalogData } from "@/lib/catalog/client-data";
import type { AxisVector } from "@/lib/engine/types";

/**
 * The compass's geometry (PLAN §9), pure so it is unit-tested and runs the
 * same on the server (first paint) and in the browser. Every dimension the
 * picker offers is linear in the twelve axis coordinates: an axis, a category
 * index (D-015) or a component of the overall map (D-016). One projection
 * therefore places ideologies, the user and the user's uncertainty alike.
 */

export type DimId = `axis:${AxisId}` | `index:${CategoryId}` | "pc1" | "pc2";

export interface Dim {
  id: DimId;
  /** value = Σ weights[i] · coords[AXIS_IDS[i]] + offset */
  weights: number[];
  offset: number;
  /** Axes and indices share the fixed −100…+100 scale; map components are fitted. */
  fixed: boolean;
}

export interface View {
  x: DimId;
  y: DimId;
}

export const MAP_VIEW: View = { x: "pc1", y: "pc2" };
export const isMapView = (v: View) => v.x === "pc1" && v.y === "pc2";

/** Every dimension the picker offers: 12 axes, the usable indices and the two map components. */
export function dimensions(catalog: Pick<CatalogData, "indices" | "map">): Dim[] {
  const out: Dim[] = AXIS_IDS.map((axis) => ({
    id: `axis:${axis}` as const,
    weights: AXIS_IDS.map((a) => (a === axis ? 1 : 0)),
    offset: 0,
    fixed: true,
  }));
  for (const category of CATEGORY_IDS) {
    const def = catalog.indices[category];
    if (!def?.usable) continue;
    const sumAbs = def.loadings.reduce((s, l) => s + Math.abs(l), 0) || 1;
    out.push({
      id: `index:${category}`,
      weights: AXIS_IDS.map((a) => {
        const k = def.axes.indexOf(a);
        return k < 0 ? 0 : (def.loadings[k] ?? 0) / sumAbs;
      }),
      offset: 0,
      fixed: true,
    });
  }
  catalog.map.components.slice(0, 2).forEach((component, k) => {
    out.push({
      id: k === 0 ? "pc1" : "pc2",
      weights: [...component],
      offset: -component.reduce((s, w, i) => s + w * (catalog.map.mean[i] ?? 0), 0),
      fixed: false,
    });
  });
  return out;
}

export const valueOf = (dim: Dim, coords: Readonly<Record<AxisId, number>>) =>
  AXIS_IDS.reduce((s, a, i) => s + (dim.weights[i] ?? 0) * coords[a], dim.offset);

/** Half-width on a dimension from per-axis half-widths, treating the axes as independent. */
export const spreadOf = (dim: Dim, half: Readonly<Record<AxisId, number>>) =>
  Math.sqrt(AXIS_IDS.reduce((s, a, i) => s + ((dim.weights[i] ?? 0) * half[a]) ** 2, 0));

/** The figure's coordinate system: a square viewBox with a plot inset by PAD. */
export const SIZE = 400;
export const PAD = 30;
const PLOT = SIZE - 2 * PAD;

export interface Frame {
  /** Data value → viewBox coordinate (y grows downwards). */
  sx: (v: number) => number;
  sy: (v: number) => number;
  /** Data units per viewBox unit (for radii). */
  unit: number;
  domainX: [number, number];
  domainY: [number, number];
}

/**
 * Fixed dimensions use −100…+100; map components share one fitted span, so
 * distances stay honest in both directions (the same fit as the hero field).
 */
export function frameFor(xs: readonly number[], ys: readonly number[], fixed: boolean): Frame {
  let domainX: [number, number] = [-100, 100];
  let domainY: [number, number] = [-100, 100];
  if (!fixed && xs.length > 0) {
    const span =
      Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1) * 1.12;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    domainX = [cx - span / 2, cx + span / 2];
    domainY = [cy - span / 2, cy + span / 2];
  }
  const kx = PLOT / (domainX[1] - domainX[0]);
  const ky = PLOT / (domainY[1] - domainY[0]);
  return {
    sx: (v) => PAD + (v - domainX[0]) * kx,
    sy: (v) => SIZE - PAD - (v - domainY[0]) * ky,
    unit: 1 / kx,
    domainX,
    domainY,
  };
}

export interface Placed {
  /** Index into the catalog entries. */
  i: number;
  /** Values on the chosen dimensions. */
  vx: number;
  vy: number;
  /** Position in the viewBox. */
  x: number;
  y: number;
}

export interface UserMark {
  vx: number;
  vy: number;
  x: number;
  y: number;
  /** Ellipse radii in viewBox units (at least 3, so it never collapses to a dot). */
  rx: number;
  ry: number;
}

export interface Layout {
  frame: Frame;
  points: Placed[];
  user: UserMark | null;
}

export interface UserInput {
  scores: Readonly<Record<AxisId, number>>;
  /** Per-axis half-width of the likely range, in points. */
  half: Readonly<Record<AxisId, number>>;
}

export function layoutView(
  view: View,
  dims: readonly Dim[],
  entries: readonly { coords: AxisVector }[],
  user?: UserInput | null,
): Layout {
  const dx = dims.find((d) => d.id === view.x);
  const dy = dims.find((d) => d.id === view.y);
  if (!dx || !dy) throw new Error(`Unknown dimension in view ${view.x} × ${view.y}`);
  const vxs = entries.map((e) => valueOf(dx, e.coords));
  const vys = entries.map((e) => valueOf(dy, e.coords));
  const frame = frameFor(vxs, vys, dx.fixed && dy.fixed);
  const points = entries.map((_, i) => {
    const vx = vxs[i] as number;
    const vy = vys[i] as number;
    return { i, vx, vy, x: frame.sx(vx), y: frame.sy(vy) };
  });
  let mark: UserMark | null = null;
  if (user) {
    const vx = valueOf(dx, user.scores);
    const vy = valueOf(dy, user.scores);
    mark = {
      vx,
      vy,
      x: frame.sx(vx),
      y: frame.sy(vy),
      rx: Math.max(3, spreadOf(dx, user.half) / frame.unit),
      // Both domains always share one span, so one unit serves both radii.
      ry: Math.max(3, spreadOf(dy, user.half) / frame.unit),
    };
  }
  return { frame, points, user: mark };
}

/** Halftone grid resolution: cells per side. */
export const GRID = 30;
export const CELL = PLOT / GRID;
/** Densities below this share of the maximum print no dot. */
const FLOOR = 0.12;

/**
 * Gaussian kernel density on a GRID × GRID lattice, as levels in 0…1 (dot area
 * follows the level). The kernel narrows as the catalog grows, so 300 entries
 * show structure instead of one blob.
 */
export function densityLevels(points: readonly { x: number; y: number }[]): number[] {
  const n = Math.max(points.length, 1);
  const bandwidth = Math.min(26, Math.max(10, 24 * Math.sqrt(53 / n)));
  const twoB2 = 2 * bandwidth ** 2;
  const density: number[] = [];
  for (let row = 0; row < GRID; row++)
    for (let col = 0; col < GRID; col++) {
      const x = PAD + (col + 0.5) * CELL;
      const y = PAD + (row + 0.5) * CELL;
      let d = 0;
      for (const p of points) d += Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / twoB2);
      density.push(d);
    }
  const max = Math.max(...density, 1e-9);
  return density.map((d) => Math.max(0, (d / max - FLOOR) / (1 - FLOOR)) ** 1.15);
}

/** Marker size in viewBox units: smaller as the catalog grows. */
export const markerSize = (n: number) =>
  Math.min(12, Math.max(6, 12 * Math.sqrt(53 / Math.max(n, 1))));

export interface LabelSpot {
  i: number;
  /** Label to the left of the marker (near the right edge). */
  left: boolean;
}

export type Box = [number, number, number, number];

/** Advance of one `.annot` character (12px mono, 0.06em tracking) and the label's line box, in px. */
export const LABEL_CHAR_PX = 7.9;
export const LABEL_HEIGHT_PX = 16;
/** Gap between a marker's edge and its label, in px. */
export const LABEL_GAP_PX = 4;

/** A label's width in px. */
export const labelWidthPx = (text: string) => text.length * LABEL_CHAR_PX + 8;
const overlaps = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/**
 * Greedy collision-free labels. Candidates go in priority order (outermost
 * entry of each spectrum first, then the rest by distance from the centre);
 * each label is tried right, then left of its marker, and kept only if it
 * clears every placed label, every other marker and the plot edge. The font
 * stays 12px while the figure scales, so `widthPx` decides how many fit:
 * a phone shows a handful, a desktop dozens, never a pile-up at 300+.
 */
export function placeLabels(
  points: readonly Placed[],
  names: readonly string[],
  groups: readonly string[],
  widthPx: number,
  marker: number,
  reserved: readonly Box[] = [],
): LabelSpot[] {
  const unit = SIZE / Math.max(widthPx, 160);
  const centre = SIZE / 2;
  const reach = (p: Placed) => Math.hypot(p.x - centre, p.y - centre);
  const order = [...points].sort((a, b) => reach(b) - reach(a));
  const seen = new Set<string>();
  const first = order.filter((p) => {
    const g = groups[p.i] ?? "";
    if (seen.has(g)) return false;
    seen.add(g);
    return true;
  });
  const candidates = [...first, ...order.filter((p) => !first.includes(p))];
  // Matches the paper knock-out drawn behind each marker (0.85 × its size).
  const half = marker * 0.85 + 1;
  const markers: Box[] = points.map((p) => [p.x - half, p.y - half, p.x + half, p.y + half]);
  const placed: Box[] = [...reserved];
  const out: LabelSpot[] = [];
  const height = LABEL_HEIGHT_PX * unit;
  const gap = marker / 2 + LABEL_GAP_PX * unit;
  for (const p of candidates) {
    const width = labelWidthPx(names[p.i] ?? "") * unit;
    for (const left of p.x > SIZE * 0.6 ? [true, false] : [false, true]) {
      const x0 = left ? p.x - gap - width : p.x + gap;
      const box: Box = [x0, p.y - height / 2, x0 + width, p.y + height / 2];
      if (box[0] < PAD || box[2] > SIZE - PAD || box[1] < PAD || box[3] > SIZE - PAD) continue;
      if (placed.some((b) => overlaps(b, box))) continue;
      if (markers.some((b, k) => k !== p.i && overlaps(b, box))) continue;
      placed.push(box);
      out.push({ i: p.i, left });
      break;
    }
  }
  return out;
}

export type Direction = "left" | "right" | "up" | "down";

/**
 * Keyboard stepping: the nearest point in the pressed direction, within a
 * 60° cone on either side; if none, the furthest point the other way (wrap).
 * Starting from nothing, the first step goes to the most extreme point.
 */
export function stepFrom(points: readonly Placed[], from: number | null, dir: Direction): number {
  const unitVectors: Record<Direction, [number, number]> = {
    left: [-1, 0],
    right: [1, 0],
    up: [0, -1],
    down: [0, 1],
  };
  const [ux, uy] = unitVectors[dir];
  const along = (p: Placed) => p.x * ux + p.y * uy;
  const current = from === null ? undefined : points.find((p) => p.i === from);
  if (!current) {
    const best = [...points].sort((a, b) => along(a) - along(b))[0];
    return best?.i ?? 0;
  }
  let best: Placed | undefined;
  let bestScore = Infinity;
  for (const p of points) {
    if (p.i === current.i) continue;
    const dx = p.x - current.x;
    const dy = p.y - current.y;
    const forward = dx * ux + dy * uy;
    const side = Math.abs(dx * uy - dy * ux);
    if (forward <= 0.01 || side > forward * Math.tan(Math.PI / 3)) continue;
    const score = forward + 2 * side;
    if (score < bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (best) return best.i;
  const wrap = [...points].filter((p) => p.i !== current.i).sort((a, b) => along(a) - along(b))[0];
  return wrap?.i ?? current.i;
}

/** The entry nearest a viewBox position. */
export function nearest(points: readonly Placed[], x: number, y: number): number | null {
  let best: number | null = null;
  let bestD = Infinity;
  for (const p of points) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p.i;
    }
  }
  return best;
}
