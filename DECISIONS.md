# Decisions log

Each entry: **ID · status · decision · why**.

Status legend
- ✅ **Spec:** fixed by Master spec v2, recorded for traceability
- 🟢 **Decided:** my call, reversible, tell me if you disagree
- 🟡 **Proposed:** waiting for your input (asked in chat)
- 🔴 **RED, external review:** needs Swiss/EU privacy and legal review before launch

---

## 0. Changes from spec v1 → Master spec v2 (2026-10-21)

| Area | v1 / Phase-0 plan | v2 (now) | Entries |
|---|---|---|---|
| Ideology count | 200+ | **300+**: Tier A ~120 with full pages first, then Tier B ~180+ under the same gates | D-046 |
| Spectra | 8 (9th proposed) | **9** including *theocratic*, strictly for religious law or clerical rule as the basis of the state | D-029 |
| Hierarchy | flat with optional `siblingOf` | **family → ideology → variant** (`family`, `parent`) | D-047 |
| Label honesty | — | `labelStatus` (self-described / academic / contested) + `termOrigin`, and a name note for contested terms | D-048 |
| Placement confidence | — | high / medium / low with a reason, shown on pages and in results | D-049 |
| Sources | 1–3 | **≥ 2** for every entry | D-031 |
| Inclusion | — | real adherents or real literature; `online-satirical` tag hidden from matching; near-duplicates become aliases or variants | D-050 |
| Pole names | proposal | **adopted:** Rule by the many ↔ the few; Nationalism ↔ Internationalism; Interventionist ↔ Restraint; one tooltip per pole | D-005 |
| Quick weighting | balanced-keying mean | spec now *requires* equal agree-side and disagree-side weight per axis, with all-agree = **exactly 0 in every mode** | D-008 |
| Standard EN | proposed for Phase 2 | **adopted:** 36 Quick + 72 Standard EN in Phase 2, then stop for review | D-028 |
| Profile questions | country (proposed) | **country only**, no religion | D-037 |
| Category indices | editorial sign vectors | **PCA per category over the catalog**, oriented by the first-listed pole; loadings and EV shown; EV < 50% shows the 3 axes instead | D-015 |
| Similarity curve | Gaussian, τ calibrated | same curve, now explicitly a **placeholder** to re-tune on real community data | D-013 |
| Match display | top 5 | **closest family / ideology / variant**, top 5 de-duplicated; low-confidence placement never the headline if a medium/high one is close | D-051 |
| Calibration | noiseless archetypes, ≥ 90% top 3 | **noisy simulations at several levels, all modes, strict + family numbers**. Gates: Deep top 3 ≥ 90%, Standard top 3 ≥ 80%, Quick top 5 or same family ≥ 80% | D-014 |
| Sensitive figures | "perpetrator" flag for figures | **one atrocity-context policy for every entry kind**, with a tribunal/consensus criterion | D-030 |
| Sync | E2E proposed | **E2E adopted**; phrase is the baseline with a blunt warning; passkey PRF is a bonus, never promised | D-020, D-041 |
| Community layer | opt-in stats | **separate, explicit, unlinked submission**, never derived from synced profiles | D-052 |
| German | ß vs ss open | **standard German with ß**; `/de-ch` later via build-time ß→ss + Swiss vocabulary list | D-053 |
| Parties | CH/DE/AT for /de, CH/FR for /fr | **UK, IE, US, CA, AU, NZ + EP groups first**; CH/DE/FR/AT later; many-to-many ideology tags; "as of" date; README refresh guide | D-035 |
| Reference entries | Ocalan vs Swiss question | **all three as separate entries:** Democratic confederalism, Libertarian municipalism, Semi-direct federal democracy (Swiss model, reference country Switzerland) | D-054 |
| Content review | reviewer subagent per batch (plan) | **mandatory second reviewer subagent per batch** | D-055 |
| Hosting | domain open | `https://spectrum-six-rho.vercel.app` for now; preview deploys from Phase 3; final domain before Phase 7; Vercel team still to be filled in | D-001 |
| Phases | 9 = Standard + Deep, DE/FR | 9 = **Deep, FR, DE, then /de-ch**; stop after Phase 2 | — |

Superseded: the Phase-0 open questions about pole names, Standard timing, E2E, the theocratic
spectrum, perpetrator figures, index signs, Ocalan/Swiss, ß/ss, /en parties and profile questions.
The spec answered them all.

