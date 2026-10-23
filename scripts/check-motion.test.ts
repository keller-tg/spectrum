import { describe, expect, it } from "vitest";
import { checkCssMotion, checkUiMotion } from "./check-motion";

const css = (text: string, file = "app/other.css") =>
  checkCssMotion(text, file).map((f) => f.message);
const ui = (text: string, file = "components/X.tsx") =>
  checkUiMotion(text, file).map((f) => f.message);

describe("motion guard", () => {
  it("accepts token-driven transform and clip-path transitions", () => {
    expect(css(".a { transition: transform var(--dur) var(--ease-out); }")).toEqual([]);
    expect(
      css(
        ".a { transition: clip-path var(--dur-fast) linear, display var(--dur) allow-discrete; }",
      ),
    ).toEqual([]);
    expect(css(".a { transition-delay: calc(var(--i, 0) * 40ms); }")).toEqual([]);
    expect(css(":root { --dur-wipe: 200ms; }")).toEqual([]);
  });

  it("rejects layout and paint properties and raw durations", () => {
    expect(css(".a { transition: width 200ms ease; }")).toHaveLength(2);
    expect(css(".a { transition: background-color var(--dur) ease; }")).toHaveLength(1);
    expect(css(".a { transition: transform 300ms ease; }")).toHaveLength(1);
    expect(css(".a { animation: spin 2s linear infinite; }")).toHaveLength(1);
    expect(css("@keyframes x { from { opacity: 0 } to { opacity: 1 } }")).toHaveLength(2);
  });

  it("keeps blend modes in the shared controls", () => {
    expect(css(".a { mix-blend-mode: difference; }")).toHaveLength(1);
    expect(css(".a { mix-blend-mode: difference; }", "app/controls.css")).toEqual([]);
  });

  it("rejects ad-hoc motion in components", () => {
    expect(ui('<div className="transition-colors duration-300" />')).toHaveLength(1);
    expect(ui("<div style={{ transition: 'all 1s' }} />")).toHaveLength(1);
    expect(ui('<span className="wipe-panel" />')).toHaveLength(1);
    expect(ui('<span className="wipe-panel" />', "components/ui/Wipe.tsx")).toEqual([]);
    expect(ui('<div className="border-2 px-4" />')).toEqual([]);
  });
});
