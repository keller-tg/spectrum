@AGENTS.md

# Spectrum — notes for coding agents

Source of truth: PLAN.md (the master spec v2, distilled) and DECISIONS.md (every choice, as
D-xxx). Read both before a phase and log new decisions there. Work in phases; after each,
check, commit, tag, summarise, and list what needs the owner's input.

## Commands
- `npm run dev` · `npm run build` (prebuild validates data, derives PCA/indices/τ, images)
- `npm run check`: privacy, palette and motion guards, data validation, derive, lint,
  typecheck and Vitest. Must be green at every commit.
- `npm run e2e`: Playwright, desktop and Pixel 7. It builds and serves on :3107 and reuses
  a running server, so restart that server after code changes.
- `npm run calibration` writes docs/calibration-report.md.
- `npm run motion:capture` / `design:capture` write review clips and screenshots to
  docs/design/. They need a running server.
- Pilot analysis: `npm run pilot-analysis -- <folder of pilot JSON files>`. It writes a
  Markdown report to stdout and to generated/pilot-report.md (gitignored).
- Next.js 16 differs from older knowledge (proxy.ts, async params, typegen). Read
  `node_modules/next/dist/docs/` before touching framework APIs. Cache Components is OFF
  (D-057).
- Vercel: previews only (branch pushes). Never deploy to production or change domains or
  dashboard settings without the owner.

## Privacy (the repo is public)
- No secrets in git: use env vars, documented in .env.example; real values go in
  .env.local.
- Never put the owner's personal data (email, real name, machine name) in any file, header or
  request. A User-Agent contact is `+https://github.com/keller-tg/spectrum`. Tell every
  subagent this rule. The privacy guard and CI scan files and git history (D-073).
- Own results never appear in a URL. They live in IndexedDB (`lib/storage/db.ts`), with a
  memory fallback. A share code is encoded only when the user presses Share, and
  `/results/<code>` is the only route that reads one.
- No server storage without explicit consent; political views are sensitive data. No
  tracking cookies. An IP may only appear as a salted, rotating, short-lived hash for rate
  limiting, and never next to results.
- `/pilot` is unlinked, noindex (meta and X-Robots-Tag) and consent-first. Answers stay in
  memory and download as a file. Pilot files never enter the repo (D-072).

## Design (D-075–D-086)
- Strictly black and white: only `--ink` and `--paper` (app/globals.css, mirrored in
  lib/design/tokens.ts). No grey, opacity, shadow, blur or gradient. Radius only through
  `var(--radius-control)` on controls. `check:palette` and the e2e colour audit enforce this.
- Motion animates transform or clip-path only, with the duration and easing tokens, and is
  instant under reduced motion; `check:motion` enforces it. Interactive rows and buttons use
  `<Wipe />` and `.wipe-host` (app/controls.css); never hand-roll a panel. Hover only applies
  to fine pointers.
- Meaning never rides on colour: use shapes and codes (spectra), hatch, halftone and words.
- The test screen keeps a fixed answer layout: rows never move. No axis or pole names appear
  during the test.
- New components get a section on /styleguide, in both modes.
- UI text lives in messages/{en,de,fr}.json. Tests enforce key parity, German ß and French
  narrow spaces. Content text lives in localized fields in /data. Statements are EN-only
  until Phase 9 and marked `lang="en"`.
- Images: openly licensed only (Wikimedia Commons), with attribution stored in data.

## Scoring (docs/scoring.md, PLAN §6)
- An axis score is the weighted mean of keyed answers over answered items only; skips don't
  count. Confidence, quality flags and indices follow PLAN §6.2–6.4.
- Indices and the Map are PCAs over catalog coordinates, computed at build time
  (generated/derived.json). Projections are exact and shared by the results page, the hero
  field and the compass (`lib/compass/geometry.ts`).
- Results are recomputed from stored answers on every view, so an engine update never
  rewrites stored data.
- Question ids are permanent. A new meaning gets a new id that names the old one in
  `replaces` (D-069). Calibration tests report numbers; never bend data to pass them.
- Content: neutral tone, criticisms on every entry, one atrocity-context policy for all
  kinds (PLAN §5.5).

## Tests
- Unit tests sit next to the code (`*.test.ts`, engine tests in lib/engine/__tests__).
- e2e (tests/e2e):
  - smoke: pages, axe, palette, wipes, theme;
  - locale-state: theme survives a language switch;
  - flow: Quick → results → share → Standard, pilot, 390px;
  - compass: keyboard, picker, table, frame timing.
