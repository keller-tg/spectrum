# Decisions log

Each entry: **ID · status · decision · why**. Newest entries go at the bottom of their section.

Status legend
- ✅ **Brief:** fixed by the project brief, recorded for traceability
- 🟢 **Decided:** my call, reversible, tell me if you disagree
- 🟡 **Proposed:** needs your OK before the phase that depends on it
- 🔴 **External review:** needs a qualified human (legal/privacy) before launch

---

## A. Project & stack

**D-001 · 🟢 · Location & repo.** Standalone folder `~/spectrum` with remote
`github.com/keller-tg/spectrum`, branch `main`. The working title "Spectrum" appears only in
`messages/*.json` and metadata, so renaming is a one-file change.

**D-002 · 🟢 · Versions (npm, 2026-10-21).** next 16.4, react 19.2, next-intl 4.14,
tailwindcss 4.3, zod 4.6, drizzle-orm 0.45 / drizzle-kit 0.31, @neondatabase/serverless 1.2,
vitest 5.0, @playwright/test 1.64, idb 8, @scure/bip39 2.4. ESLint is pinned to whatever major
`eslint-config-next` 16.4 supports. npm is the package manager (pnpm/bun aren't installed).
**Why:** these are the current stable versions. Next 16 has breaking changes vs. older
knowledge, so its bundled docs are read before writing framework code.

**D-003 · 🟢 · Layout.** Root-level `app/ lib/ data/ components/` (no `src/`), matching the
brief's `/lib/engine` and `/data` paths.

**D-044 · 🟢 · Lint.** ESLint flat config with typescript-eslint strict, jsx-a11y,
`i18next/no-literal-string` (JSX and attributes in `app/` and `components/`), and
`no-restricted-imports` so `lib/engine` can't import React/Next/DOM. Prettier for formatting.

---

## B. Axes & questions

**D-004 · 🟢 · Axis IDs and sign.** IDs are `distribution, ownership, trade, liberty,
centralization, participation, tradition, religion, ecology, nation, intervention, borders`. The
first-named pole in the brief is −100 and the second is +100. Pole *labels* live in messages, so
renaming a pole never changes stored data.

**D-005 · 🟡 · Pole names.** The brief asks for clean, symmetric names that don't mix concepts.
Most poles meet that bar. Four don't, and I propose:

| Axis | Brief | Proposal | Why |
|---|---|---|---|
| 6 | Direct democracy ↔ Rule by elites/experts | **Rule by the many ↔ Rule by the few** (long form: "…the qualified few: experts, representatives, a vanguard or a crown") | "elites/experts" joins two different concepts, and "elites" is a loaded populist term. The many/few pairing is classic (Aristotle) and symmetric |
| 10 | Nationalism ↔ Globalism | **Nationalism ↔ Internationalism** | "globalist" is widely used as a slur, including an antisemitic one. Internationalism is the neutral, symmetric counterpart |
| 11 | Interventionist ↔ Non-interventionist | **Intervention ↔ Restraint** | "Non-" defines one pole as an absence. "Restraint" is the standard name for that position in international relations |
| 1 | Equality ↔ Markets | keep, with the tight definition in PLAN §5.1 | goal vs. mechanism is slightly asymmetric, but it's the clearest wording for most people. Alternative: Redistribution ↔ Laissez-faire |

Axis 12 stays "Open ↔ Closed" ("Restricted" is softer, but less clear).

**D-007 · ✅ · Scale.** Five points from strongly disagree to strongly agree, mapped to −2…+2.
Skip/unsure is a separate `null`, never merged with neutral 0.

**D-008 · 🟢 · Balanced-keying axis score.** The axis score is the mean of the +keyed mean and
the −keyed mean (each direction carries equal weight). It's identical to the plain weighted mean
whenever keying is balanced, which is true for Standard and Deep without skips. It makes
straight-liners land at exactly 0 even in Quick, where 3 items per axis can't be split ≥40/60.
**Trade-off:** in Quick, the single minority-keyed item on an axis carries half the weight. That's
acceptable because Quick is labelled lower-confidence and the "sharpen" path exists.

**D-009 · 🟢 · Modes are prefixes of one ordered bank.** Quick = 1–36, Standard = 1–72,
Deep = 1–144. This gives true nesting, stable URLs (`/test/deep/40` is the same question as
`/test/standard/40`) and an optional "36 more questions" upgrade that reuses existing answers.
The upgrade creates a new result linked by `upgradedFrom`.

**D-010 · 🟢 · Confidence (provisional).** `count × consistency × balance`, as in PLAN §6.2.
Constants are tuned in Phase 2 with fixtures and documented in `docs/scoring.md`.

**D-011 · 🟢 · Quality flags (provisional).** Straightline, acquiescence, contradiction, fast and
sparse, with thresholds as in PLAN §6.3. Low quality excludes a result from trends by default but
never hides it.

**D-028 · 🟡 · Standard EN moves into Phase 2.** The brief puts Standard + Deep in Phase 9 but
also says "write Quick + Standard in English first". I propose writing all 72 Standard EN items in
Phase 2. Balanced keying and the archetype calibration are much more meaningful at 6 items per
axis, and Phase 3's results page can then be tested properly. Deep EN and DE/FR stay in Phase 9.

**D-037 · 🟡 · Profile questions: country only.** Country sets the default party set. Religion
and other identity questions are special-category data and nothing in the product would use them
yet, so they're left out until a concrete feature (e.g. community stats) needs them. Every option
list includes "Other" and "Prefer not to say".

---

## C. Scoring, matching, maps

**D-012 · 🟢 · Distance.** Weighted RMS gap. Weight = user confidence × (0.2 + 0.8 × entry
salience). The 0.2 floor keeps narrowly defined entries from matching everyone.

**D-013 · 🟢 · Similarity: Gaussian kernel calibrated per catalog, not percentiles.**
`sim = 100·2^(−(d/τ)²)`, with τ fitted at build so the median top-1 match over a seeded synthetic
population is 75%. **Rejected: percentile/CDF rescaling.** A best match is by construction closer
than almost every other pair, so percentiles push top matches to 95%+, which is the problem the
brief wants fixed. Capped at 99%. "In between X and Y" appears when the top two are within 4 points.

**D-014 · 🟡 · Reading of calibration test (a).** I read "archetype in top 3 ≥ 90%" as "for ≥90%
of catalog ideologies, a noiseless synthetic respondent at that ideology gets it, or a declared
sibling, in their top 3 (Standard mode)". There's also a noisy variant at ≥80%, and Quick is
reported but not gated. Near-duplicate ideologies are prevented by a minimum-separation rule or
must declare `siblingOf`.

**D-015 · 🟡 · Derived index signs.** Indices are confidence-weighted means with explicit signs:

| Index | Axes & signs | Reads as | Status |
|---|---|---|---|
| Economic | +1, +1, +1 | Collective ↔ Market | 🟢 coherent |
| Governmental | liberty +1, centralization **−1**, participation +1 | Dispersed ↔ Concentrated power | 🟢 coherent (centralized, authoritarian and rule by the few all concentrate power) |
| Societal | tradition +1, religion +1, ecology **−1** | Progressive ↔ Traditional | 🟡 This treats "growth" as the traditional side, which matches today's alignment but not historical green conservatism. Alternative: ecology at +1 (Change ↔ Preservation) |
| Diplomatic | nation **−1**, intervention +1, borders +1 | Cosmopolitan ↔ Sovereigntist | 🟡 Counts restraint as sovereigntist (respecting sovereignty) and intervention as cosmopolitan (responsibility-to-protect style). Imperial nationalism ends up mid-scale. Alternative: drop axis 11 from the index (weight 0) |

**D-016 · 🟢 · Map = PCA, not UMAP.** PCA is linear and deterministic, needs no seed, and projects
any new point (you, a country, a past result) exactly. Your trail on the map is therefore real
movement. It shows "% of differences explained" honestly and allows biplot arrows. UMAP gives
nicer clusters but distorts global distances, and new points can only be approximated. The
force-directed web view starts from the PCA positions so the two views match.

**D-017 · 🟢 · Compass: Canvas 2D + d3 modules, no regl.** 500–1,000 points is well within Canvas
2D's 60 fps range. SVG is used only for labels, axes and focus. regl's extra weight and complexity
aren't needed.

**D-018 · 🟢 · Result codes and URL privacy.** A 31-character base64url code carries scores,
confidences, mode, flags and engine version, and never answers. **Your own results live at
`/en/results` and are read from IndexedDB, with no code in the URL.** A code appears in a URL only
when you press Share, because hosting logs record paths. The share dialog says so.

---

## D. Storage, sync, privacy

**D-019 · 🟢 · Local storage: IndexedDB (`idb`).** Holds results, drafts, settings and badges.
If IndexedDB is unavailable (some private modes), it falls back to in-memory with a visible notice.

**D-020 · 🟡 · Sync is end-to-end encrypted.** The recovery phrase's entropy derives two keys: one
authenticates to the server and one encrypts results, which stays on the device. The server
stores only ciphertext and can't read anyone's political views, which is a strong position for
sensitive data and simplifies the privacy review. Recompute already runs client-side, so nothing
is lost server-side.
**Costs:** server-side analytics on synced data become impossible, which is intended since
community stats are a separate opt-in. A passkey can only restore data if the browser supports the
WebAuthn PRF extension (D-041). Lose both the phrase and the device and the data is gone, which is
already true under the brief's design.
**Plaintext fallback, if you prefer:** scores and answers stored in plaintext (encrypted at rest by
the provider), same tables minus the crypto.

**D-021 · 🟡 · Phrase format: BIP39 English wordlist, 12 words, in every locale.** It gives 128
bits of entropy plus a checksum that catches typos, and the library is audited. Official BIP39
lists exist for French but not German, and one list everywhere means a phrase works in any
language UI. Since the entropy is 128-bit, HMAC-SHA256 with a server pepper is enough (no slow KDF
needed).

**D-022 · 🟢 · Rate limiting.** A key of `HMAC(HMAC(RATE_LIMIT_SECRET, date), ip)` rotates daily
and the salt is never stored. Rows live in a separate Postgres table that's purged within 24 h and
never joined with anything. Vercel WAF rate rules are a possible later add-on.

**D-023 · 🟢 · Neon (EU, Frankfurt) + Vercel `fra1`.** Serverless Postgres with a Vercel
integration and EU data residency. Supabase's auth and storage aren't needed.

**D-024 · 🟡 · Retention: delete profiles after 12 months of inactivity.** Matches the ~1-year
cookie. Documented on the privacy page and enforced by a daily cron.

**D-025 · 🟢 · No locale cookie, theme in localStorage.** Keeps the promise that the only cookie
is the optional profile cookie. The locale is always in the URL.

**D-042 · 🔴 · Swiss/EU privacy review before launch.** Political opinions are *sensitive personal
data* under the Swiss nFADP/revDSG and *special-category data* under GDPR Art. 9, so explicit
consent and a plain-language privacy page are required. The review also needs to cover:
- the controller identity and an **Impressum** (required for German-facing sites, and arguably
  "commercial" once affiliate links exist)
- hosting/request logs at Vercel
- sending scores to Anthropic for the optional AI feature (a processor, needs consent)
- the community layer's anonymity claims
- retention
- whether E2E blobs are still personal data (they likely are)

The review must happen before any public, indexed launch.

---

## E. Catalog & content

**D-026 · 🟢 · Slugs.** ASCII only (`ä→ae`, `ß→ss`, accents stripped) and unique per locale. The
route table is in PLAN §4. DE/FR route names are my proposals and get reviewed in Phase 9.

**D-027 · 🟢 · DE/FR gating.** UI strings ship in all three locales from Phase 1. Content locales
stay `noindex`, with a notice, until they're marked `contentComplete`.

**D-029 · 🟡 · Spectrum taxonomy & classification.** Each entry gets one primary spectrum plus
optional secondary tags. A rule-based classifier on the coordinates proposes a spectrum, and a
disagreement with the editorial choice requires a written `classificationNote`. Umbrella labels
that cover incompatible currents get split into separate entries (accelerationism, monarchism,
populism, Zionism, Islamism and so on).
**Open:** theocratic/religious-political ideologies (e.g. Khomeinism, Christian theonomy,
Salafism) fit poorly in any of the 8. Options: (a) put them in right/far-right with a note,
(b) **add a 9th spectrum, "theocratic"** (my recommendation; the brief says "~8"), (c) tags only.

Initial borderline cases (proposals, reviewed again in Phase 5):

| Entry | Proposed | Alternative | Note |
|---|---|---|---|
| Anarcho-capitalism | libertarian | anarchist | Self-identifies as anarchist, but most anarchist traditions reject it. The page states both |
| Fascism | far-right | third position | Self-described "third way"; scholarly consensus classifies it far-right. Follow the consensus and note the self-description |
| National bolshevism, Strasserism | third position | far-right | Explicitly synthesize far-left economics with ultranationalism |
| Ecofascism | far-right | third position | |
| Peronism | third position | centre / left | Perón's "Third Position" meant non-alignment between capitalism and communism. The page must distinguish it from post-war neo-fascist third positionism. Left- and right-Peronist variants may become separate entries |
| Ba'athism | third position | radical left | Arab socialism + pan-Arab nationalism + one-party rule |
| Juche | radical left | third position | Marxist-Leninist lineage but nationalist "self-reliance" doctrine and dynastic succession |
| Kemalism | centre | right | Secular republican nationalism with statist economics. Fits neither side cleanly |
| Christian democracy, ordoliberalism | centre | right | Centre-right in most of Europe. "Centre" here means broadly moderate on economics and society |
| Distributism | centre | right | Catholic "third way" with no authoritarian element |
| Democratic confederalism (Öcalan/Bookchin lineage) | radical left | anarchist | Grew out of libertarian municipalism but rejects the anarchist label |
| Technocracy, transhumanism | centre | — | Defined mainly by 1–2 axes, with low salience elsewhere |
| Neoreaction | far-right | right | Anti-democratic, monarchical/corporate sovereignty |
| Monarchism | split: absolute (far-right) / constitutional (right or centre) | — | |
| Accelerationism | split: left (radical left) / right (far-right) / e/acc (libertarian) | — | One label, incompatible currents |
| Classical liberalism | centre | libertarian | |

**D-030 · 🟡 · Guardrails for sensitive entries.**
- `sensitivity: 'extremist'` (fascism, national socialism, ecofascism, third positionism, …):
  - the encyclopedic "voice" is written in the *third person* ("Adherents hold that…"), never as
    first-person persuasion
  - there's a mandatory "documented harms" section plus criticisms
  - slogans are named only where historically necessary, quoted in context, never used as headings
- **No symbols, flags, uniforms or emblems** in avatars or images for any entry. Some symbols are
  criminal offences to display in Germany (§86a StGB) and Austria, and abstract emblems avoid the
  issue everywhere.
- 🟡 **Figures responsible for genocide or mass atrocities** (`sensitivity: 'perpetrator'`) stay in
  the catalog for education. When one appears in your matches, it comes with a context note and
  **never appears on share cards or OG images**: the card shows your top non-perpetrator figure, or
  no figure at all. Alternative: exclude them from matching entirely.

**D-031 · 🟢 · Sources.** 1–3 per entry, limited to these types:
- encyclopedias (Stanford Encyclopedia of Philosophy, Internet Encyclopedia of Philosophy,
  Britannica, Wikipedia)
- academic works
- datasets (e.g. V-Dem for regimes, the Chapel Hill Expert Survey for European parties)
- primary documents (party programmes, constitutions)

Subagents may cite only URLs they actually opened. A CI link checker runs separately from the
build. Prose is never copied from sources: it's original text, cited. Dataset licences (V-Dem is
CC BY-SA; CHES terms) need a check before their numbers inform coordinates.

