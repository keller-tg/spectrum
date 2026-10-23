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

/** Elements that may round in the pill control style (D-080). */
const CONTROL_SELECTOR =
  ".btn, .btn-face, .wipe, .seg, .seg-opt, .seg-ind, .seg-ind > span, .field-input, .tag";

/**
 * Runtime half of the palette guard (D-075): every rendered element and
 * pseudo-element uses only ink, paper or transparent at rest, and nothing has
 * a shadow, opacity, filter or background image. Corners are square, except
 * controls in the pill style. Dithered photos are exempt.
 */
async function expectOnlyInkAndPaper(page: Page, { pill = false } = {}) {
  const tokens = [PALETTE.light.ink, PALETTE.light.paper, "transparent"];
  const problems = await page.evaluate(
    ({ values, pill, controls }) => {
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
          const roundOk = pill && !pseudo && el.matches(controls);
          for (const r of [
            cs.borderTopLeftRadius,
            cs.borderTopRightRadius,
            cs.borderBottomLeftRadius,
            cs.borderBottomRightRadius,
          ])
            if (r !== "0px" && !roundOk) out.push(`${describe(el)}${pseudo ?? ""} radius=${r}`);
        }
      }
      return [...new Set(out)].slice(0, 25);
    },
    { values: tokens, pill, controls: CONTROL_SELECTOR },
  );
  expect(problems).toEqual([]);
}

const REVIEW_PAGES = [
  "/en",
  "/en/method",
  "/en/styleguide",
  "/en/styleguide/buttons",
  "/en/styleguide/screens",
  "/en/styleguide/home-a",
  "/en/styleguide/home-b",
];

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

test("no page scrolls sideways", async ({ page }) => {
  for (const path of [
    "/en",
    "/fr",
    "/en/method",
    "/en/test",
    "/fr/guide-de-style",
    "/de/styleguide/home-a",
    "/fr/guide-de-style/accueil-b",
    "/de/styleguide/screens",
  ]) {
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
    for (const path of REVIEW_PAGES) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await expectOnlyInkAndPaper(page);
    }
    await context.close();
  });

  test(`every review page passes axe (${scheme})`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    for (const path of REVIEW_PAGES.slice(2)) {
      await page.goto(path);
      await expectNoSeriousA11yIssues(page);
    }
    await context.close();
  });
}

test("pill and offset styles stay within ink and paper", async ({ browser }) => {
  for (const style of ["pill", "offset"] as const) {
    const context = await browser.newContext();
    await context.addInitScript((s) => localStorage.setItem("spectrum-controls", s), style);
    const page = await context.newPage();
    for (const path of ["/en/styleguide/buttons", "/en/styleguide/home-b"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-controls", style);
      await expectOnlyInkAndPaper(page, { pill: style === "pill" });
    }
    await context.close();
  }
});

test("dark theme passes axe too", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
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

test("hover wipes a mode row in; keyboard focus draws a 2px ring", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover needs a fine pointer");
  await page.goto("/en");
  const row = page.getByRole("link", { name: /Quick/ });
  const panel = row.locator(".wipe-panel");
  await expect(panel).toHaveCSS("transform", /^matrix\(1, 0, 0, 1, -/);
  await row.hover();
  await expect(panel).toHaveCSS("transform", "none");
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus-visible");
  await expect(focused).toHaveCSS("outline-width", "2px");
  await expect(focused).toHaveCSS("outline-offset", "3px");
});

test("the wipe follows the pointer's side and never sticks (D-083)", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover needs a fine pointer");
  await page.goto("/en");
  const row = page.getByRole("link", { name: /Standard/ });
  const panel = row.locator(".wipe-panel");
  const box = (await row.boundingBox())!;
  const y = box.y + box.height / 2;
  // Enter from the right: the panel starts on the right.
  await page.mouse.move(box.x + box.width + 20, y);
  await page.mouse.move(box.x + box.width - 10, y);
  await expect(row).toHaveAttribute("data-wipe-from", "right");
  await expect(panel).toHaveCSS("transform", "none");
  // Leave to the left: it goes out to the left.
  await page.mouse.move(box.x - 20, y);
  await expect(row).toHaveAttribute("data-wipe-from", "left");
  await expect(panel).toHaveCSS("transform", /^matrix\(1, 0, 0, 1, -/);
  // Rapid in and out ends at rest, closed.
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(box.x + 30, y);
    await page.mouse.move(box.x + 30, box.y - 30);
  }
  await expect(row).not.toHaveAttribute("data-wipe-in", "");
  await expect
    .poll(() => panel.evaluate((el) => el.getAnimations().length), { timeout: 2000 })
    .toBe(0);
  const x = await panel.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(Math.abs(x)).toBeGreaterThan(box.width);
  // Keyboard focus wipes too.
  await row.focus();
  await expect(panel).toHaveCSS("transform", "none");
});

test("reduced motion turns wipes into instant inverts", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/styleguide/buttons");
  const durations = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return [cs.getPropertyValue("--dur").trim(), cs.getPropertyValue("--dur-fast").trim()];
  });
  expect(durations).toEqual(["0s", "0s"]);
  await context.close();
});

test("core content works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/styleguide/home-a");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/one line/);
  await expect(page.locator("figure svg[role=img]").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Quick/ })).toBeVisible();
  await expect(page.locator("[id^=idx-]").first()).toBeAttached();
  await context.close();
});

test("the hero field steps through ideologies from the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow");
  await page.goto("/en/styleguide/home-a");
  const field = page.getByRole("group", { name: /Catalog map/ });
  await field.focus();
  await page.keyboard.press("ArrowRight");
  await expect(field.getByText(/Nearest:/)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#idx-/);
});

test("theme choice persists without any cookie", async ({ page, context }) => {
  await page.goto("/en");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  const target = before === "dark" ? "Light" : "Dark";
  const radio = page.getByRole("radio", { name: target, exact: true }).locator("visible=true");
  if ((await radio.count()) === 0) await page.getByRole("button", { name: "Menu" }).click();
  await radio.first().click();
  const after = before === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", after);
  await expect(radio.first()).toHaveAttribute("aria-checked", "true");
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
