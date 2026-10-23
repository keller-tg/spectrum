# Spectrum (working title)

A free, local-first political test that places you on **twelve independent axes** and matches you
to ideologies, countries and historical regimes, figures and parties, while being honest about
uncertainty. It is an interpretation tool; it does not measure anyone exactly.

- **Plan:** [PLAN.md](PLAN.md) · **Decisions log:** [DECISIONS.md](DECISIONS.md)
- **Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind 4 · next-intl (en/de/fr) · zod · Vitest · Playwright

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; defaults work for local development
npm run dev                  # http://localhost:3000 → redirects to /en, /de or /fr
```

## Scripts

| Command | What it does |
|---|---|
| `npm run check` | privacy guard → palette guard → validate data → derive → lint → typecheck → unit tests (must pass before every commit) |
| `npm run check:privacy` | fails if the owner's personal email appears in the repo (`:history` scans every commit); needs `PRIVACY_GUARD_SHA256` in `.env.local` (hashes only) |
| `npm run check:palette` | fails on any colour other than `--ink`/`--paper` and on opacity, shadows, radius, blur or gradients (also a CI job) |
| `npm run design:capture` | screenshots of both home variants and WebM recordings of the controls → `docs/design/` (needs a running server) |
| `npm run images` | turns the photos in `data/images/` into 1-bit dither PNGs in `public/images/` (runs before `dev` and `build`) |
| `npm run validate` | zod + semantic checks on all content (also runs before every build) |
| `npm run derive` | build-time PCA map, category indices, similarity τ, neighbours → `generated/` |
| `npm run calibration` | full calibration report → `docs/calibration-report.md` (see below) |
| `npm run gen:index` | regenerate catalog index files after adding entries |
| `npm run check-sources` | check every source URL (network; CI job, not part of the build) |
| `npm run e2e` | builds, starts and runs the Playwright smoke suite (desktop + mobile, axe a11y checks, colour audit in both modes) |
| `npm run format` | Prettier |

Playwright needs a browser once: `npx playwright install chromium`.

## Project rules (short version)

- **No hardcoded strings** in UI code. Text comes from `messages/*.json` (UI) or localized data in
  `/data` (content). ESLint enforces this for JSX text and accessible names.
- **Everything is localized**, including URL segments (`i18n/routing.ts`) and dynamic slugs
  (`i18n/params.ts`). Switching language keeps you on the same page.
- **The engine is pure.** `lib/engine` may not import React, Next, browser globals or Node I/O
  (lint-enforced).
- **Privacy:** no analytics, no third-party scripts, no cookies (the only planned cookie is the
  optional sync profile, Phase 7). Theme preference lives in `localStorage`.
- **Secrets** only in `.env*` files, which are gitignored. This repository is public.

## How scoring works (short)

Full details with formulas and worked examples: **[docs/scoring.md](docs/scoring.md)**.

1. Answers are keyed toward one pole of their axis; **skip ≠ neutral**.
2. Per axis, agree-side and disagree-side items carry **equal total weight**, so answering "agree"
   to everything scores exactly 0 in every mode (and is flagged).
3. Confidence comes from the number of answers and their consistency. Contradictory mirror pairs
   produce a gentle "your answers pull in opposite directions" note.
4. Matching uses a salience- and confidence-weighted distance, turned into a similarity % by a
   smooth curve. That curve is calibrated on simulated users and is a placeholder until real
   data exists.
5. Category indices are the first principal component of each category's three axes over the
   catalog. Below 50% explained variance, the three axes are shown instead.

## Content: adding questions, entries and axes

All content lives in typed files in `/data` and is validated with zod (`lib/schema`) plus semantic
rules (`lib/validation`). **The build fails on invalid data.**

- **Questions:** `data/questions/bank.ts` holds the order, axis, key and mirror pairs, and
  `data/questions/text.en.ts` holds the wording and the "?" explainer. Rules:
  - modes are prefixes of one list, built from blocks of 12 that contain each axis once
  - Standard and Deep are keyed ≥ 40% each way per axis
  - ≥ 1 mirror pair per axis inside Quick, ≥ 8 positions apart
  - ≤ 25 words, no absolutes, loaded terms or US-specific framing
  - never change the meaning of an existing id: retire it and add a new one
- **Ideologies:** add `data/ideologies/<id>.ts` (copy an existing file), then run
  `npm run gen:index`. Required fields:
  - coordinates and salience on all 12 axes, placed against the anchors in `data/rubric.ts`
  - rationale and ≥ 2 sources you have actually opened
  - placement confidence, label status, family and spectrum
  - Entries closer than 8 points must be parent/child or merged.
  - Complete entries also need full content (summary, voice, beliefs, origins, examples,
    criticisms, plus a harms section when extremist).
- **Axes:** `data/axes.ts` holds names, poles and the one-line pole tooltips in en/de/fr. Adding an
  axis touches the engine's share-code layout and every catalog entry, so treat it as a
  scoring-model version bump.

## Calibration

```bash
npm run calibration      # prints the tables and writes docs/calibration-report.md
```

Simulated respondents are generated from each ideology's coordinates with answer noise, scored and
matched by the real engine. Gates (σ = 0.5): Deep top-3 ≥ 90%, Standard top-3 ≥ 80%, Quick top-5
or same family ≥ 80%, straight-liners exactly at 0, and no archetype ranked below a clearly
opposite entry. `npm test` runs the same gates on a smaller sample.

The report also runs a robustness grid that the gates leave out: response styles (acquiescent,
midpoint-heavy, extremity-averse), more noise, per-item difficulty offsets, and an exact check of
where a true centrist lands. Those numbers are reported, not gated.

How to refresh party data will be documented when parties land (Phase 5).
