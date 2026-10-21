import { describe, expect, it } from "vitest";
import { computeIndex, deriveIndexDefs } from "../indices";
import { pca, project, symmetricEigen } from "../pca";
import type { AxisVector } from "../types";
import { axisVector } from "../vector";

describe("pca", () => {
  it("diagonalizes a symmetric matrix", () => {
    const { values } = symmetricEigen([
      [2, 1],
      [1, 2],
    ]);
    expect([...values].sort()).toEqual([expect.closeTo(1, 10), expect.closeTo(3, 10)]);
  });

  it("finds the direction of correlated data and explains all variance in sum", () => {
    const rows = Array.from({ length: 50 }, (_, i) => [i, i + (i % 3) * 0.01, 5]);
    const r = pca(rows);
    expect(Math.abs(r.components[0]?.[0] ?? 0)).toBeCloseTo(Math.SQRT1_2, 3);
    expect(r.explained[0]).toBeGreaterThan(0.99);
    expect(r.explained.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 10);
    expect(project([0, 0, 5], r, 1)[0]).toBeLessThan(0);
  });

  it("is deterministic", () => {
    const rows = Array.from({ length: 30 }, (_, i) => [Math.sin(i), Math.cos(i * 1.3), i % 5]);
    expect(pca(rows)).toEqual(pca(rows));
  });
});

describe("category indices", () => {
  const catalog = Array.from({ length: 40 }, (_, i) => {
    const t = i * 5 - 100;
    return {
      coords: axisVector((a) =>
        a === "distribution" || a === "ownership" || a === "trade" ? t : ((i * 37) % 200) - 100,
      ) as AxisVector,
    };
  });

  it("orients PC1 by the first-listed pole and reports explained variance", () => {
    const defs = deriveIndexDefs(catalog);
    expect(defs.economic.loadings[0]).toBeGreaterThan(0);
    expect(defs.economic.explained).toBeGreaterThan(0.99);
    expect(defs.economic.usable).toBe(true);
  });

  it("maps the poles to −100 and +100 and neutral to 0", () => {
    const def = deriveIndexDefs(catalog).economic;
    expect(
      computeIndex(
        def,
        axisVector(() => -100),
      ).value,
    ).toBeCloseTo(-100, 6);
    expect(
      computeIndex(
        def,
        axisVector(() => 100),
      ).value,
    ).toBeCloseTo(100, 6);
    expect(
      computeIndex(
        def,
        axisVector(() => 0),
      ).value,
    ).toBe(0);
  });
});
