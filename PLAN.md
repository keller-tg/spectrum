# Spectrum — Plan

Working title. A free, local-first web app that places a person on 12 political axes and matches
them to ideologies, countries/regimes, figures and parties. It's an interpretation tool and makes
no claim to measure anyone exactly.

Source of truth: **Master spec v2** (2026-10-21). Every choice and its status is recorded in
[DECISIONS.md](DECISIONS.md), whose first section lists what changed from v1.

Status: Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ (engine, schemas, 72 EN questions, 53 anchor ideologies,
calibration; question revision 2 approved 2026-10-23) · Design reset ✅ · Design V2 ✅ (§13,
approved; defaults in D-084) · Phase 3 ✅ (test, results, share, pilot; D-085) · **Phase 4 ✅ (static compass, D-086)**.
---

## 1. Principles

1. **The engine is pure.** `lib/engine` is plain TypeScript with no React, DOM, Next or I/O, and
   full unit-test coverage. The same code runs on the server (shared results, OG images) and in
   the browser (own results, sandbox, dashboard).
2. **Content is data.** Everything lives in typed files in `/data`. `prebuild` validates them with
   zod and the build fails on invalid data.
3. **Local-first.** The test, results and dashboard work with no account and no server storage.
4. **A user's own results never appear in a URL.** Hosting logs record URLs, so a share code is
   generated only when the user presses Share.
5. **The server can't read political data.** Sync is end-to-end encrypted. The community layer is
   a separate, explicit, unlinked submission.
6. **Everything is localized**, including slugs, anchors and route names. JSX contains no string
   literals, enforced by lint.
7. **Honest about uncertainty.** Every score has a confidence, matches are spread out rather than
   inflated, contradictions are named gently, and placement confidence is shown per entry.
8. **Original work only.** The reference site sets the mood and nothing else.

---

## 2. Stack (versions from npm, 2026-10-21)

| Concern | Choice |
|---|---|
| Framework | Next.js **16.4** (App Router, RSC, Turbopack), React 19.2, TypeScript strict |
| Styling | Tailwind **4.3** (CSS-first `@theme`), theme cut down to two colour tokens, `--ink` and `--paper` (D-075) |
| Fonts | Archivo + IBM Plex Mono, self-hosted via `next/font/local` (D-076) |
| Images | sharp at build time: Commons photos → 1-bit ordered dither (D-078) |
| i18n | next-intl **4.14**: `en`, `de` (standard German, ß), `fr`. `de-ch` comes later as a build-time ß→ss transform plus a Swiss vocabulary list. Localized `pathnames`, `localePrefix: 'always'`, locale cookie off |
| Validation | zod **4** |
| DB (opt-in sync only) | Postgres on Neon (EU, Frankfurt) + Drizzle ORM |
| Local storage | IndexedDB via `idb` |
| Compass / charts | d3 *modules* + Canvas 2D + SVG overlay |
| Crypto | `@scure/bip39`, WebCrypto (HKDF, AES-GCM); SimpleWebAuthn (PRF) later |
| OG | `next/og` (satori) |
| Tests | Vitest (engine, data, calibration), Playwright + axe (e2e smoke) |
| Lint/format | ESLint flat config (next, typescript-eslint, jsx-a11y, `i18next/no-literal-string`, engine import fence) + Prettier |
| Hosting | Vercel. Domain for now: `https://spectrum-six-rho.vercel.app`; the final domain gets decided before Phase 7. Preview deploys from Phase 3 |
| Package manager | npm |

**Next 16 caveat:** `middleware.ts` is now `proxy.ts`, request APIs are async, and `next lint` is
gone. The bundled docs in `node_modules/next/dist/docs/` get read before writing framework code.

---

## 3. Repository layout

```
app/[locale]/…            pages (see §4); test/[mode]/layout.tsx keeps test state across questions
app/api/…                 profile, restore, sync, cron, (flagged) explain, community
proxy.ts                  next-intl routing
i18n/                     routing.ts, request.ts, navigation.ts, params.ts (dynamic-param localization)
messages/                 en.json de.json fr.json (UI strings only)
data/                     axes, spectrums, families, rubric, questions/, ideologies/, countries/,
                          regimes/, figures/, parties/<iso2>/
lib/engine/               PURE scoring/matching/calibration
lib/schema/               zod schemas and inferred types
lib/design/               the two colour tokens (ink, paper) for TS consumers
lib/catalog/              typed accessors, localized slug maps, search index
lib/storage/ lib/sync/    client: IndexedDB, E2E crypto, sync client
lib/server/               server-only: db, tokens, rate limit
components/               ui/ test/ results/ compass/ charts/ dashboard/ explorer/ share/ styleguide/
scripts/                  validate-data, build-derived, build-images, check-sources, check-privacy, check-palette, fetch-commons, calibration-report, pilot-analysis
generated/                build outputs (PCA, indices, τ, neighbours, web layout), gitignored
docs/                     scoring.md, content-style.md, adding-content.md, refreshing-parties.md
tests/e2e/                Playwright
```

