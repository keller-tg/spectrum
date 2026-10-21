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
| `npm run check` | lint + typecheck + unit tests (must pass before every commit) |
| `npm run e2e` | builds, starts and runs the Playwright smoke suite (desktop + mobile, axe a11y checks) |
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

How scoring works, how to add axes/questions/entries, how to run calibration and how to refresh
parties will be documented here as those phases land (Phase 2 onwards).
