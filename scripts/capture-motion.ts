/**
 * Motion audit (D-083): records the wipe interactions at quarter speed and
 * measures them with a Chrome trace: frame durations, layout and paint work
 * during the interaction. Needs a running server (BASE_URL, default
 * http://localhost:3210).
 *
 *   npx tsx scripts/capture-motion.ts <name>   → docs/design/motion-<name>.webm + stats
 */
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { chromium, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const OUT = "docs/design";
const name = process.argv[2] ?? "current";

async function sweep(page: Page, selector: string, from: "left" | "right", to: "left" | "right") {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  const y = box.y + box.height / 2;
  const side = (s: "left" | "right") => (s === "left" ? box.x - 30 : box.x + box.width + 30);
  await page.mouse.move(side(from), y);
  await page.mouse.move(box.x + box.width / 2, y, { steps: 6 });
  await page.waitForTimeout(1600);
  await page.mouse.move(side(to), y, { steps: 6 });
  await page.waitForTimeout(1600);
}

async function interactions(page: Page) {
  await page.goto(`${BASE}/en/styleguide/home-a`, { waitUntil: "networkidle" });
  await page.locator(".mode-row").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await sweep(page, ".mode-row >> nth=0", "left", "right");
  await sweep(page, ".mode-row >> nth=1", "right", "left");
  // Rapid in/out: must never stick half-way.
  const box = await page.locator(".mode-row").first().boundingBox();
  if (box)
    for (let i = 0; i < 4; i++) {
      await page.mouse.move(box.x + 40, box.y + box.height / 2);
      await page.waitForTimeout(60);
      await page.mouse.move(box.x + 40, box.y - 40);
      await page.waitForTimeout(60);
    }
  await page.waitForTimeout(1600);
  await page.goto(`${BASE}/en/styleguide/buttons`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const rest =
    'section[aria-labelledby="matrix-primary"] tbody tr:nth-child(3) td:nth-child(2) .btn';
  await sweep(page, rest, "left", "right");
  await sweep(page, rest.replace("primary", "secondary"), "right", "left");
  await page.locator(rest).focus();
  await page.waitForTimeout(1200);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1600);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // 1. Recording at quarter speed, so the motion can be judged.
  const dir = `${OUT}/.video-${name}`;
  const recorded = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir, size: { width: 1280, height: 800 } },
  });
  const page = await recorded.newPage();
  const cdp = await recorded.newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.25 });
  await interactions(page);
  const video = page.video();
  await recorded.close();
  const path = await video?.path();
  if (path) renameSync(path, `${OUT}/motion-${name}.webm`);
  rmSync(dir, { recursive: true, force: true });

  // 2. Trace at normal speed.
  const traced = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const tpage = await traced.newPage();
  await tpage.goto(`${BASE}/en/styleguide/home-a`, { waitUntil: "networkidle" });
  await tpage.locator(".mode-row").first().scrollIntoViewIfNeeded();
  await tpage.waitForTimeout(500);
  await browser.startTracing(tpage, {
    categories: ["devtools.timeline", "disabled-by-default-devtools.timeline.frame"],
  });
  const row = await tpage.locator(".mode-row").first().boundingBox();
  if (row) {
    const y = row.y + row.height / 2;
    await tpage.mouse.move(row.x - 20, y);
    await tpage.mouse.move(row.x + row.width / 2, y, { steps: 4 });
    await tpage.waitForTimeout(700);
    await tpage.mouse.move(row.x + row.width + 20, y, { steps: 4 });
    await tpage.waitForTimeout(700);
  }
  const trace = JSON.parse((await browser.stopTracing()).toString()) as {
    traceEvents: { name: string; dur?: number; ph: string; ts: number }[];
  };
  await traced.close();
  await browser.close();

  const events = trace.traceEvents;
  const count = (n: string) => events.filter((e) => e.name === n).length;
  const frames = events
    .filter((e) => e.name === "DrawFrame" || e.name === "BeginFrame")
    .map((e) => e.ts)
    .sort((a, b) => a - b);
  const gaps = frames.slice(1).map((t, i) => (t - (frames[i] as number)) / 1000);
  const longest = (n: string) =>
    Math.max(
      0,
      ...events.filter((e) => e.name === n && e.dur).map((e) => (e.dur as number) / 1000),
    );
  console.log(
    JSON.stringify(
      {
        name,
        layouts: count("Layout"),
        paints: count("Paint"),
        styleRecalcs: count("UpdateLayoutTree"),
        longestLayoutMs: longest("Layout").toFixed(2),
        longestPaintMs: longest("Paint").toFixed(2),
        frames: frames.length,
        longestFrameGapMs: Math.max(0, ...gaps).toFixed(1),
      },
      null,
      1,
    ),
  );
}

await main();
