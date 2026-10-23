/**
 * Palette guard (D-075). Fails on any colour other than the two tokens, and on
 * the effects the design bans with them: opacity, shadows, rounded corners,
 * blur and other filters, gradients.
 *
 * - CSS: colour literals only as the value of an --ink or --paper declaration,
 *   and only #000 or #fff. No named colours, colour functions or gradients;
 *   box-shadow, text-shadow, filter and backdrop-filter must be none,
 *   border-radius 0, opacity 1.
 * - TS/TSX/JS: every string literal is checked for colour literals; in UI code
 *   (app/, components/) also for Tailwind utilities outside the two-colour theme
 *   (palette colours, opacity modifiers, opacity-*, shadow-*, rounded-*, blur
 *   and filter utilities, gradients). SVG colour attributes and inline style colours may only be
 *   currentColor, none, transparent, inherit, var(--ink), var(--paper) or url(#…).
 *   Opacity attributes, gradient and blur elements are rejected outright.
 * - SVG files: colour literals only in the allowlisted favicon, #000 or #fff.
 * Photos (PNG/JPG) are exempt; dithered output is pure black and white anyway.
 * Comments are never checked, so prose about colour is fine.
 *
 *   node scripts/check-palette.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

/** Files whose colour literals define the tokens; values must still be #000 or #fff. */
const TOKEN_FILES = new Set(["lib/design/tokens.ts", "app/icon.svg"]);
/** The guard and its test spell out what they reject. */
const SKIP = new Set(["scripts/check-palette.ts", "scripts/check-palette.test.ts"]);
const TOKEN_VALUES = new Set(["#000", "#fff"]);

const NAMED = new Set(
  (
    "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet " +
    "brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan " +
    "darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta " +
    "darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue " +
    "darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey " +
    "dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray " +
    "green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush " +
    "lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray " +
    "lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray " +
    "lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon " +
    "mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue " +
    "mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin " +
    "navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen " +
    "paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple " +
    "rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna " +
    "silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle " +
    "tomato turquoise violet wheat white whitesmoke yellow yellowgreen " +
    // System colours (forced-colours keywords) are colours too.
    "accentcolor accentcolortext activetext buttonborder buttonface buttontext canvas canvastext " +
    "field fieldtext graytext highlight highlighttext linktext mark marktext selecteditem " +
    "selecteditemtext visitedtext"
  ).split(" "),
);

const HEX = /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const GRADIENT = /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(/i;
const ALLOWED_PAINT =
  /^(?:currentcolor|none|transparent|inherit|var\(--(?:ink|paper)\)|url\(#.*\))$/i;

const TW_PALETTE =
  "black|white|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const TW_COLOR_PREFIX =
  "bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|decoration|divide|accent|caret|placeholder|from|via|to|shadow|inset-shadow|drop-shadow|text-shadow";
const TW_BANNED: readonly [RegExp, string][] = [
  [
    new RegExp(`^(?:${TW_COLOR_PREFIX})-(?:${TW_PALETTE})(?:-\\d{2,3})?(?:/\\S+)?$`),
    "palette colour",
  ],
  [
    new RegExp(`^(?:${TW_COLOR_PREFIX})-(?:ink|paper|current|transparent)/\\S+$`),
    "opacity modifier",
  ],
  [/^opacity-(?!100$)\S+$/, "opacity"],
  [/^(?:inset-|drop-|text-)?shadow(?:-(?!none$)\S+)?$/, "shadow"],
  [/^rounded(?:-[a-z]{1,2})?(?:-(?!none$)\S+)?$/, "rounded corners"],
  [
    /^(?:backdrop-(?:blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|opacity)|blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia)(?:-\S+)?$/,
    "filter",
  ],
  [/^(?:bg-(?:linear|radial|conic|gradient)|from|via|to)-\S+$/, "gradient"],
];

const PAINT_ATTRS = new Set([
  "fill",
  "stroke",
  "stopColor",
  "floodColor",
  "lightingColor",
  "color",
]);
const BANNED_ATTRS = new Set([
  "opacity",
  "fillOpacity",
  "strokeOpacity",
  "stopOpacity",
  "floodOpacity",
  "filter",
]);
const BANNED_ELEMENTS = new Set([
  "linearGradient",
  "radialGradient",
  "feGaussianBlur",
  "feDropShadow",
  "filter",
]);
const STYLE_PAINT = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "outlineColor",
  "fill",
  "stroke",
  "textDecorationColor",
  "caretColor",
  "accentColor",
  "columnRuleColor",
]);
const STYLE_NONE = new Set([
  "boxShadow",
  "textShadow",
  "filter",
  "backdropFilter",
  "backgroundImage",
]);

export interface Finding {
  line: number;
  message: string;
}

/** Colour literals in a piece of text (hex, functions, gradients). */
function colourLiterals(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(HEX)) out.push(m[0]);
  if (COLOR_FN.test(text)) out.push((text.match(COLOR_FN) as RegExpMatchArray)[0]);
  if (GRADIENT.test(text)) out.push((text.match(GRADIENT) as RegExpMatchArray)[0]);
  return out;
}