---

## A. Project & stack

**D-001 · 🟢 · Location, repo, hosting.** Folder `~/spectrum`; remote `github.com/keller-tg/spectrum`
(**public**), branch `main`. Commits use the GitHub noreply address. Domain for now:
`spectrum-six-rho.vercel.app` (it currently returns Vercel 404, so no deployment exists yet).
**Still open:** which Vercel team/account, and the final domain (before Phase 7).

**D-002 · 🟢 · Versions (npm, 2026-10-21).** next 16.4, react 19.2, next-intl 4.14, tailwindcss 4.3,
zod 4, vitest, @playwright/test 1.64. ESLint is pinned to the major that `eslint-config-next`
supports. Package manager is npm.

**D-003 · 🟢 · Layout.** Root-level `app/ lib/ data/ components/`, matching the spec's
`/lib/engine` and `/data`.

**D-044 · 🟢 · Lint.** ESLint flat config: next core-web-vitals + TypeScript,
`i18next/no-literal-string` in `app/` and `components/`, and `no-restricted-imports` fencing
`lib/engine`. Prettier.

**D-056 · 🟢 · English spelling: British/international** (centre, organise, labour) for all
English copy and questions. It reads naturally to a European and Commonwealth audience and is
widely understood elsewhere.

**D-057 · 🟢 · Cache Components off.** Next 16.4 scaffolds with `cacheComponents: true`, but
next-intl documents static rendering through `generateStaticParams` + `next/root-params` and says
nothing about Cache Components. Every page is plain SSG/ISR, which is all the app needs.
Revisit if next-intl documents support.

**D-058 · 🟢 · Fonts.** Bodoni Moda (display, optical-size axis) + Schibsted Grotesk (text/UI),
self-hosted via `next/font`. Only the `latin` subset is preloaded (it covers en/de/fr); latin-ext
loads on demand. The italic display face is a separate, non-preloaded face, since it sets only
words of emphasis.

**D-059 · 🟢 · String-literal lint.** `i18next/no-literal-string` in `jsx-text-only` mode plus a
`no-restricted-syntax` rule for `aria-label`/`alt`/`title`/`placeholder` literals. The plugin's
`jsx-only` mode flagged translation-call arguments and class names, which made it useless.

**D-060 · 🟢 · Lighthouse measurement.** On localhost, Lighthouse's simulated mobile LCP (≈3.1 s,
perf 94) is dominated by Next's baseline JS, because everything loads before the 78 ms observed
LCP. The ≥ 95 gate is measured against the Vercel preview from Phase 3 onwards, not localhost.
Accessibility, best practices: 100.

---

## B. Axes & questions

**D-004 · 🟢 · Axis IDs and sign.** IDs are `distribution, ownership, trade, liberty, centralization,
participation, tradition, religion, ecology, nation, intervention, borders`. The first-named pole
is −100. Pole labels live in localized data, so renaming one never changes stored results.

**D-005 · ✅ · Pole names (spec v2)** as listed in PLAN §5.1, each with a one-line tooltip written so
people who hold that view would accept it.
*Note:* restrictionists often describe themselves as wanting "controlled" rather than "closed"
borders. The tooltip for **Closed** therefore reads "strict limits on who may enter and settle",
and the label stays as the spec says. The label could become "Controlled" if testers object.

**D-007 · ✅ · Scale.** 5 points mapped to −2…+2; skip/unsure is a separate `null`.

**D-008 · ✅/🟢 · Equal-weight keying.** On every axis, the answered agree-side items share total
weight ½ and the answered disagree-side items share ½. For an all-agree user, the +keyed side
contributes +½·½ and the −keyed side −½·½, so the score is **exactly 0** in every mode. Weights are
renormalized over *answered* items, so the balance holds even with skips, as long as each side has
at least one answer. Otherwise the plain mean is used with a confidence penalty.

**D-009 · ✅ · Modes are prefixes** of one ordered list, built from blocks of 12 (one item per
axis per block). This keeps every prefix balanced. The upgrade ("36 more questions") keeps the
existing answers and creates a new result linked by `upgradedFrom`.

