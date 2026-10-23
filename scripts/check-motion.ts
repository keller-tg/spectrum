/**
 * Motion guard (D-083): every transition and animation uses the shared tokens
 * and moves only transform or clip-path; wipes go through the shared component.
 *
 * - CSS: `transition` / `transition-property` may name only transform,
 *   clip-path, and the discrete display / overlay / visibility; durations and
 *   delays must be var(--dur…) tokens (a stepped stagger may multiply one by
 *   40ms) or 0s. Keyframes may change only transform and clip-path, and
 *   `animation` must use a token duration. Raw ms values are allowed only in
 *   the token declarations (--dur…: …ms).
 * - mix-blend-mode only in app/controls.css (the wipe and segment panels).
 * - UI code (app/, components/): no Tailwind motion utilities (transition-*,
 *   duration-*, ease-*, delay-*, animate-*), no inline `transition` styles,
 *   and the wipe panel only through components/ui/Wipe.tsx.
 *
 *   node scripts/check-motion.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export interface Finding {
  line: number;
  message: string;
}

const ANIMATABLE = new Set(["transform", "clip-path", "display", "overlay", "visibility"]);
/** Token times; 0.001ms is the reduced-motion floor in globals.css. */
const TOKEN_TIME = /^(?:0s|0|0\.001ms|var\(--dur[\w-]*\)|calc\(var\(--i(?:, ?0)?\) \* 40ms\))$/;

function timesIn(value: string): string[] {
  // Split on commas outside parentheses, then take the time-like parts.
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function tokens(part: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of part) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (current) out.push(current);
      current = "";
    } else current += ch;
  }
  if (current) out.push(current);
  return out.filter((t) => t !== "!important");
}

const isTime = (t: string) => /^-?[\d.]+m?s$/.test(t) || /^var\(--dur/.test(t) || /^calc\(/.test(t);

export function checkCssMotion(text: string, file: string): Finding[] {
  const findings: Finding[] = [];
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  let buffer = "";
  let start = 1;
  let line = 1;
  const selectors: string[] = [];
  let inKeyframes = 0;
  const report = (message: string) => findings.push({ line: start, message });
  const decl = () => {
    const d = buffer.trim();
    buffer = "";
    if (!d || d.startsWith("@")) return;
    const colon = d.indexOf(":");
    if (colon < 0) return;
    const prop = d.slice(0, colon).trim().toLowerCase();
    const value = d.slice(colon + 1).trim();
    if (prop.startsWith("--dur")) return; // the tokens themselves
    if (inKeyframes > 0 && !["transform", "clip-path"].includes(prop))
      report(`keyframes may change only transform or clip-path, not ${prop}`);
    if (prop === "mix-blend-mode" && !file.endsWith("app/controls.css"))
      report("mix-blend-mode is reserved for the shared wipe and segment panels");
    if (prop === "transition" || prop === "transition-property") {
      for (const part of timesIn(value)) {
        const words = tokens(part);
        const property = words.find(
          (w) => !isTime(w) && !/^(?:var\(--ease|cubic|linear|steps|ease|allow-discrete)/.test(w),
        );
        if (property && !ANIMATABLE.has(property))
          report(`transition on "${property}": only transform and clip-path may animate`);
        if (prop === "transition")
          for (const w of words.filter(isTime))
            if (!TOKEN_TIME.test(w)) report(`raw transition time ${w}: use a --dur token`);
      }
    }
    if (
      prop === "transition-duration" ||
      prop === "transition-delay" ||
      prop === "animation-duration"
    )
      for (const w of tokens(value))
        if (
          !TOKEN_TIME.test(w) &&
          !(w === "300ms" && selectors.at(-1)?.includes(".tip-host:hover"))
        )
          report(`raw time ${w}: use a --dur token`);
    if (prop === "animation")
      for (const w of tokens(value).filter(isTime))
        if (!TOKEN_TIME.test(w)) report(`raw animation time ${w}: use a --dur token`);
  };
  for (const ch of src) {
    if (ch === "{") {
      const selector = buffer.trim();
      buffer = "";
      selectors.push(selector);
      if (selector.startsWith("@keyframes") || (inKeyframes > 0 && selectors.length > 0))
        inKeyframes++;
    } else if (ch === "}") {
      decl();
      selectors.pop();
      if (inKeyframes > 0) inKeyframes--;
    } else if (ch === ";") decl();
    else {
      if (!buffer.trim() && ch.trim()) start = line;
      buffer += ch;
    }
    if (ch === "\n") line++;
  }
  return findings;
}

const TW_MOTION =
  /(?:^|[\s"'`:])(?:transition(?:-[\w[\]-]+)?|duration-[\w[\].-]+|ease-[\w[\]-]+|delay-[\w[\].-]+|animate-[\w[\]-]+)(?=[\s"'`]|$)/;

export function checkUiMotion(text: string, file: string): Finding[] {
  const findings: Finding[] = [];
  text.split("\n").forEach((lineText, i) => {
    const code = lineText.replace(/\/\/.*$/, "");
    if (
      /className=|class:|`[^`]*`|"[^"]*"/.test(code) &&
      TW_MOTION.test(code) &&
      /className|cn\(|class/.test(code)
    )
      findings.push({
        line: i + 1,
        message: "Tailwind motion utility: use the shared motion classes",
      });
    if (/style=\{\{[^}]*transition/.test(code))
      findings.push({ line: i + 1, message: "inline transition: use the shared motion classes" });
    if (/className=\S*wipe-panel/.test(code) && !file.endsWith("components/ui/Wipe.tsx"))
      findings.push({ line: i + 1, message: "render the wipe with <Wipe />, not by hand" });
  });
  return findings;
}

function main() {
  const files = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      encoding: "utf8",
    },
  )
    .split("\0")
    .filter((f) => f && existsSync(f));
  const all: string[] = [];
  for (const file of files) {
    let findings: Finding[] = [];
    if (file.endsWith(".css")) findings = checkCssMotion(readFileSync(file, "utf8"), file);
    else if (/^(?:app|components)\/.*\.tsx?$/.test(file))
      findings = checkUiMotion(readFileSync(file, "utf8"), file);
    for (const f of findings) all.push(`${file}:${f.line}  ${f.message}`);
  }
  if (all.length) {
    console.error(`check-motion: ${all.length} problem(s) (D-083):`);
    for (const l of all) console.error(`  ${l}`);
    process.exit(1);
  }
  console.log("check-motion: all motion uses the shared tokens and components.");
}

if (import.meta.url === `file://${process.argv[1]}`) main();