`npm run check` runs validate, derive, lint, typecheck and test. `prebuild` runs validate and
derive. `npm run e2e` runs Playwright against a production build.

---

## 4. Routing & i18n

Static segments are localized with next-intl `pathnames`. Dynamic values (mode names, entry slugs)
are localized from `/data`, so the language switcher and hreflang always land on the *same* entry.
Slugs are ASCII `[a-z0-9-]` and unique per locale and catalog.

| Page | en | de | fr |
|---|---|---|---|
| Test | `/en/test/standard/12` | `/de/test/standard/12` | `/fr/test/standard/12` |
| Mode slugs | quick · standard · deep | schnell · standard · vertieft | rapide · standard · approfondi |
| Own results (local, no data in URL) | `/en/results` | `/de/ergebnisse` | `/fr/resultats` |
| Shared result | `/en/results/<code>` | `/de/ergebnisse/<code>` | `/fr/resultats/<code>` |
| Compare | `/en/compare/<code>` | `/de/vergleich/<code>` | `/fr/comparer/<code>` |
| Dashboard | `/en/dashboard` | `/de/verlauf` | `/fr/tableau-de-bord` |
| Compass · Web · Sandbox | `compass` `web` `sandbox` | `kompass` `netz` `sandkasten` | `boussole` `reseau` `bac-a-sable` |
| Ideologies · Countries · Figures · Parties | `ideologies` `countries` `figures` `parties` | `ideologien` `laender` `persoenlichkeiten` `parteien` | `ideologies` `pays` `personnalites` `partis` |
| Method · Privacy · Imprint | `method` `privacy` `imprint` | `methode` `datenschutz` `impressum` | `methode` `confidentialite` `mentions-legales` |

Results anchors are localized in `messages/*.json` under `anchors.*`. UI strings ship in all three
locales from Phase 1. Content (questions, catalog) is English-first. A locale whose content is
incomplete renders a notice, stays `noindex` and is left out of the sitemap until Phase 9 marks it
`contentComplete`.

---

## 5. Data model (zod, `lib/schema`)

### 5.1 Axes

The first-named pole is −100 and the second is +100. Every pole gets a one-line tooltip written so
that people who hold that view would accept it as fair.

| # | id | −100 | +100 | Measures | Not in this axis |
|---|---|---|---|---|---|
| 1 | `distribution` | Equality | Markets | How far the state should redistribute income and wealth (taxes, transfers, wage rules, price rules) | ownership → 2 |
| 2 | `ownership` | Collective | Private | Who should own productive assets (firms, land, resources, infrastructure) | redistribution → 1 |
| 3 | `trade` | Protectionism | Free trade | Openness to cross-border goods, services and capital | migration → 12 |
| 4 | `liberty` | Liberty | Authority | Scope of state power over individual life: speech, privacy, policing, personal choices | who rules → 6 |
| 5 | `centralization` | Centralized | Decentralized | Where power sits: national vs. regional/local | scope → 4; supranational → 10 |
| 6 | `participation` | Citizens decide directly | Representatives/experts decide | How far decisions pass from citizens to elected representatives and experts, or at the far end (anchored by an unelected-rule item) to a party or a crown (D-067) | scope → 4 |
| 7 | `tradition` | Progressive | Traditional | Attitude to inherited norms and customs: family and gender (at most half the items), end of life, custom in general | religion's public role → 8 |
| 8 | `religion` | Separation of religion and state | Religion in public life | Role of religion in law, schools and public life, not personal religiosity (D-067) | social change in general → 7 |
| 9 | `ecology` | Growth | Ecological sustainability | Priority when growth and ecological limits conflict | ownership → 2 |
| 10 | `nation` | Nationalism | Internationalism | Primacy of the nation and national identity vs. shared sovereignty and international institutions | migration → 12; war → 11 |
| 11 | `intervention` | Interventionist | Restraint | Willingness to use military or coercive power abroad, and alliance commitments | identity → 10 |
| 12 | `borders` | Open | Restrictive | How freely people may move to and settle in a country (D-067) | trade → 3 |