const namedIn = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter((w) => NAMED.has(w));

/** Remove Tailwind variant prefixes (hover:, md:, [&_x]:) while respecting brackets. */
function utilityOf(token: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[") depth++;
    else if (c === "]") depth--;
    else if (c === ":" && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!/, "").replace(/^-/, "");
}

export function checkClassTokens(text: string): string[] {
  const out: string[] = [];
  for (const token of text.split(/\s+/)) {
    if (!token || token.length > 80) continue;
    const utility = utilityOf(token);
    for (const [re, what] of TW_BANNED) if (re.test(utility)) out.push(`${what}: ${token}`);
    const arbitrary = utility.match(/^[a-z-]+-\[([^\]]+)\]$/);
    if (arbitrary && namedIn(arbitrary[1] as string).length)
      out.push(`named colour in arbitrary value: ${token}`);
  }
  return out;
}

export function checkCss(text: string): Finding[] {
  const findings: Finding[] = [];
  // Blank out comments but keep line numbers.
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  let buffer = "";
  let bufferStart = 0;
  let line = 1;
  const flush = () => {
    const decl = buffer.trim();
    buffer = "";
    if (!decl || decl.startsWith("@")) return;
    const colon = decl.indexOf(":");
    if (colon < 0) return;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    const at = bufferStart;
    const report = (message: string) => findings.push({ line: at, message });
    const literals = colourLiterals(value);
    if (prop === "--ink" || prop === "--paper") {
      if (!TOKEN_VALUES.has(value.toLowerCase()))
        report(`${prop} must be #000 or #fff, not ${value}`);
      return;
    }
    for (const l of literals) report(`colour literal ${l} in ${prop}`);
    if (!value.startsWith("url(") && !/^["']/.test(value))
      for (const n of namedIn(value)) report(`named colour ${n} in ${prop}`);
    if (/^(?:box-shadow|text-shadow|filter|backdrop-filter)$/.test(prop) && value !== "none")
      report(`${prop} must be none`);
    if (/^border(?:-[a-z]+)*-radius$/.test(prop) && !/^0(?:px)?$/.test(value))
      report(`${prop} must be 0`);
    if (prop === "opacity" && value !== "1") report("opacity must be 1");
  };
  for (const ch of src) {
    if (ch === "{") {
      buffer = "";
    } else if (ch === ";" || ch === "}") {
      flush();
    } else {
      if (!buffer.trim() && ch.trim()) bufferStart = line;
      buffer += ch;
    }
    if (ch === "\n") line++;
  }
  return findings;
}

/** Tailwind classes only live in UI code; elsewhere a word like "rounded" is just prose. */
const UI_CODE = /^(?:app|components)\//;

export function checkSource(text: string, file: string, allowTokens = false): Finding[] {
  const findings: Finding[] = [];
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const lineOf = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const report = (node: ts.Node, message: string) => findings.push({ line: lineOf(node), message });
  const stringValue = (node: ts.Node | undefined): string | null => {
    if (!node) return null;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isJsxExpression(node)) return stringValue(node.expression);
    if (ts.isTemplateExpression(node))
      return node.head.text + node.templateSpans.map((span) => `x${span.literal.text}`).join("");
    return null;
  };

  const visit = (node: ts.Node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const text = node.text;
      for (const l of colourLiterals(text))
        if (!(allowTokens && TOKEN_VALUES.has(l.toLowerCase())))
          report(node, `colour literal ${l}`);
      if (UI_CODE.test(file)) for (const f of checkClassTokens(text)) report(node, f);
    }
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sf);
      if (BANNED_ATTRS.has(name)) report(node, `attribute ${name} is not allowed`);
      if (PAINT_ATTRS.has(name)) {
        const value = stringValue(node.initializer ?? undefined);
        if (value !== null && !ALLOWED_PAINT.test(value.trim()))
          report(node, `${name}="${value}" is not ink, paper or currentColor`);
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);
      if (BANNED_ELEMENTS.has(tag)) report(node, `<${tag}> is not allowed`);
    }
    if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.parent)) {
      const key = node.name.getText(sf).replace(/["']/g, "");
      const value = stringValue(node.initializer);
      if (value !== null) {
        if (STYLE_PAINT.has(key) && !ALLOWED_PAINT.test(value.trim()))
          report(node, `style ${key}: ${value} is not ink, paper or currentColor`);
        if (STYLE_NONE.has(key) && value.trim() !== "none")
          report(node, `style ${key} must be none`);
        if (key === "borderRadius" && !/^0(?:px)?$/.test(value.trim()))
          report(node, "style borderRadius must be 0");
      }
      if (key === "opacity" && node.initializer.getText(sf) !== "1")
        report(node, "style opacity must be 1");
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return findings;
}

export function checkSvg(text: string, allowTokens: boolean): Finding[] {
  const findings: Finding[] = [];
  text.split("\n").forEach((lineText, i) => {
    for (const l of colourLiterals(lineText))
      if (!(allowTokens && TOKEN_VALUES.has(l.toLowerCase())))
        findings.push({ line: i + 1, message: `colour literal ${l}` });
    for (const m of lineText.matchAll(/(?:fill|stroke|stop-color|color)\s*[=:]\s*["']?([a-z]+)/gi))
      if (NAMED.has((m[1] as string).toLowerCase()))
        findings.push({ line: i + 1, message: `named colour ${m[1]}` });
    if (/<(?:linearGradient|radialGradient|feGaussianBlur|feDropShadow)\b|opacity=/.test(lineText))
      findings.push({ line: i + 1, message: "gradient, blur or opacity" });
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
    .filter((f) => f && existsSync(f) && !SKIP.has(f));
  const all: string[] = [];
  let checked = 0;
  for (const file of files) {
    let findings: Finding[] | null = null;
    const text = () => readFileSync(file, "utf8");
    if (/\.css$/.test(file)) findings = checkCss(text());
    else if (/\.(?:[cm]?[jt]sx?)$/.test(file))
      findings = checkSource(text(), file, TOKEN_FILES.has(file));
    else if (/\.svg$/.test(file)) findings = checkSvg(text(), TOKEN_FILES.has(file));
    if (!findings) continue;
    checked++;
    for (const f of findings) all.push(`${file}:${f.line}  ${f.message}`);
  }
  if (all.length) {
    console.error(
      `check-palette: ${all.length} problem(s). Only ink and paper are allowed (D-075):`,
    );
    for (const line of all) console.error(`  ${line}`);
    process.exit(1);
  }
  console.log(`check-palette: ${checked} files use only ink and paper.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
