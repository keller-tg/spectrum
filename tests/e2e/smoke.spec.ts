import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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

test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|de|fr)$/);
});

for (const [locale, heading] of [
  ["en", /one line/],
  ["de", /eine Linie/],
  ["fr", /une seule ligne/],
] as const) {
  test(`home renders in ${locale} and passes axe`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    await expectNoSeriousA11yIssues(page);
  });
}

test("dark theme passes axe too", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectNoSeriousA11yIssues(page);
  await page.goto("/en/design-system");
  await expectNoSeriousA11yIssues(page);
  await context.close();
});

test("language switch keeps the same page, including localized params", async ({ page }) => {
  await page.goto("/de/test/schnell/4");
  await page.getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL(/\/fr\/test\/rapide\/4$/);
  await page.goto("/en/results");
  await page.getByRole("link", { name: "Deutsch" }).click();
  await expect(page).toHaveURL(/\/de\/ergebnisse$/);
});

test("mode card leads to the first question of that mode", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: /Quick/ }).first().click();
  await expect(page).toHaveURL(/\/en\/test\/quick\/1$/);
});

test("theme choice persists without any cookie", async ({ page, context }) => {
  await page.goto("/en");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  await page.getByRole("button", { name: /light and dark/ }).click();
  const after = before === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", after);
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after);
  expect(await context.cookies()).toEqual([]);
});

test("unknown pages show the localized 404", async ({ page }) => {
  const response = await page.goto("/de/gibt-es-nicht");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Diese Seite gibt es nicht");
});

test("design system page passes axe", async ({ page }) => {
  await page.goto("/en/design-system");
  await expectNoSeriousA11yIssues(page);
});