`build-derived` reports the catalog correlation matrix and warns when any |r| > 0.8. That's a
warning and not a failure, since ideologies cluster naturally. Item-level factor analysis replaces
it once community data exists.

### 5.2 Questions

```ts
Question     = { id, axis, key: 1 | -1, order, mirrorOf?, retired?, replaces?, empirical? }   // key 1: agreeing → +100 pole
QuestionText = { [locale]: { [id]: { text, explainer } } }             // explainer defines terms, never hints direction
```

- **Modes are prefixes of one ordered list:** Quick = 1–36, Standard = 1–72, Deep = 1–144. Each
  block of 12 contains every axis exactly once, so *every* prefix of length 12k is balanced. Within
  a block the axis order rotates so no axis repeats across block boundaries, and mirror pairs sit
  at least 8 items apart.
- **Keying:** Standard has 3/3 per axis and Deep has 6/6. Quick alternates 2+/1− and 1+/2−
  across axes (18/18 overall). Item weights are normalized so the agree side and disagree side
  carry **equal total weight per axis over the answered items**, which puts an all-agree user at
  exactly 0 in every mode (§6.1).
- **Validator rules:**
  - counts per axis per mode
  - keying balance
  - ≥1 mirror pair per axis within Quick
  - ≤ 25 words per item
  - lint for absolutes, double-barrel conjunctions (flagged for review), a loaded-term denylist and
    US-specific institutions
  - at most one `empirical` item (a claim about facts or effects) per axis in Quick
  - a changed meaning gets a new id; the old item is `retired` (kept with its last position) and
    the new one names it in `replaces` (same axis and key) — D-069
- Times are stated up front at ~8 s per item: Quick 36 (~5 min), Standard 72 (~10 min), Deep 144
  (~20 min). The only profile question is an optional **country** (full list, "prefer not to say").
- Phase 2 writes all 72 Quick and Standard items in English. Deep and DE/FR come in Phase 9.

### 5.3 Catalog entries

```ts
EntryBase = {
  id, kind: 'ideology' | 'country' | 'regime' | 'figure' | 'party',
  status: 'stub' | 'complete',                 // stubs: coordinates and metadata only, never published as pages
  slugs: { [locale]: string }, names: { [locale]: string }, aka?: …,
  coords:   Record<AxisId, -100..100>,          // all 12
  salience: Record<AxisId, 0..1>,               // all 12; ≥1 axis ≥ 0.8
  rationale: { [locale]: string },
  sources: Source[≥2],                          // { title, publisher, url, kind, accessed }
  placement: { confidence: 'high' | 'medium' | 'low', reason: { [locale]: string } },
  estimate: boolean,                            // living people, current parties, modern countries
  atrocity?: { basis: 'tribunal' | 'scholarly-consensus', note: { [locale]: string } },  // §5.5
  review: { status, by, date },
}
Ideology = EntryBase & {
  spectrum: SpectrumId, tags: TagId[],          // 9 spectra; cross-cutting tags e.g. 'religious', 'online-satirical'
  family: FamilyId, parent?: IdeologyId,        // family → ideology → variant
  labelStatus: 'self-described' | 'academic' | 'contested', termOrigin: { [locale]: string },
  extremist: boolean,                           // stricter tone rules (§5.5)
  tier: 'A' | 'B',
  content?: { [locale]: {                       // required when status = 'complete'
    summary, voice, coreBeliefs[], origins, keyThinkers[], historicalExamples[],
    criticisms[≥2], harms?, nameNote?            // nameNote required for academic/contested labels
  }},
  avatar: { seed, motif },
}
Country / Regime / Figure / Party: base plus asOf (or period), ideology tags (many-to-many), images
(Commons metadata filled by script), books (figures), country (parties)
```

**Semantic validator rules:**

- unique slugs per locale
- required locale fields present
- ≥2 sources
- ideologies have ≥2 criticisms when complete
- `academic`/`contested` labels need a `nameNote`
- living people and current entities have `estimate: true`
- a `parent` must exist, share the family and not form a cycle
- **near-duplicates:** two entries closer than 8 points (weighted RMS) need a parent/child or alias
  relationship
- `online-satirical` ⇒ hidden from matching
- the spectrum must agree with the rule-based classifier, or carry a `classificationNote`
- extremist ⇒ the tone lint passes (third-person voice, no slogan headings)
- every image licence is on the allowlist

### 5.4 Spectra, families, rubric

- **9 spectra:** radical left, left, centre, right, far-right, third position, libertarian,
  anarchist, theocratic. *Theocratic* is reserved for ideologies that make religious law or
  clerical rule the basis of the state. Christian or Muslim democracy stay in their normal
  spectra, with a `religious` tag where it fits.
