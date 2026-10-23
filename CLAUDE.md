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
- Design is strictly black and white (D-075–D-079): the only colours are `--ink` and `--paper`
  (app/globals.css, mirrored in lib/design/tokens.ts). No other colour, grey, opacity, shadow,
  radius, blur or gradient; `npm run check:palette` and the e2e colour audit fail on any.
  States: hover/press invert, selected = inverted + "[X]"/brackets, disabled = dashed, focus =
  3px outline. Meaning never rides on colour: use shapes, codes, patterns and words. New
  components get a section on /styleguide in both modes.
- The repo is public: never commit secrets or personal data.
- Never put the owner's personal data (email, real name beyond the commit identity, machine name)
  in any file, HTTP header or request. For a User-Agent contact use the repo URL:
  `+https://github.com/keller-tg/spectrum`. Tell every subagent the same. `npm run check` runs the
  privacy guard and CI scans the full git history (D-073).
- Question ids are permanent: a new meaning gets a new id, the old item is retired, and the new one
  names it in `replaces` (D-069). Pilot answer files never enter the repo (D-072).
