import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { modeQuestions } from "@/data/questions/bank";
import type { RawAnswer } from "@/lib/engine/types";
import { HISTORY_FORMAT, HISTORY_VERSION, historyFileSchema } from "@/lib/schema/history";
import { buildResult } from "@/lib/test/result";

const BANK = JSON.parse(readFileSync("generated/derived.json", "utf8"))
  .questionBankVersion as string;

function history() {
  const answers = (mode: "quick" | "standard", pick: (i: number) => RawAnswer) =>
    Object.fromEntries(modeQuestions(mode).map((q, i) => [q.id, { r: pick(i), ms: 4000 }]));
  const pattern = [2, 1, -1, 0, -2, 1, 2, -1, 1, 0] as const;
  const a = buildResult(
    "quick",
    answers("quick", (i) => pattern[i % pattern.length] as RawAnswer),
    BANK,
    new Date("2026-01-10T10:00:00Z"),
  );
  const b = buildResult(
    "standard",
    answers("standard", (i) => -(pattern[(i + 3) % pattern.length] as number) as RawAnswer),
    BANK,
    new Date("2026-06-10T10:00:00Z"),
  );
  const file = {
    format: HISTORY_FORMAT,
    version: HISTORY_VERSION,
    exportedAt: "2026-06-11T00:00:00.000Z",
    results: [a, b],
  };
  const dir = mkdtempSync(join(tmpdir(), "history-"));
  const path = join(dir, "spectrum-history.json");
  writeFileSync(path, JSON.stringify(file));
  return path;
}

async function importHistory(page: Page, path: string) {
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: "Import my history" }).click(),
  ]);
  await chooser.setFiles(path);
}

test("dashboard: import, axes, timeline, compare, notes, export, delete", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/en/dashboard");
  await expect(page.getByText(/no result in this browser yet/)).toBeVisible();
  await expectNoSerious(page);

  const path = history();
  await importHistory(page, path);
  await expect(page.getByText("Imported 2 results; 0 already here.").first()).toBeAttached();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // Header, twelve sparklines, a two-step timeline, drift and the comparison table.
  await expect(page.locator("dd").filter({ hasText: /^2$/ })).toBeVisible();
  await expect(
    page.locator(
      '#dash-axes ~ * svg[role="img"], section[aria-labelledby="dash-axes"] svg[role="img"]',
    ),
  ).toHaveCount(12);
  await expect(page.locator('section[aria-labelledby="dash-timeline"] li')).toHaveCount(2);
  await expect(page.locator('section[aria-labelledby="dash-drift"]')).toContainText("From");
  await expect(page.locator("#dash-compare-caption")).toContainText("mean difference");
  await expect(page.locator('section[aria-labelledby="dash-compare"] tbody tr')).toHaveCount(12);

  // Importing the same file again adds nothing.
  await importHistory(page, path);
  await expect(page.getByText("Imported 0 results; 2 already here.").first()).toBeAttached();

  // Versioning toggle.
  await page.getByRole("radio", { name: "As taken" }).click();
  await expect(page.getByRole("radio", { name: "As taken" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expectNoSerious(page);

  // A private note survives a reload.
  const note = page.getByLabel("Private note").first();
  await note.fill("Felt unsure about trade.");
  await note.blur();
  await expect(page.getByText("Note saved in this browser.").first()).toBeAttached();
  await page.reload();
  await expect(page.getByLabel("Private note").first()).toHaveValue("Felt unsure about trade.");

  // Export: the file validates and carries the note.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export my data" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("spectrum-history.json");
  const saved = join(mkdtempSync(join(tmpdir(), "export-")), "out.json");
  await download.saveAs(saved);
  const exported = historyFileSchema.parse(JSON.parse(readFileSync(saved, "utf8")));
  expect(exported.results).toHaveLength(2);
  expect(exported.results.some((r) => r.note === "Felt unsure about trade.")).toBe(true);

  // Delete one, then everything (two steps, no browser dialog).
  await page.getByRole("button", { name: "Delete this result" }).first().click();
  await page.getByRole("button", { name: "Yes, delete it" }).click();
  await expect(page.locator('section[aria-labelledby="dash-timeline"] li')).toHaveCount(1);
  await page.getByRole("button", { name: "Delete everything" }).click();
  await page.getByRole("button", { name: "Yes, delete everything" }).click();
  await expect(page.getByText(/no result in this browser yet/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/no result in this browser yet/)).toBeVisible();
});

test("a bad file imports nothing and says so", async ({ page }) => {
  await page.goto("/en/dashboard");
  const path = join(mkdtempSync(join(tmpdir(), "bad-")), "bad.json");
  writeFileSync(path, JSON.stringify({ format: "something-else" }));
  await importHistory(page, path);
  await expect(page.getByText(/not a Spectrum history export/).first()).toBeAttached();
});

test("the dashboard fits 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/dashboard");
  await importHistory(page, history());
  await expect(page.locator('section[aria-labelledby="dash-timeline"] li')).toHaveCount(2);
  for (const path of ["/en/dashboard", "/de/verlauf", "/fr/tableau-de-bord"]) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

async function expectNoSerious(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}