- **Families:** `data/families.ts` (e.g. anarchism, marxism, social democracy, liberalism,
  conservatism, libertarianism, fascism, …), each with a spectrum home and a description. The
  explorer and the web view collapse and expand by family.
- **Rubric:** `data/rubric.ts` gives anchors per axis at −100/−50/0/+50/+100, each with a description
  and reference ideologies. Every content batch places entries relative to them.

### 5.5 One atrocity-context policy, applied to every kind of entry

The criterion is **genocide established by an international tribunal or by broad scholarly
consensus**. A living person qualifies only when *convicted* by an international tribunal. Such
entries:
- stay in the catalog with context
- are never the hero of a share card or OG image
- may appear in "furthest from you" and the explorer
- appear with a context note when they're a top match, and are never hidden

Separately, `extremist` ideologies use a third-person voice, a mandatory harms section and no
slogan headings. No symbols, flags or emblems appear anywhere.

### 5.6 Versions

- `ENGINE_VERSION` is semver and bumped by hand. Golden fixtures fail if output changes without
  a bump.
- `QUESTION_BANK_VERSION` and `CATALOG_VERSION` combine a date label and a content hash.
- Questions are retired, never deleted.

---

## 6. Scoring engine (`lib/engine`)

Modules: `answers` `score` `confidence` `quality` `pca` `indices` `match` `similarity` `simulate`
`calibrate` `codec` `recompute` `random` `version` (plus `insights` and `drift` in Phases 3 and 6).
The formulas are documented in `docs/scoring.md`.

### 6.1 Axis scores (spec: weighted mean of keyed answers over answered items only)

- Raw `r ∈ {−2..+2}`, and **skip = `null`** (excluded). Neutral 0 counts.
- Keyed `x = key·r/2`.
- **Effective weights:** on each axis, the answered `+` items share total weight ½ and the answered
  `−` items share ½, each split in proportion to their base weights.
  `score = 100·Σ w_eff·x`.
- With 3/3 keying and no skips this equals the plain weighted mean. In Quick (2/1) the single
  minority item carries ½.
- **All-agree ⇒ exactly 0 on every axis in every mode**, as long as both keyings on an axis were
  answered. When skips leave only one keying, the plain mean is used with a confidence penalty.

### 6.2 Confidence (per axis, provisional constants)

`c = n/(n+2) · (1 − sd(x)) · (0.8 if only one keying answered, else 1)`

That gives Quick ≈ 0.60, Standard ≈ 0.75 and Deep ≈ 0.86 at full consistency. Overall confidence
is the mean of `c` times the quality penalty.

### 6.3 Quality & consistency (provisional thresholds)

| Flag | Rule | Effect |
|---|---|---|
| `straightline` | ≥80% identical raw answers, or a run ≥ 70% of answered | low quality |
| `acquiescence` | \|mean raw r\| ≥ 1.2 | low quality |
| `contradiction` | a mirror pair whose keyed values differ by ≥ 1.5 | per-axis tension note; low quality if ≥ 25% of pairs |
| `fast` | median < 1.2 s per answer | low quality |
| `sparse` | > 40% skipped | lower confidence only |

A tension note reads "your answers pull in opposite directions here". Low quality leads with a
gentle message instead of a verdict and is excluded from trends by default.

### 6.4 Category indices (no editorial signs)

For each category (3 axes), `build-derived` runs PCA over the catalog's ideology coordinates. PC1
is oriented so the category's first axis loads positively, meaning the negative end matches its
first-listed pole.

`index = 100 · Σ lᵢ·sᵢ / Σ|lᵢ|`

This isn't mean-centred, so 0 means "0 on all three axes", and the range is [−100, 100]. The UI
shows the loadings and explained variance. **If explained variance is under 50%, the category
shows its 3 axes instead of one index.** A one-line left-to-right summary is allowed and never
replaces the compass.

### 6.5 Matching

```
w_a = c_a · (0.2 + 0.8·σ_a)                 σ = entry salience; c = user confidence
d   = sqrt( Σ w_a (s_a − e_a)² / Σ w_a )    weighted RMS gap, 0..200
sim = 100 · 2^(−(d/τ_k)²)                   smooth curve; τ_k per catalog kind
```

- **τ is a placeholder.** It's fitted on simulated users so the median best match is about 75%
  and the top 5 spans roughly 75→55%. `docs/scoring.md` notes that it **must be re-tuned on real
  opt-in community data**, because real users cluster near the centre. Percentiles were rejected
  because they push the best match to 95%+. Displayed values are capped at 99%.
