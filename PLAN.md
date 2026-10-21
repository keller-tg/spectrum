# Spectrum — Plan

Working title. A free, local-first web app that places a person on 12 political axes and matches
them to ideologies, countries/regimes, figures and parties. It is an interpretation tool and makes no claim to measure anyone exactly.

Status: **Phase 0 (plan) — awaiting approval.** Every choice made here and every open question is
in [DECISIONS.md](DECISIONS.md). Items marked 🟡 there need your OK before the phase that
depends on them.

---

## 1. Principles

1. **Engine is pure.** `lib/engine` is plain TypeScript with no React, DOM, Next or I/O. It has full
   unit-test coverage and runs the same on the server (shared results, OG images) and in the
   browser (own results, sandbox, dashboard).
2. **Content is data.** Axes, questions, ideologies, countries, regimes, figures and parties are
   typed files in `/data`. Zod validates them in `prebuild`, and the build fails on invalid data.
3. **Local-first.** Taking the test, seeing results and the dashboard all work with no account and
   no server storage. The server only ever sees (a) a share code the user chose to share, or
   (b) end-to-end-encrypted blobs after an explicit opt-in (D-020).
4. **Everything is localized**, including slugs, anchors and route names. JSX has no string
   literals (enforced by lint).
5. **Honest about uncertainty.** Every score has a confidence. Matches are spread out instead of
   inflated. Contradictions get named gently instead of hidden.
6. **Original work only.** The reference site sets the mood and nothing else. Its code, wording,
   questions and data are never fetched or used (D-043).

---

## 2. Stack (versions checked on npm on 2026-10-21)

| Concern | Choice |
|---|---|
| Framework | Next.js **16.4** (App Router, RSC, Turbopack), React 19.2, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| Styling | Tailwind **4.3** (CSS-first `@theme` tokens), CSS custom properties for themes |
| i18n | next-intl **4.14**, localized `pathnames`, `localePrefix: 'always'`, locale cookie **off** |
| Validation | zod **4** |
| DB (opt-in sync only) | Postgres on **Neon** (EU, Frankfurt) + Drizzle ORM 0.45 / drizzle-kit, `@neondatabase/serverless` |
| Local storage | IndexedDB via `idb` |
| Charts / compass | d3 *modules* only (`d3-scale`, `d3-zoom`, `d3-contour`, `d3-delaunay`, `d3-force`, `d3-shape`), Canvas 2D + SVG overlay |
| Recovery phrase | `@scure/bip39` (audited), WebCrypto (HKDF, AES-GCM) |
| OG images | `next/og` (satori) |
| Tests | Vitest 5 (engine, data, calibration), Playwright 1.64 + `@axe-core/playwright` (e2e smoke, a11y) |
| Lint/format | ESLint flat config (typescript-eslint strict, jsx-a11y, `i18next/no-literal-string`, `no-restricted-imports` to keep the engine pure) + Prettier |
| Package manager | npm 11 (pnpm/bun not installed; no reason to add one) |
| Hosting | Vercel (functions in `fra1`, next to Neon Frankfurt) |
| Later | `@simplewebauthn/*` (passkeys), Serwist (PWA), `@anthropic-ai/sdk` (optional AI explain) |

**Next 16 caveat:** several APIs changed: `middleware.ts` is now `proxy.ts`, request APIs are async,
`next lint` is gone, and caching works differently. Phase 1 starts by reading
`node_modules/next/dist/docs/` and nothing gets written from memory.

---

## 3. Repository layout

```
spectrum/
  app/
    [locale]/
      layout.tsx                 # html lang, theme script, header/footer, NextIntlClientProvider
      page.tsx                   # home
      test/page.tsx              # mode picker (true counts + times up front)
      test/[mode]/layout.tsx     # <TestProvider> (client) — survives question navigation
      test/[mode]/[n]/page.tsx   # question n (SSG for every mode × n × locale)
      test/[mode]/profile/page.tsx  # optional profile questions (clearly optional)
      results/page.tsx           # YOUR latest result, read from IndexedDB (no data in URL)
      results/[code]/page.tsx    # shared result (SSR from code) + opengraph-image.tsx
      compare/[code]/page.tsx    # friend compare
      dashboard/page.tsx
      compass/page.tsx
      web/page.tsx               # force-directed ideology web
      sandbox/page.tsx
      ideologies/page.tsx  ideologies/[slug]/page.tsx (+ opengraph-image.tsx)
      countries/…  figures/…  parties/…
      method/page.tsx  privacy/page.tsx  imprint/page.tsx
    api/
      profile/route.ts           # POST create, DELETE delete-everything
      profile/restore/route.ts   # POST recovery-phrase restore
      sync/route.ts              # GET/PUT encrypted result blobs
      cron/retention/route.ts    # daily purge (Vercel Cron, CRON_SECRET)
      explain/route.ts           # phase 11, feature-flagged
      community/route.ts         # phase 11, feature-flagged
    sitemap.ts  robots.ts  manifest.ts
  proxy.ts                       # next-intl routing (Next 16 name for middleware)
  i18n/        routing.ts  pathnames.ts  request.ts  navigation.ts
  messages/    en.json  de.json  fr.json          # UI strings only
  data/
    axes.ts  indices.ts  spectrums.ts  eras.ts  rubric.ts
    questions/ bank.ts  text.en.ts  text.de.ts  text.fr.ts
    ideologies/<id>.ts   countries/<iso2>.ts   regimes/<id>.ts
    figures/<id>.ts      parties/<iso2>/<id>.ts
  lib/
    engine/      # PURE — see §6
    schema/      # zod schemas + inferred types for all content
    catalog/     # typed accessors, localized slug maps, search index
    storage/     # IndexedDB repositories (client)
    sync/        # client crypto + API client
    server/      # server-only: db, auth tokens, rate limit, crypto peppers
    seo/  flags.ts  format/
  components/  ui/ test/ results/ compass/ charts/ dashboard/ explorer/ share/
  db/          schema.ts  migrations/
  scripts/     validate-data.ts  build-derived.ts  check-sources.ts  fetch-commons.ts
  generated/   # build outputs (PCA, τ calibration, neighbours, web layout) — gitignored
  public/img/  figures/ (self-hosted, optimized Commons images)
  tests/e2e/
  docs/        content-style.md  scoring.md  adding-content.md
```

