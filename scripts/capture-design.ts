/**
 * Design review captures (D-081) into docs/design/:
 * - both home variants, light and dark, at 390/768/1440/1920px (full page,
 *   reduced motion so the hero field is the static snapshot);
 * - one WebM per control style (sharp, pill, offset) of hover, press and
 *   focus on buttons, segmented controls, answer rows, mode rows and the field.
 * Needs a running server: BASE_URL (default http://localhost:3210).
 *
 *   npm run build && npx next start -p 3210 & npm run design:capture
 */
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const OUT = "docs/design";
const WIDTHS = [390, 768, 1440, 1920] as const;
const VARIANTS = ["home-a", "home-b"] as const;
const SCHEMES = ["light", "dark"] as const;
const STYLES = ["sharp", "pill", "offset"] as const;

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

async function glide(page: Page, selector: string, hold = 700) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await pause(page, hold);
}

async function press(page: Page, selector: string) {
  await glide(page, selector, 400);
  await page.mouse.down();
  await pause(page, 260);
  await page.mouse.up();
  await pause(page, 600);
}

async function screenshots() {
  const browser = await chromium.launch();
  for (const variant of VARIANTS)
    for (const scheme of SCHEMES)
      for (const width of WIDTHS) {
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 900 },
          colorScheme: scheme,
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await page.goto(`${BASE}/en/styleguide/${variant}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const png = await page.screenshot({ fullPage: true });
        // A 16-colour palette keeps anti-aliased text crisp at a fraction of the size.
        await sharp(png)
          .png({ palette: true, colours: 16, compressionLevel: 9 })
          .toFile(`${OUT}/${variant}-${scheme}-${width}.png`);
        await context.close();
        console.log(`capture: ${variant} ${scheme} ${width}`);
      }
  await browser.close();
}

async function recordings() {
  const browser = await chromium.launch();
  for (const style of STYLES) {
    const dir = `${OUT}/.video-${style}`;
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir, size: { width: 1280, height: 800 } },
    });
    await context.addInitScript((s) => localStorage.setItem("spectrum-controls", s), style);
    const page = await context.newPage();

    // Buttons: hover, press, then keyboard focus.
    await page.goto(`${BASE}/en/styleguide/buttons`, { waitUntil: "networkidle" });
    await pause(page, 600);
    const rest = (variant: string, row: number) =>
      `section[aria-labelledby="matrix-${variant}"] tbody tr:nth-child(${row}) td:nth-child(2) .btn`;
    await glide(page, rest("primary", 3));
    await glide(page, rest("secondary", 3));
    await glide(page, rest("text", 3));
    await press(page, rest("primary", 2));
    await press(page, rest("secondary", 2));
    await page.mouse.move(5, 5);
    await page.locator(rest("primary", 1)).focus();
    for (let i = 0; i < 4; i++) {
      await pause(page, 450);
      await page.keyboard.press("Tab");
    }
    await pause(page, 500);

    // Segmented controls, answer rows and the live loading → success sequence.
    await page.goto(`${BASE}/en/styleguide#sg-segmented`, { waitUntil: "networkidle" });
    await pause(page, 400);
    // The light frame is a div; <html> carries data-theme too.
    const seg = 'div[data-theme="light"] [role="radiogroup"].seg';
    await press(page, `${seg} >> nth=0 >> [role=radio] >> nth=0`);
    await press(page, `${seg} >> nth=0 >> [role=radio] >> nth=2`);
    await press(page, `${seg} >> nth=1 >> [role=radio] >> nth=3`);
    await page.keyboard.press("ArrowLeft");
    await pause(page, 500);
    await page.keyboard.press("ArrowLeft");
    await pause(page, 500);
    const answers = 'div[data-theme="light"] .answer-row';
    await glide(page, `${answers} >> nth=4`);
    await press(page, `${answers} >> nth=3`);
    await press(page, `${answers} >> nth=0`);
    await press(page, 'div[data-theme="light"] button.btn:has-text("Save result")');
    await pause(page, 3000);

    // Mode rows and the hero field.
    await page.goto(`${BASE}/en/styleguide/home-a`, { waitUntil: "networkidle" });
    await pause(page, 500);
    await glide(page, ".mode-row >> nth=0");
    await glide(page, ".mode-row >> nth=1");
    await page.mouse.move(5, 5, { steps: 8 });
    const field = await page.locator('[role="group"][aria-label^="Catalog map"]').boundingBox();
    if (field) {
      for (const [fx, fy] of [
        [0.3, 0.4],
        [0.5, 0.55],
        [0.7, 0.45],
        [0.6, 0.7],
      ] as const) {
        await page.mouse.move(field.x + field.width * fx, field.y + field.height * fy, {
          steps: 14,
        });
        await pause(page, 500);
      }
    }
    await pause(page, 600);

    const video = page.video();
    await context.close();
    const path = await video?.path();
    if (path) renameSync(path, `${OUT}/controls-${style}.webm`);
    rmSync(dir, { recursive: true, force: true });
    console.log(`capture: controls-${style}.webm`);
  }
  await browser.close();
}

mkdirSync(OUT, { recursive: true });
await screenshots();
await recordings();