- **Results structure:**
  - **closest family**: family centroid, salience-weighted mean of its members
  - **closest ideology**: entries without a parent
  - **closest variant**: entries with a parent, shown under their parent
  - The top 5 ideologies are de-duplicated so variants don't crowd the list.
  - "In between X and Y" appears when the top two are within 4 points.
- **Headline rule:** a `low` placement-confidence entry is never the headline if a medium or high
  one is within 3 points. Atrocity-context entries are never the share-card hero.
- `online-satirical` entries are excluded from matching by default.

### 6.6 Calibration tests (they report numbers and are never "fixed" by bending data)

`simulate` creates respondents from catalog coordinates. For each item the latent response is
`2·key·e_a/100 + N(0, σ²)`, rounded and clamped, with optional random skips.

- **Noise levels:** σ ∈ {0, 0.5, 0.8, 1.0}. The gate is σ = 0.5, and the others are reported.
- **Modes:** Quick and Standard use the real bank. Deep uses the bank *structure* (12 per axis,
  6/6) until Phase 9 writes the items.
- **Strict hit:** exact ideology. **Family hit:** same family or a parent/child relation.
  Both are reported.

| Test | Gate |
|---|---|
| (a) Deep | own ideology (or a parent/child) in top 3 for ≥ 90% |
| (a) Standard | top 3 for ≥ 80% |
| (a) Quick | top 5, or same family as the top match, for ≥ 80% |
| (b) | all-"agree" user = exactly 0 on all axes in every mode, and flagged |
| (c) | for every simulated user, the best match ranks above every clearly opposite entry (unweighted distance ≥ 120) |
| spread | median top-1 ≈ 75%, median 5th ≈ 55% (reported, with a loose gate) |

`npm run calibration` prints the full tables and writes `docs/calibration-report.md`. Next to the
gates it reports a robustness grid (response styles, noise, item difficulty offsets, a mixed
population) and the exact expected scores of a true centrist (D-071). That grid is reported, not
gated.

### 6.7 Share code

23 bytes encoded as 31 base64url characters: version, mode and flags, 12 int8 scores, 12 4-bit
confidences, engine version and a CRC-8. It holds scores only and never answers, and it's created
only on Share.

### 6.8 Recompute

Results store their answers and the versions used. When versions differ the app shows both
"As taken" and "Recomputed" views, labelled.

---

## 7. Test UX (Phase 3)

- The route holds the question index, and `TestProvider` in `test/[mode]/layout.tsx` survives
  navigation. Each answer autosaves to IndexedDB.
- **Fixed layout:** the answer stack is anchored and the question area reserves the height of the
  longest item, so buttons never move. Skip is a separate control, and the explainer opens as an
  overlay.
- No axis or pole labels appear during the test.
- Keyboard: 1–5 to answer, 0/S to skip, ←/→ to move, ? for the explainer. Advance-on-answer can be
  toggled. A progress bar shows "12 / 72".
- After Quick, the user is offered "36 more questions to sharpen this", which keeps their answers
  (likewise Standard → Deep).
- **Built (D-085):** `components/test/` (TestProvider, QuestionStage, TestScreen),
  `lib/storage/db.ts`, `lib/test/result.ts`. Quick and Standard have static pages for every
  question; Deep follows its bank.

## 7a. Pilot (Phase 3, D-072)

Goal: 30–50 real answer sets from people the owner knows, collected before Phase 9, to measure what
simulation cannot: item difficulty, item-total correlations, reliability and inter-axis
correlations.

- **`/pilot`** (per locale): unlinked (no nav, footer or sitemap entry), `noindex, nofollow` in
  the page metadata and an `X-Robots-Tag` header. It is not named in `robots.txt` either, since a
  `Disallow` line would advertise it.
- **Explicit consent first:** a short screen says what the file contains, that political views
  are sensitive data, that nothing is sent to or stored on any server, and that the participant
  decides whether to pass the file on. The test only starts after an unticked-by-default checkbox.
- The participant takes the normal test (Standard by default) with the real UI. Answers stay in
  this tab's sessionStorage (no IndexedDB, no cookie, no request), so a language switch or reload
  keeps them; they are removed on download, on "Discard" and when the tab closes (D-087).
- **Download:** one JSON file, `spectrum-pilot-<random>.json`:
  `{ format: "spectrum-pilot", version: 1, bankVersion, engineVersion, mode, locale, answers:
  { [questionId]: { r, ms } }, country? }`. No name, no timestamp finer than the month, no
  device data. The schema lives in `lib/schema/pilot.ts` and is validated on both ends.
