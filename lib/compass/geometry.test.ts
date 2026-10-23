import { describe, expect, it } from "vitest";
import { AXIS_IDS, type AxisId } from "@/data/axes";
import { catalogData } from "@/lib/catalog/client-data";
import { catalogMap, mapPosition } from "@/lib/catalog/map";
import { computeIndex } from "@/lib/engine/indices";
import {
  dimensions,
  layoutView,
  MAP_VIEW,
  nearest,
  PAD,
  placeLabels,
  SIZE,
  spreadOf,
  stepFrom,
  valueOf,
  densityLevels,
  markerSize,
  labelWidthPx,
  LABEL_GAP_PX,
  type Placed,
} from "./geometry";

const catalog = catalogData("en");
const dims = dimensions(catalog);
const uniform = (v: number) =>
  Object.fromEntries(AXIS_IDS.map((a) => [a, v])) as Record<AxisId, number>;

describe("compass dimensions", () => {
  it("offers 12 axes, the usable indices and the two map components", () => {
    const usable = Object.values(catalog.indices).filter((d) => d.usable).length;
    expect(dims).toHaveLength(12 + usable + 2);
  });

  it("projects exactly like the engine's index and the build-time map", () => {
    const entry = catalog.entries[0]!;
    for (const def of Object.values(catalog.indices).filter((d) => d.usable)) {
      const dim = dims.find((d) => d.id === `index:${def.category}`)!;
      expect(valueOf(dim, entry.coords)).toBeCloseTo(computeIndex(def, entry.coords).value, 9);
    }
    const [pc1, pc2] = mapPosition(entry.coords, catalogMap().map);
    expect(
      valueOf(
        dims.find((d) => d.id === "pc1")!,
        entry.coords,
      ),
    ).toBeCloseTo(pc1, 6);
    expect(
      valueOf(
        dims.find((d) => d.id === "pc2")!,
        entry.coords,
      ),
    ).toBeCloseTo(pc2, 6);
  });

  it("spreads uncertainty: an axis keeps its width, a mix of axes narrows it", () => {
    const half = uniform(20);
    expect(
      spreadOf(
        dims.find((d) => d.id === `axis:${AXIS_IDS[0]}`)!,
        half,
      ),
    ).toBeCloseTo(20, 9);
    const index = dims.find((d) => d.id.startsWith("index:"))!;
    expect(spreadOf(index, half)).toBeLessThan(20);
  });
});

describe("compass layout", () => {
  it("keeps every entry and the user inside the plot on fixed axes", () => {
    const view = { x: dims[0]!.id, y: dims[1]!.id };
    const { points, user } = layoutView(view, dims, catalog.entries, {
      scores: uniform(100),
      half: uniform(10),
    });
    for (const p of [...points, user!]) {
      expect(p.x).toBeGreaterThanOrEqual(PAD - 1e-9);
      expect(p.x).toBeLessThanOrEqual(SIZE - PAD + 1e-9);
    }
    // +100 on the y axis is at the top.
    expect(user!.y).toBeCloseTo(PAD, 9);
  });

  it("fits the map with one span for both components", () => {
    const { frame } = layoutView(MAP_VIEW, dims, catalog.entries);
    const spanX = frame.domainX[1] - frame.domainX[0];
    const spanY = frame.domainY[1] - frame.domainY[0];
    expect(spanX).toBeCloseTo(spanY, 9);
  });

  it("density levels are in 0…1 with a maximum of 1", () => {
    const { points } = layoutView(MAP_VIEW, dims, catalog.entries);
    const levels = densityLevels(points);
    expect(Math.max(...levels)).toBeCloseTo(1, 9);
    expect(Math.min(...levels)).toBeGreaterThanOrEqual(0);
  });
});

/** A synthetic catalog of n points spread over the plot. */
function synthetic(n: number): Placed[] {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, (_, i) => {
    const x = PAD + rand() * (SIZE - 2 * PAD);
    const y = PAD + rand() * (SIZE - 2 * PAD);
    return { i, vx: x, vy: y, x, y };
  });
}

describe("compass labels", () => {
  const overlap = (a: number[], b: number[]) =>
    a[0]! < b[2]! && b[0]! < a[2]! && a[1]! < b[3]! && b[1]! < a[3]!;

  it.each([53, 300])("never overlap at %i entries and grow with width", (n) => {
    const points = synthetic(n);
    const names = points.map((p) => `Ideology ${p.i} name`);
    const groups = points.map((p) => String(p.i % 9));
    const narrow = placeLabels(points, names, groups, 360, markerSize(n));
    const wide = placeLabels(points, names, groups, 900, markerSize(n));
    expect(wide.length).toBeGreaterThan(narrow.length);
    const unit = SIZE / 900;
    const boxes = wide.map(({ i, left }) => {
      const p = points[i]!;
      const w = labelWidthPx(names[i]!) * unit;
      const gap = markerSize(n) / 2 + LABEL_GAP_PX * unit;
      const x0 = left ? p.x - gap - w : p.x + gap;
      return [x0, p.y - 8 * unit, x0 + w, p.y + 8 * unit];
    });
    boxes.forEach((a, k) => boxes.slice(k + 1).forEach((b) => expect(overlap(a, b)).toBe(false)));
  });
});

describe("compass keyboard", () => {
  const grid: Placed[] = [
    { i: 0, vx: 0, vy: 0, x: 100, y: 100 },
    { i: 1, vx: 0, vy: 0, x: 200, y: 100 },
    { i: 2, vx: 0, vy: 0, x: 100, y: 200 },
    { i: 3, vx: 0, vy: 0, x: 300, y: 110 },
  ];

  it("steps to the nearest point in the pressed direction", () => {
    expect(stepFrom(grid, 0, "right")).toBe(1);
    expect(stepFrom(grid, 1, "right")).toBe(3);
    expect(stepFrom(grid, 0, "down")).toBe(2);
  });

  it("wraps around at the edge and starts at the extreme", () => {
    expect(stepFrom(grid, 3, "right")).toBe(0);
    expect(stepFrom(grid, null, "right")).toBe(0);
  });

  it("finds the nearest entry to a position", () => {
    expect(nearest(grid, 190, 105)).toBe(1);
  });
});

describe("compass at catalog scale", () => {
  it("lays out 300 entries (density and labels) within one frame budget", () => {
    const points = synthetic(300);
    const names = points.map((p) => `Ideology ${p.i}`);
    const groups = points.map((p) => String(p.i % 9));
    const start = performance.now();
    densityLevels(points);
    const labels = placeLabels(points, names, groups, 1200, markerSize(300));
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(40);
    // A wide figure labels a useful share, never all 300.
    expect(labels.length).toBeGreaterThan(15);
    expect(labels.length).toBeLessThan(300);
    expect(markerSize(300)).toBeGreaterThanOrEqual(6);
  });
});