Scripts: `npm run check` = `lint && typecheck && validate && test`. `prebuild` runs
`validate-data` then `build-derived`. `npm run e2e` runs Playwright against `next build && next start`.

---

## 4. Routing & i18n

- Locales `en` (default), `de`, `fr`. `/` negotiates via `Accept-Language` and redirects. No locale
  cookie (D-025).
- Static route segments are localized with next-intl `pathnames`. Dynamic values (mode names,
  entry slugs) are localized through our own maps in `/data`, so the language switcher and
  hreflang always point to the matching entry and not a translated string guess.
- Slugs are ASCII `[a-z0-9-]`, unique per locale per catalog (validator-enforced).

| Page | en | de | fr |
|---|---|---|---|
| Test | `/en/test/standard/12` | `/de/test/standard/12` | `/fr/test/standard/12` |
| Mode slugs | quick · standard · deep | schnell · standard · vertieft | rapide · standard · approfondi |
| Own results | `/en/results` | `/de/ergebnisse` | `/fr/resultats` |
| Shared result | `/en/results/<code>` | `/de/ergebnisse/<code>` | `/fr/resultats/<code>` |
| Compare | `/en/compare/<code>` | `/de/vergleich/<code>` | `/fr/comparer/<code>` |
| Dashboard | `/en/dashboard` | `/de/verlauf` | `/fr/tableau-de-bord` |
| Compass | `/en/compass` | `/de/kompass` | `/fr/boussole` |
| Web view | `/en/web` | `/de/netz` | `/fr/reseau` |
| Sandbox | `/en/sandbox` | `/de/sandkasten` | `/fr/bac-a-sable` |
| Ideologies | `/en/ideologies/<slug>` | `/de/ideologien/<slug>` | `/fr/ideologies/<slug>` |
| Countries & regimes | `/en/countries/…` | `/de/laender/…` | `/fr/pays/…` |
| Figures | `/en/figures/…` | `/de/persoenlichkeiten/…` | `/fr/personnalites/…` |
| Parties | `/en/parties/…` | `/de/parteien/…` | `/fr/partis/…` |
| Method / Privacy / Imprint | `method` `privacy` `imprint` | `methode` `datenschutz` `impressum` | `methode` `confidentialite` `mentions-legales` |

Results anchors are localized too (e.g. `#axes` / `#achsen` / `#axes`, `#parties` / `#parteien` /
`#partis`). They're defined in `messages/*.json` under `anchors.*`.

**DE/FR before Phase 9:** the UI strings ship in all three locales from Phase 1, but questions and
catalog content start out English-only. Until a locale's content is complete, its pages render
with an "English content, translation in progress" notice and are `noindex` and left out of the
sitemap. The validator only requires completeness for locales flagged `contentComplete` (D-027).

---

## 5. Data model (zod schemas in `lib/schema`)

### 5.1 Axes

Sign convention: **the first-named pole is −100 and the second is +100**, exactly as in the brief.

| # | id | −100 | +100 | Measures | Explicitly NOT in this axis |
|---|---|---|---|---|---|
| 1 | `distribution` | Equality | Markets | How far the state should shape economic outcomes (taxes, transfers, wage rules, regulation) vs. leaving them to markets | Who owns firms (→2), trade (→3) |
| 2 | `ownership` | Collective | Private | Who should own productive assets: firms, land, infrastructure (state, cooperative, commons vs. private) | Redistribution (→1) |
| 3 | `trade` | Protectionism | Free trade | Openness to cross-border goods, services and capital | Migration of people (→12), sovereignty (→10) |
| 4 | `liberty` | Liberty | Authority | Scope of state power over individual life: speech, privacy, policing, personal choices | Who rules (→6), where power sits (→5) |
| 5 | `centralization` | Centralized | Decentralized | Vertical location of power: national vs. regional/local (subsidiarity, federalism) | Scope of power (→4) |
| 6 | `participation` | Direct democracy | Rule by elites/experts *(rename proposed, D-005)* | Who should make collective decisions: the many directly vs. a qualified few | Scope (→4) |
| 7 | `tradition` | Progressive | Traditional | Attitude to social change: family, gender roles, inherited norms | Religion's public role (→8) |
| 8 | `religion` | Secular | Religious | Role of religion in law, schools and public life | Personal faith, social change in general (→7) |
| 9 | `ecology` | Growth | Ecological sustainability | Priority when growth and ecological limits conflict | Ownership (→2) |
| 10 | `nation` | Nationalism | Globalism *(rename proposed)* | Primacy of the nation-state and national identity vs. supranational institutions and shared sovereignty | Migration (→12), war (→11) |
| 11 | `intervention` | Interventionist | Non-interventionist *(rename proposed)* | Willingness to use military or coercive power abroad | Trade (→3), identity (→10) |
| 12 | `borders` | Open | Closed borders | How freely people should be able to move and settle across borders | Trade (→3) |

