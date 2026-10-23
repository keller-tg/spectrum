import { expect, test, type Page } from "@playwright/test";

/**
 * Frame timing under a 4× CPU slowdown (D-090): while the pointer hovers,
 * presses and wipes across rows and buttons, p95 frame time stays under 20 ms
 * and no single frame takes longer than 50 ms. Chromium only (CDP throttling).
 */

async function startFrames(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __frames: number[]; __run: boolean };
    w.__frames = [];
    w.__run = true;
    let last = performance.now();
    const tick = (now: number) => {
      w.__frames.push(now - last);
      last = now;
      if (w.__run) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function stopFrames(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const w = window as unknown as { __frames: number[]; __run: boolean };
    w.__run = false;
    // The first delta spans the evaluate round trip, not a rendered frame.
    return w.__frames.slice(1);
  });
}

async function sweep(page: Page, selector: string, { press = false } = {}) {
  const targets = page.locator(selector);
  const count = await targets.count();
  for (let i = 0; i < count; i++) {
    const box = await targets.nth(i).boundingBox();
    if (!box) continue;
    // Enter from alternating sides, so the wipe direction changes too.
    const fromLeft = i % 2 === 0;
    await page.mouse.move(fromLeft ? box.x - 20 : box.x + box.width + 20, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
    if (press) {
      await page.mouse.down();
      await page.waitForTimeout(80);
      await page.mouse.up();
    }
    await page.waitForTimeout(260);
  }
  await page.mouse.move(2, 2, { steps: 4 });
  await page.waitForTimeout(300);
}

function summarise(frames: number[]) {
  const sorted = [...frames].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
  return { n: sorted.length, median: at(0.5), p95: at(0.95), max: sorted.at(-1) ?? 0 };
}

test("hover, press and wipe stay smooth at 4× CPU slowdown", async ({
  page,
  browserName,
}, info) => {
  test.skip(
    info.project.name !== "desktop" || browserName !== "chromium",
    "CDP throttling, fine pointer",
  );
  test.setTimeout(120_000);
  const cdp = await page.context().newCDPSession(page);

  // Home: mode rows (row wipes) and the primary buttons.
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await page.locator(".mode-row").first().scrollIntoViewIfNeeded();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await startFrames(page);
  await sweep(page, ".mode-row");
  const home = summarise(await stopFrames(page));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  // Test screen: answer rows hovered and pressed (selection wipe), without advancing.
  await page.goto("/en/test/quick/1");
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await startFrames(page);
  await sweep(page, ".answer-row", { press: true });
  await sweep(page, ".btn");
  const test_ = summarise(await stopFrames(page));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  test.info().annotations.push({
    type: "frames",
    description: JSON.stringify({ home, test: test_ }),
  });
  console.log("frames", JSON.stringify({ home, test: test_ }));
  for (const [name, s] of Object.entries({ home, test: test_ })) {
    expect(s.n, name).toBeGreaterThan(60);
    expect(s.p95, `${name} p95`).toBeLessThan(20);
    expect(s.max, `${name} max`).toBeLessThanOrEqual(50);
  }
});