**D-010 · 🟢 · Confidence (provisional):** `n/(n+2) · (1 − variance) · balance`, where balance is 0.8 if
only one keying side was answered. Variance (not SD) is used so ordinary agree vs strongly-agree
variation costs a few percent, while full contradiction (variance 1) costs everything. A tension note
appears at SD > 0.5 or on a contradicted mirror pair.

**D-011 · 🟢 · Quality flags (provisional):** straightline (mode share ≥ 80% or run ≥ 70%),
acquiescence (|mean raw| ≥ 1.0), contradiction (≥ 2 mirror pairs and ≥ 25% of pairs ≥ 1.5 apart),
fast (median < 1.2 s), sparse (≥ 40% skipped; confidence only). All pattern checks need ≥ 12
answers.

The acquiescence threshold is 1.0, not the 1.2 first planned. In Quick (2/1 keying per axis), a
consistent respondent at the "two-item" pole on every axis averages ±0.67, so the threshold sits
safely above that while still catching yea-saying.

**D-028 · ✅ · 72 English items in Phase 2** (Quick = first 36), then stop for review.

**D-037 · ✅ · The only profile question is an optional country.** It defaults the party set.

**D-061 · 🟢 · Question-bank layout.** There are six blocks of 12, and each block covers every
axis once.
- **Block 1** opens with low-heat items: direct democracy, then the income gap, then local
  decisions. The drug and family items sit at positions 9 and 11, and the "my country vs abroad"
  items are spread out.
- **Mirror pairs:** block 1 holds each axis's first mirror item. The second halves are split
  between blocks 2 and 3 (each ≥ 15 positions later), so they never arrive as a run at the end of
  Quick.
- **Blocks 4–6** complete Standard at 3+/3−.
- **Priming:** pairs that would prime each other are kept apart:
  - religion-in-schools vs national curricula
  - deregulation vs regional tax rates
  - "citizen of the world" before the trade/borders items
  - aid vs inheritance tax
- **int-05/int-06** (neutrality vs defending partners) form a declared Standard-only mirror pair,
  14 apart.

**D-063 · 🟢 · Question review (reviewer subagent, Phase 2).** I adopted almost all of the
reviewer's ~40 findings. Highlights:
- **Keys that would flip for real groups were rewritten.**
  - eco-06: green "build faster" supporters would have agreed, so it now reads "jobs over
    local nature".
  - dist-05: union wage floors in collective-bargaining countries. It now reads "no minimum set by
    law *or* by unions".
  - part-04: it measured authoritarianism, so it now reads "leaders who need not win elections
    decide better long-term".
- **Mirror pairs were tightened into true opposites:** dist-01/02, own-01/02, cent-01/02,
  part-01/02, trad-01/02, int-01/02, eco-01/02, bord-01/02.
- **Status-quo wording was removed:** "kept low", "keep full control", "stay out", "its allies",
  "much more aid", "public schools" (the UK meaning).
- **Coverage fixes:**
  - wealth: dist-06 is now inheritance tax, replacing basic income, which cuts across camps
  - ceiling effects fixed in dist-03 and own-06
  - social change in Quick: the same-sex-marriage item moved to Standard, and "adapt traditions"
    moved into Quick
- **The reviewer's suggestions for Deep** (Phase 9) are noted for that bank: wealth/rent caps,
  housing ownership, labour standards in trade, emergency powers, voting age, gender-neutral
  language, religious exemptions, carbon tax, arms exports, labour-migrant selection.
- **Not adopted:** the claim that answering "agree" to both items of a mirror pair counts as a
  contradiction. That pattern is a keyed gap of 1.0, below the 1.5 threshold, so only
  agree + strongly agree or strongly agree to both are flagged. The threshold stays at 1.5.

**D-062 · 🟢 · Anchor catalog in Phase 2.** 52 ideology stubs across all nine spectra and 21
families, with coordinates, salience and sources but no page content, serve as calibration
anchors. They become full Tier A entries in Phase 5. Stubs are never published as pages.

**D-064 · 🟢 · One rule for `extremist`** (second-reviewer finding, applied to every entry). An
entry is `extremist: true` when the current, as defined, meets **both** conditions:
1. Its programme or its record in power bars lawful opposition (one-party, one-leader, clerical,
   dynastic or racial-state rule).
2. Violence or persecution against opponents, or against groups defined by religion, ethnicity,
   class or sexuality, is either a systematic, documented practice of the tradition in power or a
   central, distinctive part of its programme.
   - Revolution against a state does not count on its own.
   - Neither do practices common to every state of an era.

