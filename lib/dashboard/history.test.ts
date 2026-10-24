import { describe, expect, it } from "vitest";
import { AXIS_IDS } from "@/data/axes";
import { modeQuestions } from "@/data/questions/bank";
import { catalogData } from "@/lib/catalog/client-data";
import type { AnswerRecord, RawAnswer } from "@/lib/engine/types";
import { historyFileSchema, HISTORY_FORMAT, HISTORY_VERSION } from "@/lib/schema/history";
import type { StoredResult } from "@/lib/storage/db";
import { resultKey } from "@/lib/storage/db";
import { buildResult } from "@/lib/test/result";
import { axisSeries, compare, drift, readings, suggestion, DRIFT_THRESHOLD } from "./history";

const catalog = catalogData("en");

function answered(
  mode: "quick" | "standard",
  pick: (i: number) => RawAnswer,
): Record<string, AnswerRecord> {
  return Object.fromEntries(modeQuestions(mode).map((q, i) => [q.id, { r: pick(i), ms: 4000 }]));
}

const make = (
  id: number,
  date: string,
  mode: "quick" | "standard",
  pick: (i: number) => RawAnswer,
) => ({
  ...buildResult(mode, answered(mode, pick), catalog.bankVersion, new Date(date)),
  id,
});

const a = make(1, "2026-01-10T10:00:00.000Z", "quick", (i) => ((i % 5) - 2) as RawAnswer);
const b = make(2, "2026-06-10T10:00:00.000Z", "standard", (i) => (i % 2 ? 2 : -2) as RawAnswer);

describe("dashboard history", () => {
  it("orders readings by date and finds the closest ideology", () => {
    const list = readings([b, a], "taken", catalog);
    expect(list.map((r) => r.result.id)).toEqual([1, 2]);
    expect(list[0]?.closest?.entry.name).toBeTruthy();
    expect(list[0]?.versionChanged).toBe(false);
  });

  it("recomputes from answers and flags changed versions", () => {
    const old = {
      ...a,
      engineVersion: "0.9.0",
      scoresAsTaken: { ...a.scoresAsTaken, liberty: 99 },
    };
    const [taken] = readings([old], "taken", catalog);
    const [again] = readings([old], "recomputed", catalog);
    expect(taken?.scores.liberty).toBe(99);
    expect(again?.scores.liberty).toBe(a.scoresAsTaken.liberty);
    expect(again?.versionChanged).toBe(true);
  });

  it("builds a band around each score", () => {
    const series = axisSeries(readings([a, b], "taken", catalog));
    for (const axis of AXIS_IDS)
      for (const p of series[axis]) {
        expect(p.low).toBeLessThanOrEqual(p.score);
        expect(p.high).toBeGreaterThanOrEqual(p.score);
      }
  });

  it("summarises drift between the first and the latest result", () => {
    const list = readings([a, b], "taken", catalog);
    const d = drift(list);
    expect(d).not.toBeNull();
    expect(d!.moved.length + d!.steady.length).toBe(12);
    for (const m of d!.moved) expect(Math.abs(m.delta)).toBeGreaterThanOrEqual(DRIFT_THRESHOLD);
    expect(drift(list.slice(0, 1))).toBeNull();
  });

  it("compares two results axis by axis", () => {
    const [x, y] = readings([a, b], "taken", catalog);
    const c = compare(x!, y!);
    expect(c.rows).toHaveLength(12);
    expect(compare(x!, x!).meanDistance).toBe(0);
  });

  it("suggests the next step from the latest result", () => {
    expect(suggestion([])).toEqual({ kind: "first" });
    // The synthetic answer pattern trips the quality checks; this case is about timing.
    const quick = readings([{ ...a, lowQuality: false }], "taken", catalog);
    expect(suggestion(readings([{ ...a, lowQuality: true }], "taken", catalog)).kind).toBe(
      "lowQuality",
    );
    expect(suggestion(quick, new Date("2026-01-20")).kind).toBe("longer");
    expect(suggestion(quick, new Date("2026-06-01")).kind).toBe("stale");
  });
});

describe("history export file", () => {
  it("round-trips stored results and rejects unknown fields", () => {
    const strip = ({ id: _id, ...rest }: StoredResult) => rest;
    const file = {
      format: HISTORY_FORMAT,
      version: HISTORY_VERSION,
      exportedAt: new Date().toISOString(),
      results: [strip({ ...a, note: "private" }), strip(b)],
    };
    const parsed = historyFileSchema.parse(JSON.parse(JSON.stringify(file)));
    expect(parsed.results.map(resultKey)).toEqual([resultKey(a), resultKey(b)]);
    expect(() => historyFileSchema.parse({ ...file, ip: "x" })).toThrow();
  });
});