**D-032 · 🟢 · Images.** Wikimedia Commons only (or our own illustrations). Licence allowlist: PD,
CC0, CC BY, CC BY-SA. Metadata comes from the Commons API, so licence fields are never written by a
model. Self-hosted optimized copies avoid hotlinking and image-optimization quotas.

**D-033 · 🟢 · Avatars.** Procedural, original geometric SVG emblems (seed + motif + spectrum tint),
with hand-tuning for prominent entries. No characters, no ball mascots, no real-world symbols.

**D-034 · 🟢 · What a country's coordinates mean.** The *policy regime in force* (laws,
institutions, government programme) as of a stated date, not the population's opinions.
Historical regimes cover a stated period. Every modern country is labelled an editorial estimate.

**D-035 · 🟡 · Party sets per locale.** /de: CH, DE, AT. /fr: CH, FR (Belgium and Luxembourg
later?). /en: 🟡 proposed UK, IE, US, CA, AU, NZ plus European Parliament groups. A country picker
is always available, and the optional profile country overrides the default. Only real registered
parties: no militias or armed wings.

**D-036 · 🟡 · Books: Open Library links at launch, affiliate off.** Affiliate programmes come with
eligibility, tax and disclosure obligations and push the site toward "commercial" for Impressum
purposes. The data model already supports affiliate links behind a flag with a visible disclosure.