Variants inherit their parent's flag unless they renounce the qualifying element. Umbrellas whose
currents differ are split, and only the qualifying current is flagged.

- **Now true:**
  - Marxism–Leninism, Maoism, Titoism (changed), Juche
  - fascism, national socialism, ecofascism, third positionism, Strasserism, national
    bolshevism (changed)
  - Ba'athism, Khomeinism
  - Christian reconstructionism (changed; its harms section must state that it has no record of
    organised violence)
  - Salafi-jihadism (new)
- **False:** Trotskyism, neoreaction, absolute monarchism, Islamism (the participatory
  mainstream, now split from Salafi-jihadism), democratic confederalism, anarcho-primitivism.
- **Effect:** the flag only switches on stricter tone rules (third-person voice, documented-harms
  section). It is never shown to users as a label.

**D-065 · 🟢 · Atrocity flag at ideology level.** An *ideology* carries `atrocity` only when the
genocide meets D-030 **and** scholarship treats it as the direct implementation of that
ideology's own defining programme. Otherwise the flag belongs on the regime or figure entry, and
the ideology's harms section links to it.
- **National socialism:** keeps the flag, with basis corrected to `scholarly-consensus`. The
  Nuremberg tribunal convicted for crimes against humanity; it did not adjudicate "genocide".
- **Ba'athism (Anfal):** goes to a future Ba'athist Iraq regime entry and its leaders.
- **Maoism (Khmer Rouge, ECCC 2018):** goes to a Democratic Kampuchea regime entry and its
  convicted leaders.
- **Islamic State (Yazidis):** goes to an Islamic State entry.
- **The Holodomor** is contested among historians: a regime-level question at most.

**D-066 · 🟢 · Catalog review resolutions (Phase 2 anchors).** I adopted the reviewer's findings
on bias and drift. The two generator batches split left/right, so any scale difference between
them would read as a political asymmetry.
- **Authoritarian regimes, aligned:**
  - liberty: ML 80→90, Maoism 85→90, fascism 95→90, Khomeinism 60→75, Christian
    reconstructionism 40→65, Peronism 20→40 (participation 10→25)
  - intervention: ML −25→−50
  - ecology: national socialism −10→−30
- **Off-diagonal reality restored:** Titoism distribution −65→−45 (market socialism), Christian
  democracy ownership 0→20, populist radical right distribution 10→−5 (welfare chauvinism).
- **Wording made symmetric:** Maoism, ML, Khomeinism, Trotskyism, paleoconservatism.
- **Labels and hierarchy:** Titoism's label is now "contested", and anarcho-capitalism is a
  child of libertarianism.
- **Low placement confidence** for constitutional monarchism and distributism. Their defining
  claims (a hereditary head of state; dispersed small property) are on no axis, and constitutional
  monarchism had become a "centre attractor" (top match for 37% of simulated centrists). Under
  D-051 a low-confidence entry is never the headline when a medium/high one is within 3 points.
- **Rubric:** participation sub-scale written down (single leader 100, single party ≈ 85–90), and
  references fixed for liberty +50, ownership 0, tradition 0 and borders −100.
- **Axis 1** now measures *redistribution of income and wealth* ("who earns and owns what"
  overlapped Ownership).
- **Deferred to Phase 5:**
  - source upgrades. The reviewer listed better secondaries for paleoconservatism, ecofascism,
    national bolshevism, Strasserism, neoreaction, national conservatism, Khomeinism (Abrahamian)
    and Juche (Myers), plus one independent secondary for each "Wikipedia + primary" entry.
    Think-tank glossaries (ECPS) will not count as scholarly support.
  - implementing the rule-based spectrum classifier
  - captioning the PCA map's PC1 as "nationalist–authoritarian ↔ internationalist–libertarian"
- **Tier A must-adds:** market socialism, Dengism, neoliberalism (contested label),
  neoconservatism, paleolibertarianism, Bonapartism/Caesarism, Christian socialism (+ liberation
  theology), liberal/civic nationalism, Hindutva; runners-up: Eurocommunism, left-libertarianism,
  property-owning democracy, the Nordic model, developmental authoritarianism. Each splits a
  correlated pair: distribution/ownership r = 0.96, liberty/borders 0.90, religion/tradition 0.85,
  nation/borders −0.84, liberty/participation 0.83.

