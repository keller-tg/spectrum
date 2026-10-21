@AGENTS.md

# Spectrum — notes for coding agents

- Source of truth: the master spec v2, distilled in PLAN.md; every choice is in DECISIONS.md
  (IDs D-xxx). Read both before starting a phase. Log new decisions there.
- Work in phases. After each: `npm run check` (+ `npm run e2e` when UI changed), commit,
  short summary, list decisions needing the owner's input.
- Next.js 16 differs from older knowledge (proxy.ts, async params, root params, typegen).
  Read `node_modules/next/dist/docs/` before touching framework APIs.
- Cache Components is deliberately OFF (D-057). Static rendering uses generateStaticParams +
  next-intl's root-params request config.
- UI text: messages/*.json (en/de/fr, standard German with ß, French typographic spaces —
  tests enforce key parity and spacing). Content text: localized fields in /data.
- Colours are CSS tokens in app/globals.css (light + dark); text pairs must pass WCAG AA
  (axe runs in e2e for both themes).
- The repo is public: never commit secrets or personal data.
