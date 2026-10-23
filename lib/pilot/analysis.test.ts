import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { modeQuestions, QUESTION_BANK } from "@/data/questions/bank";
import { createRng } from "@/lib/engine/random";
import { simulateAnswers } from "@/lib/engine/simulate";
import type { AxisVector, BankItem } from "@/lib/engine/types";
import { ENGINE_VERSION } from "@/lib/engine/version";
import { pilotFileSchema, type PilotFile } from "@/lib/schema/pilot";
import { analyse, cronbachAlpha, toMarkdown } from "./analysis";

const standard = modeQuestions("standard") as readonly BankItem[];

function population(n: number, seed: number, offsets?: Record<string, number>): PilotFile[] {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => {
    const coords = Object.fromEntries(AXIS_IDS.map((a) => [a, rng() * 180 - 90])) as AxisVector;
    const answers = simulateAnswers(standard, coords, { sigma: 0.6, rng, ms: 4000, offsets });
    return pilotFileSchema.parse({
      format: "spectrum-pilot",
      version: 1,
      bankVersion: "test",
      engineVersion: ENGINE_VERSION,
      mode: "standard",
      locale: "en",
      answers,
    });
  });
}

describe("pilot analysis", () => {
  it("computes Cronbach's alpha", () => {
    expect(
      cronbachAlpha([
        [1, 1],
        [2, 2],
        [3, 3],
      ]),
    ).toBeCloseTo(1, 6);
    expect(cronbachAlpha([[1], [2]])).toBeNull();
  });

  it("finds reliable axes and no weak items in well-behaved answers", () => {
    const report = analyse(population(60, 7), QUESTION_BANK);
    expect(report.files).toBe(60);
    expect(report.items).toHaveLength(72);
    for (const axis of report.axes) expect(axis.alpha ?? 0).toBeGreaterThan(0.7);
    expect(report.items.filter((i) => i.flagged)).toEqual([]);
    expect(report.mirrors.length).toBeGreaterThan(0);
    for (const m of report.mirrors) expect(m.consistent).toBeGreaterThan(0.8);
  });

  it("flags a mis-keyed item", () => {
    const files = population(60, 11);
    const target = standard[4] as BankItem;
    const misKeyed = QUESTION_BANK.map((q) =>
      q.id === target.id ? { ...q, key: (q.key === 1 ? -1 : 1) as 1 | -1 } : q,
    );
    const item = analyse(files, misKeyed).items.find((i) => i.id === target.id);
    expect(item?.flagged).toBe(true);
    expect(item?.itemTotal ?? 0).toBeLessThan(0);
  });

  it("reports a difficulty offset for an item that is easier to agree with", () => {
    const item = standard.find((q) => q.key === 1) as BankItem;
    const report = analyse(population(60, 13, { [item.id]: 1 }), QUESTION_BANK);
    expect(report.items.find((i) => i.id === item.id)?.difficultyOffset ?? 0).toBeGreaterThan(15);
    expect(toMarkdown(report)).toContain("# Pilot report");
  });

  it("rejects files with anything beyond the documented fields", () => {
    const [file] = population(1, 3);
    expect(pilotFileSchema.safeParse({ ...file, name: "Alex" }).success).toBe(false);
    expect(pilotFileSchema.safeParse({ ...file, country: "Switzerland" }).success).toBe(false);
    expect(pilotFileSchema.safeParse({ ...file, country: "CH" }).success).toBe(true);
  });
});