Each axis stores: id, pole labels (short + long, per locale), definition, boundary notes, two
pole glyphs (original SVG), a category (`economic | governmental | societal | diplomatic`) and
rubric anchors (§5.6).

**Independence check:** `scripts/build-derived.ts` reports the correlation matrix of catalog
coordinates and warns when any |r| > 0.8. Ideologies cluster naturally, so this is a warning
and not a failure. Once opt-in community data exists, an item-level factor analysis replaces it.

### 5.2 Questions

```ts
Question = {
  id: 'q-dist-04',            // stable forever; never change the meaning of an id
  axis: AxisId,
  key: 1 | -1,                // agree pushes toward +100 (1) or −100 (−1)
  weight: number,             // default 1; reserved for later IRT discrimination estimates
  order: number,              // position in the single ordered bank (modes are prefixes)
  mirrorOf?: QuestionId,      // opposite-keyed near-opposite item, for contradiction checks
  retired?: true,             // kept for recomputing old results, never shown again
}
QuestionText[locale][id] = { text: string, explainer: string }   // explainer defines terms only, never direction
```

- **Nested prefixes (D-009):** the bank is one ordered list. Quick = items 1–36, Standard = 1–72,
  Deep = 1–144. So `/test/deep/40` asks the same question as `/test/standard/40`, and finishing
  Quick can be followed by an explicit, optional "36 more questions to sharpen this". No hidden
  extra phases.
- **Per-axis composition:** Quick 3/axis, Standard 6/axis, Deep 12/axis. Keying in Standard is
  3+/3− and in Deep 6+/6−. Quick can't reach ≥40% per axis with 3 items, so it alternates 2+/1−
  and 1+/2− across axes (18/18 overall), and the scoring neutralizes the imbalance (D-008).
- **Order:** axes interleave round-robin within each block, so no axis gets two items in a row
  and mirror pairs sit at least 8 items apart.
- **Validator rules:** counts per axis per mode; keying balance; ≥1 mirror pair per axis in
  Quick; ≤25 words; lint for absolutes (`all`, `every`, `never`, `always`, `no … ever`), for
  conjunctions that suggest double-barrelling (flagged for review, not failed), and for a
  loaded-terms denylist (`globalist`, `elites` used pejoratively, `regime` for democracies,
  US-specific institutions and parties).
- **Time shown up front:** Quick 36 (~5 min), Standard 72 (~10 min), Deep 144 (~20 min), based on
  ~8 s per item. The optional profile step is listed separately ("+1 min, optional").

### 5.3 Catalog entries (shared base + per-kind fields)

```ts
EntryBase = {
  id: string,                                   // stable, ASCII
  kind: 'ideology' | 'country' | 'regime' | 'figure' | 'party',
  slugs: Record<Locale, string>,
  names: Record<Locale, string>, aka?: Record<Locale, string[]>,
  coords: Record<AxisId, number>,               // −100..100, all 12 required
  salience: Record<AxisId, number>,             // 0..1, all 12 required; ≥1 axis ≥ 0.8
  rationale: Record<Locale, string>,            // short "why these coordinates"
  axisNotes?: Partial<Record<AxisId, Record<Locale, string>>>,
  sources: Source[1..3],                        // see D-031
  prominence: 1 | 2 | 3 | 4 | 5,                // label priority, search rank
  sensitivity: 'standard' | 'extremist' | 'perpetrator',  // drives guardrails (D-030)
  estimate: boolean,                            // true ⇒ "editorial estimate" label (living people, current parties, modern countries)
  review: { status: 'draft' | 'reviewed', by: string, date: string },
}
Source = { title, publisher, url, kind: 'encyclopedia' | 'academic' | 'dataset' | 'primary', accessed: ISODate }

Ideology = EntryBase & {
  spectrum: SpectrumId, secondary?: SpectrumId[], classificationNote?: Record<Locale,string>,
  content: Record<Locale, {
    summary, voice,                 // voice is third-person for sensitivity ≠ 'standard' (D-030)
    coreBeliefs: string[3..7], origins, keyThinkers: {name, years, note}[],
    historicalExamples: string[], criticisms: {point, from}[2..6],   // REQUIRED for every ideology
  }>,
  era?: { from: number, to?: number },
  avatar: { seed: string, motif: MotifId },     // procedural original SVG (D-033)
}
Country = EntryBase & { iso2, asOf: ISODate, government: Record<Locale,string>, content … }
Regime  = EntryBase & { period: {from, to}, asOf: ISODate, successorOf?, content … }
Figure  = EntryBase & { born, died?, living, roles, countries: iso2[], image?: CommonsImage, books?: Book[], content … }
Party   = EntryBase & { country: iso2, active: boolean, asOf: ISODate, family?: string, content … }
CommonsImage = { file, sourceUrl, author, license, licenseUrl, attribution }   // filled by script, never by hand
Book = { title, author, year, isbn?, links: { openLibrary?, affiliate? { url, program } } }
```

Semantic validator rules (beyond the shapes):