---

## C. Scoring, matching, maps

**D-012 · 🟢 · Distance:** weighted RMS gap with weight = user confidence × (0.2 + 0.8 × salience).
The 0.2 floor keeps narrowly defined entries from matching everyone.

**D-013 · ✅/🟢 · Similarity curve:** `100·2^(−(d/τ)²)` with τ fitted per catalog kind on
simulated users (target: median best ≈ 75%, 5th ≈ 55%). **Placeholder:** it must be re-tuned on
real community data, since real users cluster near the centre. Percentiles were rejected because
they push the best match to 95%+. Capped at 99%.

**D-014 · ✅/🟢 · Calibration protocol.**
- Simulated answer = `2·key·coord/100 + N(0, σ²)`, rounded and clamped. σ ∈ {0, 0.5, 0.8, 1.0}.
- **The gates apply at σ = 0.5.** That's about half a scale step of answer noise, a moderate level
  for honest respondents; the other levels are reported.
- Deep is simulated on the Deep bank *structure* until Phase 9 writes the items.
- Strict and family-level hit rates are both reported.
- **Gate metric (Phase 2):** the spec says to count same-family and parent/child matches as hits
  in all modes. So for Deep and Standard, a hit is "exact, parent/child or same family within the
  top 3", and for Quick it is "exact within the top 5, or the top match in the same family". The
  report always shows the stricter numbers next to these: exact @1/@3/@5, and parent/child only @3.
- **Test (c):** "clearly opposite" means an unweighted RMS distance ≥ 100 between two entries. The
  check is that a respondent simulated from archetype A never ranks such an entry above A itself.
  (Ranking below the respondent's *best* match is trivially true.)
- I read the spec's "do NOT tune data until tests pass" as **never bending catalog coordinates to
  make a test pass**. When a gate fails, I report it and fix the engine or questions only if
  they're actually wrong.

**D-015 · ✅ · Category indices** come from per-category PCA over ideology coordinates, PC1
oriented so the category's first axis loads positively, giving `index = 100·Σlᵢsᵢ/Σ|lᵢ|`. It isn't
mean-centred, so 0 means neutral on all three axes. Loadings and EV are shown. If EV < 50%, the
three axes are shown instead.

**D-016 · 🟢 · Map = PCA over all 12 axes**, computed at build with stored loadings, so new
points project exactly. The web view starts from the same coordinates. UMAP was rejected because
it distorts global distances and can't place new points exactly.

**D-017 · 🟢 · Compass:** Canvas 2D + d3 modules (no regl), with an SVG label overlay.

**D-018 · ✅ · URLs:** own results are read from IndexedDB with no code in the URL. The share code
(31 characters, scores only) is created only on Share.

**D-051 · ✅/🟢 · Match display.**
- **Closest family** = family centroid, the salience-weighted mean of members' coordinates.
- **Ideology** = best entry without a parent. **Variant** = best entry with a parent, shown under
  its parent.
- The top-5 list collapses variants into their parent.
- **Headline:** a `low` placement entry loses the headline to any medium or high entry within
  3 points.

---

## D. Storage, sync, privacy

**D-019 · 🟢 · IndexedDB (`idb`)**, with an in-memory fallback and a notice when it's unavailable.

**D-020 · ✅ · E2E-encrypted sync.**
- The phrase entropy goes through HKDF to produce `authSecret` (the server stores only an HMAC of
  it) and `encKey` (AES-GCM, never leaves the device).
- The server stores ciphertext and hashes only.
- At creation the user sees a blunt warning: "Lose the phrase = lose your data."

**D-021 · 🟢 · Phrase:** 12 words from the BIP39 English list in every locale (128 bits plus a
checksum), via `@scure/bip39`.

**D-022 · 🟢 · Rate limiting:** `HMAC(HMAC(secret, date), ip)` with a daily rotation, rows purged
within 24 h, stored in a separate table and never joined with anything.

**D-023 · 🟢 · Neon (EU, Frankfurt) + Vercel `fra1`.**

**D-024 · 🟢 · Retention:** profiles inactive for 12 months are deleted by a daily cron and the
privacy page says so.

**D-025 · 🟢 · Cookies and storage:** no locale cookie, theme kept in localStorage. The only
cookie is the optional profile cookie.

**D-041 · ✅ · Passkeys:** a WebAuthn PRF bonus where the browser supports it, never promised. The
phrase remains the fallback.

**D-052 · ✅ · Community layer:** a separate, explicit, anonymous submission of axis scores only.
It's never derived from synced profiles and never linked to one, contains no IPs or PII, and
renders k-anonymous density. Behind a feature flag.

**D-042 · 🔴 RED · Swiss/EU privacy and legal review before launch.**
- Political opinions are sensitive personal data under the nFADP/revDSG and special-category data
  under GDPR Art. 9.
- German-facing sites usually need an **Impressum**, and affiliate links or donations may trigger
  that requirement.
- The review also covers: Vercel request logs, sending scores to Anthropic (the optional AI
  feature, consent required), the community layer's anonymity, retention, and whether E2E blobs
  still count as personal data.

**Get legal advice before any public, indexed launch.**

---

## E. Catalog & content

**D-026 · 🟢 · Slugs:** ASCII only (ä→ae, ß→ss, accents stripped) and unique per locale. The DE/FR
route names in PLAN §4 are my proposals and get reviewed in Phase 9.

**D-027 · 🟢 · Locale gating:** UI strings ship in en/de/fr from Phase 1. Content locales stay
`noindex` until `contentComplete`.

**D-029 · ✅/🟢 · Spectra & classification.**
- **The 9 spectra:** radical left, left, centre, right, far-right, third position, libertarian,
  anarchist, theocratic.
- **Theocratic inclusion rule:** the ideology must advocate *religious law or clerical rule as the
  basis of the state* (e.g. Khomeinism / velayat-e faqih, Christian theonomy / reconstructionism,
  Salafi-jihadist statehood projects). Religiously inspired democratic traditions such as Christian
  democracy or Muslim democracy stay in their normal spectra with a `religious` tag. So do
  religious nationalisms that don't demand religious law, such as Hindutva (far-right, tagged
  `religious`, as a provisional call).