- **`npm run pilot-analysis -- <folder>`** (`scripts/pilot-analysis.ts`) reads every file in the
  folder and reports, as Markdown to stdout and `generated/pilot-report.md` (gitignored):
  - per item: n, skip rate, answer distribution, agree rate (+1/+2), mean, SD, and the implied
    difficulty offset (feeds the robustness grid, D-071)
  - corrected item-total correlation (item vs. the keyed sum of the other items on its axis),
    flagging items below 0.2 or negative (likely mis-keyed)
  - per-axis reliability (Cronbach's α; alpha-if-item-deleted)
  - inter-axis correlations of the engine's axis scores, flagged above |0.8|
  - mirror-pair agreement and quality-flag rates, median time per item
- Pilot files are personal data: they live outside the repo (or in the gitignored `pilot-data/`)
  and are never committed. The privacy guard does not replace this rule.

## 8. Results page (Phase 3)

The page has a sticky TOC with localized anchors. Sections:

- summary (closest family, ideology and variant, plus an in-between note)
- 12 axis sliders with confidence and "what this measured"
- most unusual / most typical position
- radar
- category bars (following the PCA rule)
- compass preview
- matches: ideologies, countries & regimes, figures, parties, each with "furthest from you"
- eras timeline
- uncertainty: runner-ups, tensions, the placement-confidence indicator
- share, available only on press
- edit answers, and a link to the dashboard

Built in Phase 3 (D-085): summary poster, axes, unusual/typical, indices, matches with
"furthest", uncertainty, share and continue/upgrade (`components/results/`, `lib/results/`).
The radar, eras and non-ideology matches wait for their data.

## 9. Modern compass (Phase 4, then trail in Phase 8)

- **Rendering:** Canvas 2D for the halftone density (dot size = how many ideologies sit nearby)
  and points, with an SVG overlay for labels and focus. Points are spectrum shapes with codes
  (D-077); no colour anywhere. d3-zoom for pan/zoom and d3-delaunay for hit-testing. Labels are
  collision-avoided and get more detailed as you zoom.
- **You:** an outlined uncertainty ellipse (radii from confidence on X and Y) with a crosshair.
  The trail is a dashed path with arrowheads and date labels, more dotted with age, with a
  scrubber and playback (reduced motion: static path). The ghost compare is hollow and dashed.
- **Axis picker:** 12 axes plus the indices, or **Map**, a build-time PCA over all 12 axes with
  stored loadings, so anything projects exactly. The web view starts from the same coordinates.
- **Also:** small multiples, layers, spectrum and family filters, and a ghost compare.
- **A11y:** a keyboard model, an aria-live summary and a table fallback.
- **Performance and export:** 60 fps target and PNG export.
- **Built in Phase 4 (D-086):** `/compass` and the results page's mini compass. SVG instead of
  Canvas; halftone density, spectrum markers, the user's hatched uncertainty ellipse, Map or
  any two of 12 axes + 4 indices, width-fitted collision-free labels, a keyboard model, a live
  region and a table. Zoom, filters, layers, small multiples, ghost, PNG export and the trail
  are still open.

## 10. Dashboard (Phase 6) & sync (Phase 7)

- **Local:** IndexedDB stores `results`, `drafts`, `settings` and `badges`. The dashboard has
  seven views (see spec) and a deterministic drift summary.
- **E2E sync:**
  - The recovery phrase (12 BIP39 words, 128-bit) is generated client-side, shown once, and comes
    with a blunt warning: *lose the phrase = lose your data*.
  - HKDF derives two keys from it: `authSecret`, which goes to the server and is stored only as an
    HMAC, and `encKey`, which never leaves the device.
  - The session cookie `__Host-sp` carries a 256-bit token that the server stores only as an HMAC.
  - Blobs are AES-GCM ciphertext.
  - A passkey with PRF wraps `encKey` where the browser supports it, as a bonus. The phrase stays
    the fallback.
- **Privacy & retention:** export and delete-everything; inactive profiles purged after
  12 months; rate limiting via a daily-rotating salted IP HMAC with a 24 h TTL in a separate
  table. **No IP is ever stored in a profile or result table.**

## 11. Share, compare (Phase 8) · Explorer (Phase 10) · Optional (Phase 11)

- **Share and compare:** OG images per result (on Share only) and per entry, generated on demand
  and cached. PNG card, PDF via a print stylesheet, JSON, all black and white in the site's fonts.
  Friend compare overlays radars (solid + hatched vs dashed + empty) and gives per-axis deltas and
  a compatibility score.
- **Explorer:** catalog pages with search, filters and the twelve-axis strip (codes + filled/empty
  squares); one SSG page per complete entry. A force-directed web view collapsible by family
  (nodes = spectrum shapes, 1px edges, labels on hover/zoom, selected node inverted). A sandbox.
  Generated monochrome entry glyphs; countries as ISO codes, no flags.
- **Optional (feature-flagged):**
  - AI explain with the current Haiku model, re-verified at implementation time
  - a community layer as a separate anonymous submission with k-anonymous density
  - passkey PRF
  - a PWA

## 12. Content pipeline (Phase 5)

1. `docs/content-style.md` and the rubric anchors are written first.
2. **Generation subagents** work in batches of about 12 entries and write one file per entry. They
   may cite only sources they actually opened (≥2), and they run the validator before returning.
3. **A second reviewer subagent checks every batch** for bias, tone, borderline classification and
   coordinate drift against the rubric and neighbours. Borderline calls are logged in DECISIONS.md.
4. **Order:**
   - Tier A: ~120 core ideologies across all 9 spectra, with full pages
   - historical regimes 50+ → countries 150+ → figures 150+
   - parties for UK, IE, US, CA, AU, NZ and the EP groups (CH, DE, FR, AT later)
   - Tier B: 180+ variants and fringe currents, under the same gates
5. **Inclusion:** real adherents or a real literature, with ≥2 independent sources. Satirical or
   online-invented labels are excluded unless tagged `online-satirical`, and are hidden from
   matching. Near-duplicates become aliases or variants.
6. Images are Commons only, with metadata from the Commons API and a licence allowlist, and become
   1-bit ordered-dither images at build time with attribution under each (D-078). No copied
   prose.

Phase 2 already adds **~40 stub ideologies** (coordinates and metadata, no pages) as calibration
anchors across all 9 spectra, including parent/child variants. They become full Tier A entries in
Phase 5.

## 13. Design (reset 2026-10-23, V2 the same day; D-075–D-081)

"Technical specimen sheet meets Swiss poster": strictly black and white, a visible 12-column
grid, extreme scale contrast, small mono annotations, one living data figure and carefully
built controls.

**History.** The Phase 1 look was cream paper, deep green, a deep-red accent, a display serif,
per-spectrum tints, playful motion and rounded cards. The owner replaced it with a strict
two-colour design: every grey, tint, shadow, blur and soft corner was another colour or effect,
and tints carried meaning by colour alone (DECISIONS §0c). Design V2 then kept the two colours
but brought back motion as a disciplined interaction system, made corners a control-only token
in three styles, and replaced the one-screen landing with a full home page (DECISIONS §0d).

- **Palette:** `--ink` and `--paper` only (black on white; white on black in dark mode);
  inverted bands flip the tokens relative to the nearest theme. Depth comes only from 1-bit
  techniques: halftone, hatching, ordered dither. Resting states are pure ink or paper.
  Enforced by `check-palette` (script + CI) and the e2e colour audit (also in the pill style).
- **Motion (D-080):** tokens `--ease-out`, `--ease-spring` (≤ 3% overshoot), 120/220/360ms;
  transform and clip-path only; hover only for fine pointers; instant under reduced motion.
- **Controls (D-080):**
  - buttons with a synchronised wipe, arrow roll, spring press, loading ticks, a success draw
    and error words
  - segmented controls with a sliding inverted indicator
  - whole-row mode links and full-width answer rows
  - sliders with a following readout
  - links whose underline draws in; tooltips with a 300ms delay
  - three control styles (sharp, pill, offset) to choose from
- **Structure:** 2px rules for structure, 1px for dense data; 8px spacing grid; numbered
  sections with a rotated running head; generous section padding; nothing below 12px.
- **Type:** Archivo 800 for display (−0.02em, leading 0.92), Archivo 400 for text (≥ 16px,
  ≤ 65ch, 1.6), IBM Plex Mono for UI, labels and numbers. Self-hosted.
- **Without colour:**
  - spectrum shapes plus codes, with a legend
  - axis codes; the strip's filled and empty squares
  - halftone density; solid vs dashed lines; hatched vs empty fills
  - inverted selection with "[X]"
  - a data-table alternative for every chart
- **Images:** 1-bit dither at build with visible attribution; generated glyphs; ISO codes, no
  flags. Share cards, PDF and print are black and white.
- **Home (D-081):** hero (headline, subline, mode rows, the live catalog field), stat strip,
  01 how it works, 02 the twelve axes, 03 index of ideologies, privacy band, footer wordmark.
  Two variants for review: `/styleguide/home-a` and `/styleguide/home-b`.
- **App screens:** the test screen and the result poster are designed on `/styleguide/screens`
  and built in Phase 3 and Phase 8.
- **Review:**
  - `/styleguide`: every component and state in both modes, plus the control-style switch
  - `/styleguide/buttons`: the state matrix
  - `docs/design/`: screenshots and recordings (`npm run design:capture`)

## 14. Quality bar

- `npm run check` must pass before every commit.
- The validator fails the build on bad data.
- The calibration suite runs from Phase 2 on.
- Playwright smoke and axe checks run from Phase 1 (basic) and Phase 3 (full flow).
- LHCI ≥ 95 on home, test, results, dashboard, catalog and detail pages, gated in Phase 12 and
  tracked from Phase 3.
- WCAG AA (ink on paper is 21:1); 44px touch targets; no horizontal page scroll down to 320px.
- Two colours only: `npm run check:palette` locally and in CI, plus the e2e colour audit (D-075).
- Mobile Lighthouse ≥ 95, CLS ≈ 0, INP < 200ms; core content works with JavaScript disabled (e2e).
- SEO: per-page metadata, hreflang, JSON-LD, sitemap and per-page OG.
- No third-party scripts, no tracking cookies.

## 15. Phases

| # | Phase | Exit |
|---|---|---|
| 0 | Plan (re-synced to spec v2) | ✅ |
| 1 | Scaffold, design system, i18n: Next 16 app, tokens, fonts, theme, next-intl with localized pathnames (en/de/fr UI), layout shell, stub pages for every route, design-system page, lint/format/Vitest/Playwright wiring | `/en` `/de` `/fr` with localized slugs; lint blocks string literals; check and e2e smoke green |
| 1b | **Design reset:** black-and-white tokens, self-hosted fonts, base components, `/styleguide`, palette guard (script, CI, e2e audit), dither pipeline | ✅ check + e2e green; **STOP for design review** |
| 1c | **Design V2:** interaction tokens, controls in three styles, sticky header and mobile sheet, hero field, home sections, two home variants, button matrix, app screens, captures in `docs/design/` | ✅ check + e2e green; **STOP: owner picks home variant and control style** |
| 2 | Engine, schemas, **36 Quick + 72 Standard EN questions**, ~40 anchor stubs, validator, build-derived (PCA, indices, τ), calibration suite, `docs/scoring.md` | calibration numbers reported; (b) and (c) pass; **STOP for question review** |
| 3 | Test UI + results page; first Vercel preview deploy; **pilot page + `pilot-analysis`** (§7a) | e2e full flow; LHCI tracked; pilot file round-trips through the analysis |
| 4 | Modern compass (static) | 60 fps; axe clean |
| 5 | Catalogs: Tier A → regimes → countries → figures → parties → Tier B | validator plus calibration on the full catalog |
| 6 | Local history + dashboard | works offline with zero setup |
| 7 | Encrypted sync, recovery phrase, export/delete, privacy page; final domain decided | restore-on-new-device e2e; no IP stored |
| 8 | Share cards, compare, trail playback | OG validated |
| 9 | Deep bank, FR, DE, then `/de-ch` | locales `contentComplete` |
| 10 | Explorer, web view, sandbox | LHCI ≥ 95 on catalog and detail pages |
| 11 | Optional AI / community / passkey PRF / PWA | everything off without keys |
| 12 | Polish, performance, a11y, SEO audit, privacy review hand-off | all quality gates |

## 16. Environment variables (`.env.example`)

`NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `TOKEN_PEPPER`, `RATE_LIMIT_SECRET`, `CRON_SECRET`,
`FEATURE_SYNC`, `FEATURE_AI`, `ANTHROPIC_API_KEY`, `FEATURE_COMMUNITY`. Every `.env*` file except
`.env.example` is gitignored. **The repo is public.**

## 17. Risks

| Risk | Mitigation |
|---|---|
| Accuracy and perceived bias across 300+ ideologies and 500+ other entries | Rubric, ≥2 sources, a reviewer subagent per batch, placement confidence, editorial-estimate labels, a correction link |
| Sensitive data (CH nFADP, GDPR Art. 9) | Local-first, E2E sync, no IPs, consent, real delete, 🔴 legal review before launch |
| Extremist content and illegal symbols (DE §86a StGB, AT) | Tone rules, harms sections, no symbols, the atrocity policy |
| Lighthouse ≥ 95 | RSC-first, lazy compass, JS budgets |
| Next 16 API drift | Read the bundled docs first |
| Scope | Each phase ships something usable |