- slugs unique per locale
- every required locale field is present
- ideologies have ≥2 criticisms
- living figures, current parties and modern countries carry `estimate: true`
- `sensitivity !== 'standard'` ⇒ promotional-language lint (glorifying adjectives, slogans as headings, imperatives in `voice`) plus a mandatory "documented harms" section
- **minimum separation:** any two entries of one kind must sit at least 10 points apart (weighted RMS) unless one declares `siblingOf`
- spectrum vs. the rule-based classifier: a disagreement requires a `classificationNote` (D-029)
- images must have a license on the allowlist
- source URLs must be well-formed (they're checked for liveness in a separate CI job and not at build time)

### 5.4 Spectrums, indices, eras

- `spectrums.ts` holds the 8 spectrums (left, radical left, centre, right, far-right, third
  position, libertarian, anarchist), each with a definition and colour tokens. A possible 9th is
  in D-029.
- `indices.ts` holds the 4 derived indices as explicit sign vectors (D-015), so the formulas are
  documented as data.
- `eras.ts` holds era bins for the "most compatible era" timeline.

### 5.5 Versions

- `ENGINE_VERSION` (semver, `lib/engine/version.ts`), bumped by hand. Golden-fixture tests fail
  when engine output changes without a bump.
- `CATALOG_VERSION` = date label plus a short content hash, generated by `build-derived`.
- `QUESTION_BANK_VERSION` follows the same pattern. Questions are retired and never deleted, so
  old answers stay scorable.

### 5.6 Coordinate rubric (built before any bulk content)

`data/rubric.ts` gives anchor positions per axis at −100 / −50 / 0 / +50 / +100, each with a
written description and 1–2 reference ideologies. Every content batch places entries
*relative to these anchors*, which keeps 600+ entries written by different subagents consistent.
You approve the rubric in Phase 2, before Phase 5 starts.

---

## 6. Scoring engine (`lib/engine`)

Modules: `answers` · `score` · `confidence` · `quality` · `indices` · `match` · `calibrate` ·
`insights` · `drift` · `project` · `codec` · `recompute` · `random` (seeded PRNG) · `version`.
Full formulas with worked examples go in `docs/scoring.md` and the README. The constants marked
*provisional* get tuned in Phase 2 against fixtures.

### 6.1 Answers → axis scores
- Raw `r ∈ {−2,−1,0,+1,+2}` (strongly disagree…strongly agree). **Skip is `null`**, which is
  different from neutral `0`. Skips are excluded and neutrals count.
- Keyed value `x = key · r / 2 ∈ [−1, 1]`.
- **Balanced-keying mean (D-008):** for axis *a*, let `F` be the answered +keyed items and `R` the
  answered −keyed items.
  `m_F = Σ_F w·x / Σ_F w`, and `m_R` likewise.
  `score_a = 100 · (m_F + m_R) / 2` if both are non-empty, otherwise `100 · m` over whichever is
  non-empty, with a confidence penalty.
  This is a weighted mean in which each keying direction carries equal total weight. With
  Standard/Deep (3/3, 6/6) and no skips it equals the plain weighted mean exactly. Someone who
  answers "agree" to everything gets `m_F = +0.5`, `m_R = −0.5`, so **score = 0 on every axis,
  by construction**, and the quality check flags them.

### 6.2 Confidence (per axis, 0–1, provisional)
`c_a = count · consistency · balance`
- `count = n / (n + 2)`: Quick 0.60, Standard 0.75, Deep 0.86 with no skips
- `consistency = 1 − sd(x)` over answered keyed values (sd ≤ 1). Opposite answers on the same
  axis lower it.
- `balance = 0.8` if only one keying direction was answered, else 1
- Overall confidence = the mean of `c_a`, multiplied by the quality penalty (§6.3).

### 6.3 Quality & consistency (provisional thresholds)
| Flag | Rule | Effect |
|---|---|---|
| `straightline` | ≥80% of answered raw responses identical, or a run ≥70% of answered | low quality |
| `acquiescence` | \|mean raw r\| ≥ 1.2 over the balanced set | low quality |
| `contradiction` | a mirror pair whose keyed values differ by ≥1.5; ≥2 such pairs or ≥25% of answered pairs | low quality if ≥25%, plus per-axis notes |
| `fast` | median answer time < 1.2 s, or total < 1.5 s × items | low quality |
| `sparse` | >40% skipped | lower confidence only |

Per-axis **tension notes** fire when `consistency < 0.5` or a mirror pair on that axis contradicts:
"Your answers pull in opposite directions here." When quality is low, the results lead with that
message instead of a confident verdict. Low-quality results are excluded from dashboard trends by
default, and a toggle includes them.

### 6.4 Derived indices
`index_k = Σ_{a∈k} sign_a · c_a · score_a / Σ c_a`, with confidence weighting, in [−100, 100].
The sign vectors are proposed in D-015 (Economic `+ + +`, Governmental `+ − +`, Societal and
Diplomatic still need your call). A one-line "left-to-right" summary is allowed, but it's never a
replacement for the compass.

### 6.5 Matching
```
w_a  = c_a · (α + (1 − α) · σ_a)            α = 0.2  (salience floor; σ = entry salience)
d    = sqrt( Σ w_a (s_a − e_a)² / Σ w_a )    weighted RMS gap in axis points, 0..200
sim  = 100 · 2^(−(d / τ_k)²)                 Gaussian kernel; τ_k = distance where sim = 50%
```
- The salience floor stops entries with low salience from matching everyone. User confidence
  means barely-answered axes barely count.
- **Calibration (D-013):** `build-derived` fits one `τ_k` per catalog kind (ideologies, countries,
  regimes, figures, parties, people-to-people for friend compare). It uses a seeded synthetic
  population: 20k users, 70% catalog entries plus N(0, 25²) noise and 30% uniform in [−80, 80]¹².
  τ is chosen so the **median top-1 similarity is 75%**. Expected result: top-5 usually spans about
  75→55%, the furthest entry about 0–5%, and almost nobody gets five matches at 90%+. Percentile
  mapping was rejected because it pushes every top match to 95%+ (D-013).
- Displayed similarity is capped at 99%. When the top two are within 4 points, a note says
  "In between X and Y". Output: top 5, runner-ups 6–10, and the furthest.

### 6.6 Insights
- **Most unusual / most typical position:** for each axis, the 10 nearest ideologies on the
  *other 11* axes predict this axis (similarity-weighted). Unusual is the largest
  confidence-weighted residual (shown only if ≥25 points); typical is the smallest residual among
  axes where |s| ≥ 20. In plain words: "People who think like you elsewhere usually lean Closed
  on borders; you lean Open."
- **Eras:** similarity to historical regimes, aggregated per era bin (mean of the top 3), shown on
  a timeline with the peak marked.
- **Drift (dashboard):** total distance travelled (sum of consecutive *d*), the biggest per-axis
  movers first→last, a plain-words direction built from pole names, and stability =
  `100 · 2^(−mean step / 20)`. The text comes from deterministic templates with no AI.

### 6.7 Share code (`codec`)
23 bytes, base64url, giving 31 characters:
`ver(1) | mode+quality flags(1) | 12×int8 scores(12) | 12×4-bit confidences(6) | engineVersion(2) | crc8(1)`.
It holds scores only and never answers. Decode validates the CRC and version, and a bad code
gives a friendly 404.

### 6.8 Recompute
Stored results keep their answers, the versions used and the *as-taken* scores. When the engine
or bank version differs, `recompute` derives the current scores, and the UI offers
"As taken (v1.0)" / "Recomputed (v1.2)". Matches always use the current catalog, labelled with its
version.

### 6.9 Calibration tests (Vitest, Phase 2, then re-run whenever the catalog grows)
- **(a) Archetypes:** for every ideology, a synthetic respondent answers each Standard item as
  someone at that ideology's coordinates would (`r = round(2 · key · e_a/100)`). Pass: the archetype
  or a declared sibling is in the top 3 for **≥90% of ideologies**. There's also a noisy variant
  (20% of answers ±1, seeded) with a pass bar of ≥80%, and Quick is reported but not gated.
  *(This is my reading of "top 3 ≥ 90%", see open questions.)*
- **(b) Straight-liners:** all "agree", all "strongly agree" and all "disagree" each land at |score| ≤ 5
  on every axis, and each is flagged `straightline` and/or `acquiescence`.
- **(c) No inversions:** for every archetype, its best match ranks above every entry with an
  unweighted distance ≥120 from it, plus a curated list of opposite pairs.
- **Spread:** in the synthetic population, the median top-5 similarity falls in [45, 70] and fewer
  than 5% of users have ≥3 matches at ≥90%.
- Codec round-trip property tests, recompute idempotence, and golden fixtures pinned to `ENGINE_VERSION`.

---

## 7. Test UX

- `test/[mode]/layout.tsx` holds a client `TestProvider` (answers, timings, settings) that persists
  across `[n]` navigations. Every answer autosaves a draft to IndexedDB. Back/forward and deep
  links work because the question index lives in the route.
- **Fixed layout:** the answer stack is anchored to a fixed position (bottom-anchored on mobile),
  and the question area reserves the height of the longest item, so buttons never move. Skip is a
  separate, visually distinct control below the scale. The "?" explainer opens as an overlay and
  pushes nothing.
- **No priming:** no axis or pole labels appear anywhere during the test. Explainers define terms
  but never hint at direction.
- Keys: `1–5` answer, `0`/`S` skip, `←/→` back/next, `?` explainer. An advance-on-answer toggle
  (default on) waits 200 ms with a visible confirmation, and there's always an edit/back path. A
  progress bar is labelled with "12 / 72".
- The optional profile step at the end is clearly marked optional and skippable, and every list
  includes "Other" and "Prefer not to say" (D-037).
- Edit answers: from results, jump to any question. Results update on return.

---

## 8. Results page

SSR for shared codes. For your own result, an SSR shell is filled client-side from IndexedDB.
A sticky TOC (localized anchors) sits on desktop and becomes a collapsible chip bar on mobile.

1. **Summary:** top ideology and spectrum chip, overall confidence, "in between X and Y", mode and
   date, and a low-quality banner when relevant.
2. **12 axes:** slider-style bars with plain-language labels and confidence whiskers. Each has
   "What this measured", which reveals that axis's questions and your answers.
3. **Most unusual / most typical** cards.
4. **Radar** (SVG, SSR) and **4 category bars** (derived indices).
5. **Compass preview:** lazy-loaded, links to the full compass.
6. **Ideologies:** top 5 with 12-icon strips, runner-ups, furthest from you.
7. **Countries & regimes:** top and furthest, plus the **eras timeline**.
8. **Figures:** top and furthest, with book suggestions (Open Library links by default; affiliate
   links are optional, flagged and clearly disclosed, D-036).
9. **Parties:** locale-aware default country set plus a country picker.
10. **Uncertainty:** per-axis confidence, tensions, runner-ups, and a short "how to read this".
11. **Share & export:** copy link, PNG card, PDF (print stylesheet), JSON, and compare with a friend.
12. Edit answers · Sharpen (upgrade mode) · Dashboard.

All copy frames the result as an interpretation and never claims accuracy. Every chart has a text
alternative.

---

## 9. Modern compass (Phase 4 static → Phase 8 trail/playback)

- **Rendering:** Canvas 2D for the gradient field, density and points, with an SVG overlay for
  labels, axes and the focus ring. It redraws on demand, never in a continuous loop, and is
  DPR-aware. d3-zoom handles wheel, pinch and drag, and `d3-delaunay.find` handles hover and tap
  hit-testing. For 500–1,000 points Canvas 2D is comfortably 60 fps, so regl isn't needed (D-017).
- **Field:** a continuous gradient between the four corner tints, with no quadrant lines. A
  kernel-density layer (`d3-contour.contourDensity`, weighted by prominence) is recomputed when
  the axis pair or layers change, in a Worker if profiling says so.
- **Labels:** greedy collision-avoided placement by prominence, with level of detail by zoom, so
  more labels appear as you zoom in. It's recomputed at zoom end.
- **You:** an uncertainty *ellipse* whose radii come from the confidence on the X and Y axes.
  Past results form a fading trail with arrowheads, a time scrubber and a play button.
  Reduced-motion users get stepping instead of tweening.
- **Axis picker:** X and Y from the 12 axes, 4 indices or **Map**. A third channel (colour or size)
  can show any axis or index.
- **Map mode (D-016):** a PCA fitted at build time on the ideology catalog, using centred
  coordinates with the same scale on every axis. The loadings are stored, so users, countries,
  figures and parties all project the same way, and *your movement on the map is real movement*.
  The map shows "explains N% of the differences", and biplot arrows for the 12 axes can be
  toggled. The force-directed web view starts from the same PCA positions, which makes the map and
  the web one visual idea.
- **Small multiples:** 4 mini compasses, one per category, with the 3rd axis as dot size. Also
  12 mini number lines. Both are SVG and SSR-able.
- **Layers:** ideologies, countries & regimes, figures, parties and (opt-in) community. Filter by
  spectrum. Ghost-compare overlay for a friend or a figure.
- **A11y:** full keyboard support (Tab into the canvas, arrow keys move to the nearest point in a
  direction, Enter opens its card, `+`/`−`/`0` zoom), an aria-live summary ("You are closest to X
  and Y; you moved 14 points toward Liberty since March"), and a "Show as table" fallback.
  Light and dark themes are supported.
- **Export:** PNG drawn on an offscreen canvas, with labels and the trail.

---

## 10. Local history & dashboard (Phase 6)

**IndexedDB `spectrum` v1:**
- `results`: `{ id, createdAt, startedAt, mode, locale, answers{qid:{r,t}}, durations, engineVersion, bankVersion, catalogVersion, scoresAsTaken, confidences, quality, flags, note?, upgradedFrom?, syncedAt? }`
- `drafts`: one in-progress test per mode
- `settings`: theme, advance-on-answer, include-low-quality, profile (country)
- `badges`

**Dashboard:**
- **Header:** current ideology and spectrum, confidence, mode, date, and a deterministic retake
  suggestion (Quick → "36 more questions sharpen this"; older than 6 months → "retake to track
  drift"; low quality → "retake when you have 10 calm minutes").
- **Views:**
  - compass trail with scrubber and play
  - 12 sparklines with confidence bands
  - ideology timeline chips in spectrum colours
  - drift summary
  - compare any two results (radar overlay plus deltas)
  - private notes per result
  - milestones that are fun and never judgmental, with no "most extreme" style badges
- Superseded Quick results (upgraded to Standard) are hidden from trends by default.
- Export JSON/CSV and Delete everything work with zero setup (local), and extend to the server
  once synced.

---

## 11. Opt-in sync (Phase 7), no email, no IP identity

This design assumes the 🟡 **E2E-encrypted** option in D-020. If you reject it, the plaintext
fallback is described there.

- **Consent first:** a dialog explains in plain words what gets stored, where (EU), for how long,
  and how to delete it. Nothing is sent before the user ticks the box.
- **Create:** the client generates 128-bit entropy and shows it as a **12-word BIP39 phrase**,
  once, with copy and download (.txt) and an "I've saved it" confirmation. From the entropy it
  derives HKDF-SHA256 → `authSecret` (sent to the server) and `encKey` (AES-GCM-256, which never
  leaves the device and is stored as a non-extractable CryptoKey).
- **Server side:**
  - creates the profile and stores `HMAC(PEPPER, authSecret)`
  - sets the cookie `__Host-sp` (random 256-bit token; httpOnly, Secure, SameSite=Lax, Path=/,
    1 year, refreshed on use when older than 7 days)
  - stores `HMAC(PEPPER, token)` only
- **Sync:** results are encrypted client-side, and the server stores
  `{id, profileId, createdAt, ciphertext, nonce}`. The server **cannot read anyone's views**.
- **Restore:** enter the phrase on any device. It derives `authSecret`, the server looks it up and
  issues a new cookie token, and the client derives `encKey`, decrypts and merges by result id.
- **Delete everything:** deletes the profile, tokens and blobs (cascade), clears IndexedDB and
  expires the cookie, then shows a confirmation of what was removed.
- **Retention:** profiles inactive for **12 months** (🟡 D-024) are purged by a daily Vercel Cron.
  "Last seen" is stored at day granularity.
- **Abuse protection:** rate limit by `HMAC(dailySalt, ip)`, where the salt rotates daily and is
  derived and never stored. Rows expire within 24 h, live in a separate table and are never joined
  with profiles. **IP never appears in any profile or result table.**
- **Hardening:** mutations are POST/PUT/DELETE only, with an Origin check. No political data goes
  in query strings. The privacy page discloses that the host keeps short-lived request logs.

**DB tables (Drizzle):** `profiles`, `profile_tokens`, `result_blobs`, `rate_limits`, plus
`passkeys`, `ai_cache` and `community_points` in Phase 11.

---

## 12. Share, compare, OG (Phase 8)

- `results/[code]/opengraph-image.tsx` renders a 1200×630 card (top ideology, mini radar,
  spectrum colour, confidence). Entry OG images are rendered **on demand and cached**, not at
  build time (~2,000 images would slow every deploy, D-038). Fonts are loaded as TTF for satori.
- The PNG card download reuses the OG route. PDF uses the print stylesheet. JSON includes versions.
- The share dialog explains that the link contains the user's scores (not answers) and that the
  host may log it.
- **Friend compare:** `/compare/<code>` overlays their radar on your latest local result, with
  per-axis deltas and a compatibility score that uses the same kernel with the people-to-people τ.
- **Trail playback** on the compass and dashboard.

---

## 13. Explorer (Phase 10)

- **Catalog index pages:** server-rendered lists with search (a small prebuilt client index,
  lazy-loaded), filters (spectrum, kind, era, country, living/historical), and 12-icon strips.
- **One SSG page per entry per locale**, with metadata, JSON-LD (`DefinedTerm` for ideologies,
  `Person` for figures, `Organization`/`Country` as appropriate) and hreflang alternates.
- **Ideology page:** summary · voice · core beliefs · origins & key thinkers · historical examples
  · **main criticisms** · documented harms (when sensitive) · neighbours (computed) · coordinates
  with rationale · sources · "editorial estimate" label where applicable.
- **Web view:** d3-force kNN similarity graph (k = 5) seeded from PCA. The layout is computed at
  build and shipped as JSON; dragging is live. It can be filtered by spectrum and clicks through
  to pages.
- **Sandbox:** 12 sliders with live matches, using the engine in the browser.
- **Original SVG avatars:** procedural geometric emblems in spectrum tints (D-033).
- **12-icon strip:** each axis shows the glyph of the pole it leans to, with opacity set by
  strength × salience, and grey when near centre. It has an `aria-label` summary.

---

## 14. Content pipeline (Phase 5, subagents)

1. I write `docs/content-style.md` (tone, guardrails, the sensitive-entry template, the sources
   policy and a banned-phrase list) and the `rubric.ts` anchors, and you approve both.
2. **Generation:** subagents work in batches of about 12 entries, grouped by spectrum, and write
   one file per entry. Each runs `validate-data` before returning. They may only cite URLs they
   actually opened, on the allowlisted source types in D-031.
3. **Review:** a separate subagent cross-checks each batch's coordinates against the rubric and
   neighbouring entries and flags drift. I spot-check every batch and log borderline
   classifications in DECISIONS.md.
4. **Images:** `scripts/fetch-commons.ts` pulls Commons metadata via the API, fills in the
   license, author and attribution automatically (never typed by a model), rejects anything off
   the allowlist, and writes optimized AVIF/WebP to `public/img`.
5. **Order and size:**
   - ideologies 200+ (first ~24 anchors already exist from Phase 2)
   - historical regimes 50+
   - modern countries 150+
   - figures 150+
   - parties (CH/DE/AT/FR first, then the /en set)
6. **No copied prose.** Wikipedia and other encyclopedias are cited, never paraphrased closely.
   That keeps our text clear of CC BY-SA and copyright problems.

Content volume is the biggest risk to schedule and quality. The validator and the review pass
are what keep it honest.

---

## 15. Design (Phase 1)

- The look is warm cream with deep green, one sharp deep-red accent, strong display type, and
  tinted spectrum colours. A dark mode toggle defaults to the system setting, and the choice is
  stored in localStorage (not a cookie), with an inline script to avoid a flash.
- Phase 1 delivers a **design-system page** (type scale, colours, spectrum tints, 12-icon strip,
  buttons, cards, focus states) built with the frontend-design skill. Charts follow the dataviz
  skill. I'll show 2 type pairings for you to pick from.
- Mobile-first, with playful micro-interactions (answer press, chip morphs) and full
  `prefers-reduced-motion` support. There's no scroll-reveal that starts at `opacity:0`.
- Spectrum colours must pass WCAG AA when used as text and be distinguishable under the common
  colour-vision deficiencies. The deep-red accent is reserved for "you" and primary actions, so it
  isn't confused with a spectrum colour.

---

## 16. Quality bar & how it's enforced

| Bar | Enforcement |
|---|---|
| Lint + types + unit tests | `npm run check` passes before every phase commit |
| Data validity | `prebuild` validator, so the build fails on invalid data |
| Calibration | Vitest calibration suite, re-run whenever the catalog grows |
| E2E | Playwright smoke: home → Quick test via keyboard → results → dashboard → share link → `/de` localized slug, plus axe checks on each page |
| Lighthouse ≥95 | `@lhci/cli` against home, test, results, dashboard, catalog and detail pages (from Phase 3, gating in Phase 12). Content pages stay mostly RSC with a JS budget of ~120 KB gz per route, and the compass is lazy-loaded |
| SEO | per-page `generateMetadata`, canonical + hreflang + x-default, JSON-LD, `sitemap.ts` with alternates, per-page OG. `results/[code]`, `compare` and `dashboard` are `noindex` |
| Privacy | no third-party scripts, no analytics. CSP and security headers in Phase 12 |
| Docs | README covers scoring, adding axes, questions and entries, and running calibration |

---

## 17. Phases

Each phase ends with `npm run check` (+ e2e from Phase 3) green, a commit, a short summary, and a
list of decisions that need your input.

| # | Phase | Deliverables | Exit criteria |
|---|---|---|---|
| 0 | Plan | PLAN.md, DECISIONS.md | your approval |
| 1 | Scaffold, design system, i18n | Next 16 app, TS strict, Tailwind tokens, fonts, theme toggle, next-intl with localized pathnames (en/de/fr UI strings), layout shell, stub pages for every route, lint/format/Vitest/Playwright wiring, design-system page | `/en` `/de` `/fr` render with localized slugs; lint rule blocks string literals; check green |
| 2 | Engine, schemas, Quick questions, calibration | zod schemas for every content type; axes/spectrums/indices/rubric data; **36 Quick items EN** (plus the 36 Standard items if D-028 is approved); all engine modules; ~24 anchor ideologies (3 per spectrum); validator; calibration and golden tests; `docs/scoring.md` | calibration (a)(b)(c) and the spread tests pass on the anchor set; engine imports nothing outside itself |
| 3 | Test UI + results page | route-based test with autosave, keyboard, explainers, fixed layout, optional profile step; full results page against the anchor catalog (countries/figures/parties sections hidden behind flags until Phase 5) | e2e smoke passes; Lighthouse ≥90 interim |
| 4 | Modern compass (static) | canvas compass with density, labels, axis picker, map mode (PCA), small multiples, table fallback, keyboard | 60 fps pan/zoom on a throttled mid-range profile; axe clean |
| 5 | Catalogs | style guide plus 200+ ideologies → regimes → countries → figures → parties; Commons pipeline; source checker | validator green; calibration (a) ≥90% on the full catalog; borderline cases logged |
| 6 | Local history + dashboard | IndexedDB repositories, recompute/versioning, quality flags in trends, all 7 dashboard views, export/delete local | dashboard works offline with zero setup |
| 7 | Opt-in sync | Neon + Drizzle, consent flow, phrase, cookie, E2E blobs, restore, export, delete-everything, retention cron, rate limiting, privacy page | restore-on-new-device e2e; delete verified in the DB; no IP in any table |
| 8 | Share, compare, playback | share codes, OG images (result + entries), PNG/PDF/JSON, friend compare, trail playback | OG validated in a card debugger; codec property tests |
| 9 | Standard + Deep banks, DE/FR | Deep EN (+ Standard if not done in Phase 2); full DE/FR UI and content via translation subagents plus native-style review | `contentComplete` for de/fr; noindex removed |
| 10 | Explorer | catalog pages, search/filters, entry pages with JSON-LD, web view, sandbox, avatars | Lighthouse ≥95 on catalog and detail pages |
| 11 | Optional features | AI "explain my result" (flagged), community layer (flagged, k-anonymous), passkeys, PWA | everything off without env keys |
| 12 | Polish | perf, a11y, SEO audit, CSP, print stylesheet, privacy review hand-off | Lighthouse ≥95 on all six page types; WCAG AA |

A suggested **first public preview** comes after Phase 8. It'd be noindex, and only once the
D-042 privacy review starts.

---

## 18. Environment variables (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
DATABASE_URL=                 # Neon, eu-central-1 — only needed when FEATURE_SYNC=1
TOKEN_PEPPER=                 # 32+ random bytes, base64
RATE_LIMIT_SECRET=            # 32+ random bytes, base64
CRON_SECRET=
FEATURE_SYNC=0
FEATURE_AI=0
ANTHROPIC_API_KEY=            # optional; AI explain is off when absent
FEATURE_COMMUNITY=0
```

No secret is ever committed, and `.env*` is gitignored except `.env.example`.

---

## 19. Risks

| Risk | Mitigation |
|---|---|
| Content accuracy and perceived bias across 600+ entries | Rubric anchors, sources, a review subagent, "editorial estimate" labels, a public "suggest a correction" link (GitHub issue, no account data) |
| Political opinions are sensitive personal data (CH nFADP / GDPR Art. 9) | Local-first by default, E2E sync, no IPs, explicit consent, a real delete, and a professional review before launch (D-042) |
| Extremist content misused or illegal symbols (DE §86a StGB, AT) | Third-person "voice", required harms and criticisms, no symbols or flags in avatars, OG rules for sensitive entries (D-030) |
| Lighthouse ≥95 with heavy visuals | RSC-first, lazy compass, JS budgets, LHCI from Phase 3 |
| Next 16 API drift vs. model knowledge | Read the bundled Next docs before each feature that touches framework APIs |
| Scope (12 phases) | Every phase ships something usable, with a public preview after Phase 8 |
