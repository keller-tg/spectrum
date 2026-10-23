import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { PALETTE } from "@/lib/design/tokens";

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
 * Runtime half of the palette guard (D-075): every rendered element and
 * pseudo-element uses only ink, paper or transparent, and nothing has a
 * shadow, rounded corner, opacity, filter or background image. Dithered
 * photos are exempt.
 */
async function expectOnlyInkAndPaper(page: Page) {
  const tokens = [PALETTE.light.ink, PALETTE.light.paper, "transparent"];
  const problems = await page.evaluate((values) => {
    const probe = document.createElement("div");
    document.body.append(probe);
    const resolve = (value: string) => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };
    const allowed = new Set(values.map(resolve));
    probe.remove();
    const paintOk = (v: string) => v === "none" || v.startsWith("url(") || allowed.has(v);
    const out: string[] = [];
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${String(el.getAttribute("class") ?? "").slice(0, 60)}`;
    for (const el of document.querySelectorAll("body *")) {
      if (el.matches("img.dithered, script, style, template")) continue;
      for (const pseudo of [null, "::before", "::after"] as const) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && cs.content === "none") continue;
        const colours = {
          color: cs.color,
          background: cs.backgroundColor,
          borderTop: cs.borderTopColor,
          borderRight: cs.borderRightColor,
          borderBottom: cs.borderBottomColor,
          borderLeft: cs.borderLeftColor,
          outline: cs.outlineColor,
          decoration: cs.textDecorationColor,
        };
        for (const [k, v] of Object.entries(colours))
          if (!allowed.has(v)) out.push(`${describe(el)}${pseudo ?? ""} ${k}=${v}`);
        if (el instanceof SVGElement && !(paintOk(cs.fill) && paintOk(cs.stroke)))
          out.push(`${describe(el)} fill=${cs.fill} stroke=${cs.stroke}`);
        const effects = {
          boxShadow: cs.boxShadow,
          textShadow: cs.textShadow,
          filter: cs.filter,
          backdropFilter: cs.backdropFilter,
          backgroundImage: cs.backgroundImage,
        };
        for (const [k, v] of Object.entries(effects))
          if (v !== "none" && v !== "") out.push(`${describe(el)}${pseudo ?? ""} ${k}=${v}`);
        if (cs.opacity !== "1") out.push(`${describe(el)} opacity=${cs.opacity}`);
        for (const r of [
          cs.borderTopLeftRadius,
          cs.borderTopRightRadius,
          cs.borderBottomLeftRadius,
          cs.borderBottomRightRadius,
        ])
          if (r !== "0px") out.push(`${describe(el)} radius=${r}`);
      }
    }
    return [...new Set(out)].slice(0, 25);
  }, tokens);
  expect(problems).toEqual([]);
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

test("the landing page fits one screen", async ({ page }) => {
  await page.goto("/en");
  const table = page.getByRole("table");
  const box = await table.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.y + box.height).toBeLessThanOrEqual(viewport?.height ?? 0);
});

test("no page scrolls sideways", async ({ page }) => {
  for (const path of ["/en", "/fr", "/en/method", "/en/test", "/fr/guide-de-style"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`only ink and paper are rendered (${scheme})`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    for (const path of ["/en", "/en/method", "/en/styleguide"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await expectOnlyInkAndPaper(page);
    }
    await context.close();
  });
}

test("dark theme passes axe too", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectNoSeriousA11yIssues(page);
  await page.goto("/en/styleguide");
  await expectNoSeriousA11yIssues(page);
  await context.close();
});

test("styleguide passes axe and is not indexed", async ({ page }) => {
  await page.goto("/en/styleguide");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expectNoSeriousA11yIssues(page);
});

test("language switch keeps the same page, including localized params", async ({ page }) => {
  await page.goto("/de/test/schnell/4");
  await page.getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL(/\/fr\/test\/rapide\/4$/);
  await page.goto("/en/results");
  await page.getByRole("link", { name: "Deutsch" }).click();
  await expect(page).toHaveURL(/\/de\/ergebnisse$/);
});

test("a mode row leads to the first question of that mode", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: /Quick/ }).first().click();
  await expect(page).toHaveURL(/\/en\/test\/quick\/1$/);
});

test("hover inverts a mode row; keyboard focus draws a 3px outline", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover needs a pointer");
  await page.goto("/en");
  const row = page.getByRole("row", { name: /Quick/ });
  const ink = await page.evaluate(() => getComputedStyle(document.documentElement).color);
  await row.hover();
  await expect(row).toHaveCSS("background-color", ink);
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus-visible");
  await expect(focused).toHaveCSS("outline-width", "3px");
  await expect(focused).toHaveCSS("outline-offset", "3px");
});

test("theme choice persists without any cookie", async ({ page, context }) => {
  await page.goto("/en");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  const target = before === "dark" ? "Light" : "Dark";
  const visible = page.locator("button:visible", { hasText: new RegExp(`^${target}$`, "i") });
  if ((await visible.count()) === 0) await page.locator("summary").click();
  await visible.first().click();
  const after = before === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", after);
  await expect(visible.first()).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after);
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
    "content",
    PALETTE[after].paper,
  );
  expect(await context.cookies()).toEqual([]);
});

test("unknown pages show the localized 404", async ({ page }) => {
  const response = await page.goto("/de/gibt-es-nicht");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Diese Seite gibt es nicht");
});