- **Classification:** a rule-based classifier on the coordinates proposes a spectrum, and any
  disagreement needs a `classificationNote`. Umbrella labels covering incompatible currents are
  split up.

Borderline calls (provisional, re-checked by the reviewer subagent in Phase 5):

| Entry | Spectrum | Alternative | Note |
|---|---|---|---|
| Anarcho-capitalism | libertarian | anarchist | Self-identifies as anarchist; most anarchist traditions reject it. The page states both |
| Fascism | far-right | third position | Self-described "third way"; scholarly consensus classifies it far-right. Follow the consensus and note the self-description |
| National bolshevism, Strasserism | third position | far-right | Explicit synthesis of left economics and ultranationalism |
| Ecofascism | far-right | third position | |
| Peronism | third position | centre / left | Perón's "Third Position" meant non-alignment. The page distinguishes it from neo-fascist third positionism |
| Ba'athism | third position | radical left | Arab socialism + pan-Arab nationalism + one-party rule |
| Juche | radical left | third position | Marxist-Leninist lineage; nationalist self-reliance and dynastic succession |
| Kemalism | centre | right | Secular republican nationalism with statist economics |
| Christian democracy, ordoliberalism | centre | right | Centre-right in much of Europe; moderate on both economics and society |
| Distributism | centre | right | Catholic "third way" without an authoritarian element |
| Democratic confederalism | radical left | anarchist | Grew out of libertarian municipalism but rejects the anarchist label |
| Libertarian municipalism | anarchist | radical left | Bookchin broke with anarchism late in life, but the tradition is studied within social anarchism. **Provisional** |
| Semi-direct federal democracy (Swiss model) | centre | — | Defined mainly by axes 5 and 6 |
| Technocracy, transhumanism | centre | — | Defined mainly by 1–2 axes |
| Neoreaction | far-right | right | Anti-democratic; monarchical or corporate sovereignty |
| Monarchism | split: absolute (far-right), constitutional (centre or right) | — | |
| Accelerationism | split: left (radical left), right (far-right), e/acc (libertarian) | — | One label, incompatible currents |
| Classical liberalism | centre | libertarian | |

**D-030 · ✅ · One atrocity-context policy for all entry kinds.**
- **Criterion:** genocide established by an international tribunal or by broad scholarly
  consensus. A living person qualifies only if *convicted* by an international tribunal.
