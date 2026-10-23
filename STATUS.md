# Status

Resume point for a new session. It's updated after every commit. Branch: `dev`; `main` is
production and is merged only on the owner's word.

## Done
- Phases 0–4, Design V2 (tags `phase-3`, `phase-4`).
- Pre-launch fixes D-087–D-090: the pilot survives a language switch, site-wide noindex,
  minimal pilot file, frame budget.
- PR #1 merged to main; production verified (200, noindex on every path, /pilot works).
- `dev` branch created.

## In progress: Phase 5, Tier A (D-091)
- Infrastructure: `docs/content-style.md`, `scripts/check-entries.ts`,
  `lib/validation/content-lint.ts`, 9 new families.
- Batches: see the table in D-091.
  - Status per batch: `docs/reviews/tier-a-batch-NN.md` exists once the batch is reviewed.

## Next
1. Tier A: every batch generated, then reviewed, then `npm run gen:index`, the validator and
   `docs/catalog-spotcheck.md`.
2. Recalibration on the larger catalog (strict and family-level) and the axis 1/2
   correlation.
3. Phase 6: local-first dashboard.
4. Countries (150+ modern, 50+ historical), then deceased figures with dithered Commons
   images.
5. Parties (UK, IE, US, CA, AU, NZ, EP groups), only if the budget allows.
