import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { decodeResult, encodeResult } from "../codec";
import {
  asUser,
  displaySimilarity,
  familyCentroids,
  matchDistance,
  similarity,
  summarizeMatches,
} from "../match";
import { createRng } from "../random";
import type { Matchable } from "../types";
import { axisVector } from "../vector";

const flat = (v: number) => axisVector(() => v);
const entry = (id: string, v: number, extra: Partial<Matchable> = {}): Matchable => ({
  id,
  coords: flat(v),
  salience: flat(0.5),
  ...extra,
});

describe("matching", () => {
  it("has zero distance to itself and τ gives 50 %", () => {
    expect(matchDistance(asUser(flat(30)), entry("x", 30))).toBe(0);
    expect(similarity(40, 40)).toBeCloseTo(50, 10);
    expect(displaySimilarity(100)).toBe(99);
  });

  it("ignores axes the user did not answer", () => {
    const user = {
      scores: axisVector((a) => (a === "distribution" ? 80 : 0)),
      confidences: axisVector((a) => (a === "distribution" ? 1 : 0)),
    };
    const e = {
      id: "e",
      coords: axisVector((a) => (a === "distribution" ? 80 : -100)),
      salience: flat(1),
    };
    expect(matchDistance(user, e)).toBe(0);
  });

  it("collapses variants into their parent and keeps the best variant", () => {
    const entries = [
      entry("parent", 10, { family: "f" }),
      entry("child", 30, { family: "f", parent: "parent" }),
      entry("other", -60, { family: "g" }),
    ];
    const s = summarizeMatches(asUser(flat(30)), entries, 40);
    expect(s.top.map((t) => t.item.entry.id)).toEqual(["parent", "other"]);
    expect(s.top[0]?.bestVariant?.entry.id).toBe("child");
    expect(s.closestVariant?.entry.id).toBe("child");
    expect(s.closestFamily?.entry.id).toBe("f");
    expect(s.furthest?.entry.id).toBe("other");
  });

  it("never headlines a low-placement entry when a medium/high one is within the margin", () => {
    const entries = [
      entry("shaky", 20, { placement: "low" }),
      entry("solid", 18, { placement: "high" }),
    ];
    const s = summarizeMatches(asUser(flat(20)), entries, 40);
    expect(s.top[0]?.item.entry.id).toBe("shaky");
    expect(s.headline?.item.entry.id).toBe("solid");
  });

  it("never makes an atrocity-context entry the share-card hero", () => {
    const entries = [entry("a", 20, { atrocity: true }), entry("b", -10)];
    const s = summarizeMatches(asUser(flat(20)), entries, 40);
    expect(s.headline?.item.entry.id).toBe("a");
    expect(s.shareHero?.item.entry.id).toBe("b");
  });

  it("notes when the top two are close", () => {
    const s = summarizeMatches(
      asUser(flat(0)),
      [entry("a", 5), entry("b", -5), entry("c", 90)],
      40,
    );
    expect(s.inBetween?.map((t) => t.item.entry.id).sort()).toEqual(["a", "b"]);
  });

  it("hides hidden entries from matching", () => {
    const s = summarizeMatches(
      asUser(flat(0)),
      [entry("meme", 0, { hidden: true }), entry("real", 40)],
      40,
    );
    expect(s.ranked.map((r) => r.entry.id)).toEqual(["real"]);
  });

  it("builds salience-weighted family centroids", () => {
    const [c] = familyCentroids([
      { id: "x", family: "f", coords: flat(100), salience: flat(1) },
      { id: "y", family: "f", coords: flat(0), salience: flat(0) },
    ]);
    expect(c?.coords.distribution).toBe(100);
  });
});

describe("share code", () => {
  it("round-trips scores, confidences, mode and flags in 31 characters", () => {
    const rng = createRng(42);
    for (let i = 0; i < 300; i++) {
      const input = {
        mode: (["quick", "standard", "deep"] as const)[i % 3] ?? "quick",
        lowQuality: i % 4 === 0,
        flags: i % 4 === 0 ? (["straightline", "fast"] as const).slice() : [],
        scores: axisVector(() => Math.round(rng() * 200 - 100) + 0),
        confidences: axisVector(() => Math.round(rng() * 15) / 15),
      };
      const code = encodeResult(input);
      expect(code).toMatch(/^[A-Za-z0-9_-]{31}$/);
      const out = decodeResult(code);
      expect(out).not.toBeNull();
      expect(out?.mode).toBe(input.mode);
      expect(out?.lowQuality).toBe(input.lowQuality);
      expect(out?.flags.sort()).toEqual([...input.flags].sort());
      for (const a of AXIS_IDS) {
        expect(out?.scores[a]).toBe(input.scores[a]);
        expect(out?.confidences[a]).toBeCloseTo(input.confidences[a], 10);
      }
    }
  });

  it("rejects tampered, truncated or foreign codes", () => {
    const code = encodeResult({
      mode: "standard",
      lowQuality: false,
      flags: [],
      scores: flat(12),
      confidences: flat(0.6),
    });
    const tampered = (code[5] === "A" ? "B" : "A") + "";
    expect(decodeResult(code.slice(0, 5) + tampered + code.slice(6))).toBeNull();
    expect(decodeResult(code.slice(0, -2))).toBeNull();
    expect(decodeResult("not a code!")).toBeNull();
  });
});