**D-043 · ✅ · Reference site.** Used only for the mood described in the brief. None of its code,
text, questions or data was fetched or used.

**D-045 · 🟢 · Spectrum colours.** Muted tints decided in Phase 1, checked for AA contrast and
colour-vision deficiencies. Deep red is reserved for "you" and primary actions, so the left
spectrum gets a different hue (e.g. madder or rose) and not the accent.

---

## F. Rendering & sharing

**D-038 · 🟢 · OG images.** Generated on demand and cached long-term per catalog version, not
prebuilt (~2,000 images would add minutes to every build).

**D-039 · 🟢 · PDF.** Print stylesheet + `window.print()`. No heavy PDF library in the bundle.

**D-040 · 🟢 · AI "explain my result" (Phase 11).** Uses the current Haiku model. The Claude Code
environment lists `claude-haiku-5-5`, to be re-verified against Anthropic docs at implementation
time. It sends rounded axis scores only, asks for consent first ("sends your scores to Anthropic"),
is labelled AI-generated, cached by rounded inputs, rate-limited, and off when there's no key.

**D-041 · 🟢 · Passkeys (Phase 11).** SimpleWebAuthn as an *additional* way into the anonymous
profile. Under E2E (D-020), the passkey's PRF output wraps the encryption key. Without PRF
support, the phrase is still needed to decrypt.

---

## G. Open questions not yet decided

- **"Direct-democratic confederalism"** in the brief's catalog list: did you mean (a) Öcalan/Bookchin
  democratic confederalism, (b) Swiss-style semi-direct, confederal democracy as a political
  tradition, or (c) both as separate entries? My recommendation is (c).
- **German orthography for /de:** standard German with ß (DE/AT majority) or Swiss "ss"? My
  recommendation is ß, keeping the Swiss parties prominent.
- **Domain name and Vercel account/team** for deployment (needed by Phase 7, ideally by Phase 3 for
  preview deploys).