- **Effect:** the entry stays in the catalog with context and is never the hero of a share card or
  OG image. It may appear in "furthest from you" and the explorer, and shows a context note when
  it's a top match.
- **Separately, `extremist` ideologies:** third-person voice, a mandatory documented-harms section,
  slogans only quoted in historical context and never as headings.
- **No symbols, flags, uniforms or emblems anywhere** (§86a StGB in Germany, Austrian law).

**D-031 · ✅/🟢 · Sources:** at least 2 per entry, from encyclopedias (SEP, IEP, Britannica,
Wikipedia), academic works, datasets (V-Dem, CHES; licences to be checked), and primary documents.
Subagents cite only URLs they opened. A link checker runs in CI. No copied prose.

**D-032 · 🟢 · Images:** Commons only, with metadata from the Commons API and a licence allowlist
(PD, CC0, CC BY, CC BY-SA). Self-hosted, optimized copies.

**D-033 · 🟢 · Avatars:** procedural original geometric SVG emblems; no characters, no real-world
symbols.

**D-034 · 🟢 · What a country's coordinates mean:** the policy regime in force as of a stated date,
not public opinion. Regimes cover a stated period.

**D-035 · ✅ · Parties:** UK, IE, US, CA, AU, NZ and EP groups first; CH/DE/FR/AT later. Real
parties only. Each has an "as of" date and many-to-many ideology tags, and
`docs/refreshing-parties.md` explains how to update them.

**D-036 · 🟢 · Books:** Open Library links by default. Affiliate links are flagged and disclosed,
and are off at launch (see D-042 on the Impressum).

**D-043 · ✅ · Reference site:** sets the mood only. None of its code, text, questions or data is
used.

**D-045 · 🟢 · Spectrum colours:** muted tints checked for AA contrast and colour-vision
deficiency. Deep red is reserved for "you" and primary actions.

**D-046 · ✅ · Catalog staging:** Tier A (~120 core ideologies, full pages), then regimes,
countries, figures and parties, then Tier B (~180+) in batches with the same gates. Gates are never
lowered to hit the count.

**D-047 · ✅/🟢 · Hierarchy:** `family` (a group defined in `data/families.ts`) → ideology (no
parent) → variant (`parent` = an ideology in the same family). Depth is limited to 2 below the
family. The validator rejects cycles and parents in other families.

**D-048 · ✅ · Label status:** `self-described | academic | contested` plus `termOrigin`. Academic
and contested labels need a name note covering who uses the term, who disputes it, and how
adherents describe themselves. Results copy never presents a contested label as a neutral
self-identity; it says something like "closest to the current often called X".

**D-049 · ✅ · Placement confidence** (`high | medium | low`) with a one-line reason, shown on pages
and as a subtle indicator in results.

**D-050 · ✅/🟢 · Inclusion and near-duplicates.**
- **Inclusion:** real adherents or a real literature, with ≥2 independent sources.
- `online-satirical` entries are hidden from matching.
- **Near-duplicates:** two entries within 8 points weighted RMS must be parent/child, or one
  becomes an alias of the other.

**D-053 · ✅ · German:** standard German with ß for `/de`. `/de-ch` comes in Phase 9 as a
build-time ß→ss transform plus a small Swiss vocabulary list (e.g. Velo, parkieren).

**D-054 · ✅ · Required reference entries:** Democratic confederalism (Öcalan), Libertarian
municipalism (Bookchin), and Semi-direct federal democracy (Swiss model, reference country
Switzerland) are three separate entries.

**D-055 · ✅ · Every content batch gets a second reviewer subagent** (bias, tone, borderline
classification, coordinate drift) before merge. Its findings and my resolutions go in this file.

---

## F. Rendering & optional features

**D-038 · 🟢 · OG images** are generated on demand and cached, not at build time.

**D-039 · 🟢 · PDF** uses a print stylesheet and `window.print()`.

**D-040 · 🟢 · AI explain (Phase 11)** uses the current Haiku model (the Claude Code environment
lists `claude-haiku-5-5`; re-verify against Anthropic docs then). It sends rounded scores only,
asks for consent, is labelled AI-generated, cached and rate-limited, and is off without a key.

---

## G. Open items

- Vercel team/account (needed for Phase 3 preview deploys).
- Final domain (before Phase 7).
