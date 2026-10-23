import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { checkClassTokens, checkCss, checkSource, checkSvg } from "./check-palette";

const hasOldDesign = (() => {
  try {
    execFileSync("git", ["cat-file", "-e", "0ce76c6"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const tsx = (code: string) => checkSource(code, "components/X.tsx").map((f) => f.message);

describe("palette guard", () => {
  it("accepts the two tokens and nothing else in CSS", () => {
    expect(checkCss(":root { --ink: #000; --paper: #fff; }")).toEqual([]);
    expect(checkCss(":root { --ink: #111; }")).toHaveLength(1);
    expect(checkCss(".a { color: #f3ede0; }")).toHaveLength(1);
    expect(checkCss(".a { color: rgb(0 0 0 / 0.5); }")).toHaveLength(1);
    expect(checkCss(".a { background: linear-gradient(red, blue); }").length).toBeGreaterThan(0);
    expect(checkCss(".a { color: grey; }")).toHaveLength(1);
    expect(checkCss(".a { outline: 3px solid Highlight; }")).toHaveLength(1);
  });

  it("rejects shadows, radius, opacity and filters in CSS", () => {
    expect(checkCss(".a { box-shadow: 0 1px 0 var(--ink); }")).toHaveLength(1);
    expect(checkCss(".a { border-radius: 2px; }")).toHaveLength(1);
    expect(checkCss(".a { opacity: 0.5; }")).toHaveLength(1);
    expect(checkCss(".a { backdrop-filter: blur(4px); }")).toHaveLength(1);
    expect(checkCss(".a { box-shadow: none; border-radius: 0; opacity: 1; }")).toEqual([]);
    expect(checkCss(".btn { border-radius: var(--radius-control); }")).toEqual([]);
    expect(checkCss(".btn { border-radius: var(--radius-big); }")).toHaveLength(1);
  });

  it("ignores comments and property names that contain colour words", () => {
    expect(checkCss("/* was #a3191f, red */ .a { white-space: nowrap; }")).toEqual([]);
  });

  it("rejects Tailwind utilities outside ink and paper", () => {
    for (const bad of [
      "bg-red-500",
      "hover:text-white",
      "bg-ink/50",
      "md:border-paper/20",
      "opacity-80",
      "shadow-lg",
      "rounded-full",
      "backdrop-blur-sm",
      "bg-linear-to-r",
      "text-[red]",
    ])
      expect(checkClassTokens(bad), bad).toHaveLength(1);
    for (const good of [
      "bg-ink",
      "hover:bg-paper",
      "text-ink",
      "border-2",
      "rounded-none",
      "shadow-none",
      "opacity-100",
      "text-[0.9375rem]",
      "[border-bottom-style:dashed]",
      "aria-[current=page]:bg-ink",
    ])
      expect(checkClassTokens(good), good).toEqual([]);
  });

  it("checks SVG paint, opacity and gradients in TSX", () => {
    expect(tsx(`<path fill="currentColor" stroke="var(--ink)" />`)).toEqual([]);
    expect(tsx("<rect fill={`url(#${id}-hatch)`} />")).toEqual([]);
    expect(tsx(`<path fill="red" />`)).toHaveLength(1);
    expect(tsx(`<path fill="var(--accent)" />`)).toHaveLength(1);
    expect(tsx(`<g opacity="0.5" />`)).toHaveLength(1);
    expect(tsx(`<radialGradient id="g" />`)).toHaveLength(1);
    expect(tsx(`<div style={{ backgroundColor: "#a3191f" }} />`).length).toBeGreaterThan(0);
    expect(tsx(`<div style={{ opacity: 0.4 }} />`)).toHaveLength(1);
  });

  it("allows colour literals only in token files", () => {
    expect(checkSource(`export const A = "#000";`, "lib/x.ts")).toHaveLength(1);
    expect(checkSource(`export const A = "#000";`, "lib/design/tokens.ts", true)).toEqual([]);
    expect(checkSource(`export const A = "#123";`, "lib/design/tokens.ts", true)).toHaveLength(1);
    expect(checkSvg(`<rect fill="#000"/>`, true)).toEqual([]);
    expect(checkSvg(`<rect fill="#a3191f"/>`, true)).toHaveLength(1);
  });

  it.skipIf(!hasOldDesign)("would have failed the previous cream, green and red design", () => {
    const old = (path: string) =>
      execFileSync("git", ["show", `0ce76c6:${path}`], { encoding: "utf8" });
    expect(checkCss(old("app/globals.css")).length).toBeGreaterThan(20);
    expect(
      checkSource(old("components/home/HeroDial.tsx"), "components/home/HeroDial.tsx").length,
    ).toBeGreaterThan(3);
  });
});
