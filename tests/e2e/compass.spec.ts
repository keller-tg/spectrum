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

const plot = (page: Page) => page.getByRole("group", { name: /^Compass\. Arrow keys/ });

test("the compass renders the catalog without JavaScript-only content", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/compass");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compass");
  // 53 markers, server-rendered.
  await expect(page.locator("#compass-desc")).toContainText("53 ideologies");
  await expect(page.locator("figure svg g.cmp-move")).toHaveCount(53);
  await context.close();
});

test("arrow keys step through ideologies and announce them", async ({ page }) => {
  await page.goto("/en/compass");
  await plot(page).focus();
  await page.keyboard.press("ArrowRight");
  const live = page.locator("figure [aria-live=polite]").first();
  await expect(live).toContainText(/^.+, [A-Z]{1,2}: PC1 [−+0]/);
  const first = await live.textContent();
  await page.keyboard.press("ArrowRight");
  await expect(live).not.toHaveText(first ?? "");
  await page.keyboard.press("Escape");
  await expect(live).toHaveText("");
});

test("the axis picker changes the view; picking the other axis swaps them", async ({ page }) => {
  await page.goto("/en/compass");
  await page.getByRole("radio", { name: "Two axes" }).click();
  const x = page.getByLabel("Horizontal (X)");
  const y = page.getByLabel("Vertical (Y)");
  await expect(x).toHaveValue("axis:distribution");
  await expect(y).toHaveValue("axis:liberty");
  await expect(page.locator("figure [aria-live=polite]").first()).toContainText("Showing");
  await y.selectOption("index:economic");
  await expect(page.locator("figcaption").first()).toContainText("Y: Economic index");
  await x.selectOption("index:economic");
  await expect(x).toHaveValue("index:economic");
  await expect(y).toHaveValue("axis:distribution");
  await expectNoSeriousA11yIssues(page);
});

test("the table alternative lists every entry with both values", async ({ page }) => {
  await page.goto("/en/compass");
  await page.getByText("View as table (53)").click();
  const rows = page.locator("#compass-table-caption").locator("xpath=..").locator("tbody tr");
  await expect(rows).toHaveCount(53);
  await expect(rows.first().locator("th, td")).toHaveCount(4);
});

test("a view change glides smoothly at 4× CPU slowdown", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "frame timing is measured on desktop (CDP)");
  await page.goto("/en/compass");
  await page.getByRole("radio", { name: "Two axes" }).click();
  await page.waitForTimeout(600);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const frames = await page.evaluate(async () => {
    const select = document.querySelector<HTMLSelectElement>("#compass-y");
    if (!select) return [];
    const times: number[] = [];
    let last = performance.now();
    let running = true;
    const tick = (now: number) => {
      times.push(now - last);
      last = now;
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Let the loop settle, then change the view and record the glide.
    await new Promise((r) => setTimeout(r, 200));
    const start = times.length;
    select.value = "axis:tradition";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 800));
    running = false;
    return times.slice(start);
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  expect(frames.length).toBeGreaterThan(20);
  const sorted = [...frames].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  console.log("compass frames", JSON.stringify({ n: sorted.length, p95, max: sorted.at(-1) }));
  // The change itself (React commit + density recompute) is allowed one frame up to 50 ms.
  expect(p95).toBeLessThan(20);
  expect(sorted.at(-1) ?? 0).toBeLessThanOrEqual(50);
});

test("the compass fits 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/en/compass", "/de/kompass", "/fr/boussole"]) {
    await page.goto(path);
    await page.getByRole("radio").nth(1).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
