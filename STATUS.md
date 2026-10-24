# Status

Resume point for a new session. It's updated after every commit. Branch: `dev`; `main` is
production and is merged only on the owner's word.

## Done
- Phases 0–4, Design V2 (tags `phase-3`, `phase-4`).
- Pre-launch fixes D-087–D-090: the pilot survives a language switch, site-wide noindex,
  minimal pilot file, frame budget.
- PR #1 merged to main; production verified (200, noindex on every path, /pilot works).
- `dev` branch created.

## In progress (paused by the usage limit, 2026-10-23 late evening)
**Phase 5, Tier A (D-091).** Generator and reviewer subagents write directly into
`data/ideologies/`. The index has not been regenerated yet, so the build still sees the old
53 entries.

| Batch | Generated | Reviewed (`docs/reviews/tier-a-batch-NN.md`) |
|---|---|---|
| 01 | yes | reviewer started |
| 02 | yes | reviewer started |
| 03 | yes | reviewer started |
| 04 | yes | reviewer started |
| 05 | yes | reviewer stopped by the limit |
| 06 | running or partial | — |
| 07 | running or partial | — |
| 08 | running or partial | — |
| 09 | running or partial | — |
| 10 | not resumed (partial files may exist) | — |
| 11 | not resumed (partial files may exist) | — |

**To resume:**
- Check each batch with `npx tsc --noEmit` and `npx tsx scripts/check-entries.ts <ids>` (ids
  are in D-091).
- Finish every batch, then review it with the shared prompts (generator and reviewer briefs
  in the session scratchpad; the rules are in `docs/content-style.md`).
- Then run `npm run gen:index` and `npm run check`, and commit the Tier A work.

**Phase 6, dashboard: built, not committed.**
- `components/dashboard/DashboardView.tsx`, `lib/dashboard/history.ts` (tested),
  `lib/schema/history.ts`, `lib/storage/db.ts` (notes, delete, import, clear),
  `components/charts/Sparkline.tsx` (with a styleguide section), the dashboard page, and
  messages in EN, DE and FR.
- e2e: `tests/e2e/dashboard.spec.ts` passed 6/6 in a clean worktree.

**Phase 5, later steps: infrastructure ready, not committed.**
- `data/{countries,regimes,figures,parties}/index.ts`
- `lib/validation/entities.ts`, wired into `scripts/validate-data.ts`
- `scripts/check-entities.ts`
- `scripts/fetch-commons.ts` (Commons API metadata plus a licence allowlist)
- `scripts/build-images.ts`, which now also dithers figure portraits

## Next
1. Tier A: every batch generated, then reviewed, then `npm run gen:index`, the validator and
   `docs/catalog-spotcheck.md`.
2. Recalibration on the larger catalog (strict and family-level) and the axis 1/2
   correlation.
3. Phase 6: local-first dashboard.
4. Countries (150+ modern, 50+ historical), then deceased figures with dithered Commons
   images.
5. Parties (UK, IE, US, CA, AU, NZ, EP groups), only if the budget allows.
