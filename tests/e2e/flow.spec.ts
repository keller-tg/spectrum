import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { AXIS_IDS, AXES } from "@/data/axes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { analyse } from "@/lib/pilot/analysis";
import { pilotFileSchema } from "@/lib/schema/pilot";

async function expectNoSeriousA11yIssues(page: Page) {
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

/**
 * Answer questions `from`…`total` from the keyboard (auto-advance is on by
 * default), waiting for each next question before the next key.
 */
async function answerAll(page: Page, from: number, total: number) {
  for (let n = from; n <= total; n++) {
    await expect(page.getByText(`Question ${n} of ${total}`)).toBeVisible();
    await page.keyboard.press(String((n % 5) + 1));
    if (n < total) await expect(page.getByText(`Question ${n + 1} of ${total}`)).toBeVisible();
  }
  await expect(page.getByText(`${total} / ${total}`)).toBeVisible();
}

test("Quick → results → share → upgrade to Standard → results", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/en/test/quick/1");
  await expect(page.getByText("Question 1 of 36")).toBeVisible();
  await expectNoSeriousA11yIssues(page);
  await answerAll(page, 1, 36);
  await expect(page).toHaveURL(/\/en\/test\/quick\/36$/);
  await page.getByRole("button", { name: /See my results/ }).click();

  // Own results never appear in the URL.
  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your results");
  await expect(page.getByText("Closest ideology", { exact: true })).toBeVisible();
  await expect(page.locator("#axes")).toBeAttached();
  await expectNoSeriousA11yIssues(page);

  // A share code exists only after pressing the button.
  await expect(page.locator("#share-url")).toHaveCount(0);
  await page.getByRole("button", { name: /Create a share link/ }).click();
  const link = await page.locator("#share-url").inputValue();
  expect(link).toMatch(/\/en\/results\/[A-Za-z0-9_-]{20,}$/);
  await expect(page).toHaveURL(/\/en\/results$/);

  await page.goto(link);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A shared result");
  await expect(page.getByText("Closest ideology", { exact: true })).toBeVisible();
  await page.goto(link.slice(0, -3) + "AAA");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This share link does not work");

  // Upgrade: the 36 answers are kept, the test continues at question 37.
  await page.goto("/en/results");
  await page.getByRole("button", { name: "Answer 36 more" }).click();
  await expect(page).toHaveURL(/\/en\/test\/standard\/37$/);
  await expect(page.getByText("36 / 72")).toBeVisible();
  await answerAll(page, 37, 72);
  await page.getByRole("button", { name: /See my results/ }).click();
  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(page.getByText("Spectrum · result · Standard")).toBeVisible();
});

test("the answer rows never move and no axis or pole is named during the test", async ({
  page,
}) => {
  await page.goto("/en/test/standard/1");
  const group = page.getByRole("radiogroup", { name: "Your answer" });
  const tops: number[] = [];
  for (let n = 1; n <= 6; n++) {
    await page.goto(`/en/test/standard/${n}`);
    tops.push(Math.round((await group.boundingBox())?.y ?? -1));
  }
  expect(new Set(tops).size).toBe(1);
  const text = await page.locator("main").innerText();
  for (const axis of AXIS_IDS)
    for (const label of [AXES[axis].name.en, AXES[axis].neg.label.en, AXES[axis].pos.label.en])
      expect(text, label).not.toContain(label);
});

test("results without a stored result explain where results live", async ({ page }) => {
  await page.goto("/en/results");
  await expect(page.getByText(/no result in this browser yet/)).toBeVisible();
});

test("the pilot needs consent, stores nothing and its file round-trips through the analysis", async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const response = await page.goto("/en/pilot");
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expectNoSeriousA11yIssues(page);
  await page.getByRole("radio", { name: "Quick" }).click();
  const start = page.getByRole("button", { name: /Start the pilot/ });
  await expect(start).toHaveAttribute("aria-disabled", "true");
  await page.locator("#pilot-country").fill("ch");
  await page.locator("label[for=pilot-consent]").click();
  await start.click();
  await answerAll(page, 1, 36);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /See my results/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^spectrum-pilot-[0-9a-f]{10}\.json$/);
  const dir = mkdtempSync(join(tmpdir(), "pilot-"));
  const path = join(dir, download.suggestedFilename());
  await download.saveAs(path);
  const file = pilotFileSchema.parse(
    JSON.parse(await (await import("node:fs/promises")).readFile(path, "utf8")),
  );
  expect(file.country).toBe("CH");
  expect(Object.keys(file.answers)).toHaveLength(36);
  writeFileSync(join(dir, "copy.json"), JSON.stringify(file));
  const report = analyse([file, file], QUESTION_BANK);
  expect(report.files).toBe(2);
  expect(report.items).toHaveLength(36);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thank you");
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(async () => (await indexedDB.databases()).length)).toBe(0);
});

test("test and results pages fit 390px without sideways scrolling", async ({ browser }) => {
  test.setTimeout(90_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/en/test/quick/1");
  await answerAll(page, 1, 36);
  await page.getByRole("button", { name: /See my results/ }).click();
  await expect(page).toHaveURL(/\/en\/results$/);
  for (const path of ["/en/test/quick/5", "/de/test/standard/40", "/en/results", "/fr/pilot"]) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
  await context.close();
});
