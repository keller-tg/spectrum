import { expect, test } from "@playwright/test";

/**
 * Regression for the lost theme toggle: switching language remounts the root
 * layout, and React 19 strips every attribute it does not own from <html>.
 * Preferences (theme, control style) must survive every locale pair in both
 * directions, without a reload, and focus must land on the new language.
 */
const LOCALES = [
  { code: "en", name: "English", method: "/en/method", theme: "Theme", dark: "Dark" },
  { code: "de", name: "Deutsch", method: "/de/methode", theme: "Design", dark: "Dunkel" },
  { code: "fr", name: "Français", method: "/fr/methode", theme: "Thème", dark: "Sombre" },
] as const;

for (const from of LOCALES)
  for (const to of LOCALES) {
    if (from.code === to.code) continue;
    test(`${from.code} → ${to.code} keeps theme, control style, lang and focus`, async ({
      page,
      isMobile,
    }) => {
      await page.addInitScript(() => localStorage.setItem("spectrum-controls", "pill"));
      await page.goto(from.method);
      const html = page.locator("html");
      const before = await html.getAttribute("data-theme");
      const target = before === "dark" ? "light" : "dark";
      await page.evaluate((t) => {
        localStorage.setItem("spectrum-theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, target);

      let navigations = 0;
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) navigations++;
      });
      const link = page.getByRole("link", { name: to.name });
      await link.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`^.*/${to.code}/`));

      await expect(html).toHaveAttribute("lang", to.code);
      await expect(html).toHaveAttribute("data-theme", target);
      await expect(html).toHaveAttribute("data-controls", "pill");
      await expect(page.locator(`link[rel="alternate"][hreflang="${from.code}"]`)).toHaveCount(1);
      // Soft navigation only: no document reload.
      expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(1);
      expect(navigations).toBeLessThanOrEqual(1);
      // Focus stays on the language switch, now on the chosen language.
      await expect(page.locator(":focus")).toHaveAttribute("hreflang", to.code);

      if (!isMobile) {
        const group = page.getByRole("radiogroup", { name: to.theme }).first();
        await expect(group).toBeVisible();
        const radio = group.getByRole("radio", { name: to.dark, exact: true });
        await expect(radio).toHaveAttribute("aria-checked", String(target === "dark"));
        // The toggle still works after the switch.
        await radio.click();
        await expect(html).toHaveAttribute("data-theme", "dark");
      }
    });
  }
