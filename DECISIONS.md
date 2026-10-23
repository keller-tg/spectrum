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

## 0b. Changes after the Phase 2 review (2026-10-22)

| Area | Before | Now | Entries |
|---|---|---|---|
| Pole names | Rule by the many ↔ the few; Secular ↔ Religious; Open ↔ Closed borders | **Citizens decide directly ↔ Representatives/experts decide; Separation of religion and state ↔ Religion in public life; Open ↔ Restrictive** (owner's review) | D-067 |
| Question bank | revision 1 (72 items) | **revision 2:** 14 new items, 3 moved, 14 retired; structure unchanged; reviewer re-run twice | D-068, D-070 |
| Question ids | retire-and-replace rule in a comment | rule enforced: `retired` items stay with their last position, new items name them in `replaces`; `empirical` flag, ≤ 1 per axis in Quick | D-069 |
| Calibration | idealised respondents only | **robustness grid**: response styles, noise, item difficulty offsets, mixed population, exact centrist check; report in `docs/calibration-report.md` | D-071 |
| Pilot | — | Phase 3: unlinked, noindex `/pilot` with explicit consent and a download-only answers file; `pilot-analysis` script | D-072 |
| Personal data | rule in CLAUDE.md | **privacy guard** (script + CI on every push, full history), hash-only secret; User-Agent contact = repo URL | D-073 |
| Hosting | Vercel team unknown | team `sos-kellohs-projects`, project `spectrum`, Next.js preset, Node 24.x; live | D-001, D-074 |


## 0c. Design reset (2026-10-23)

The owner replaced the Phase 1 look ("Design" in the master spec) with a minimalist, brutalist,
strictly black-and-white design. Everything else in the spec stays.

| Area | Before (Phase 1) | Now | Entries |
|---|---|---|---|
| Palette | cream paper, deep-green ink, three ink shades, rule tints, one deep-red accent, nine spectrum tints, separate dark values | **two tokens, `--ink` and `--paper`**: black on white, white on black in dark mode; nothing else | D-075 |
| Enforcement | axe contrast checks | `check-palette` (script + CI) and a runtime colour audit in e2e | D-075 |
| Fonts | Bodoni Moda (+ italic) and Schibsted Grotesk via `next/font/google` | **Archivo** (heavy display, regular text) + **IBM Plex Mono** (UI, labels, numbers), self-hosted via `next/font/local` | D-076 |
| Form | rounded cards and chips, soft shadows, backdrop blur, paper grain, colour glow | zero radius, zero shadow, 2px rules (1px hairlines), 12-column grid, numbered sections, ruled tables | D-079 |
| Motion | micro-interactions, rise-in, spinning dial ring, hover lifts | none; instant states; functional animation only, with a reduced-motion fallback | D-079 |
| States | accent borders and tinted fills | hover/press invert, selected = inverted + "[X]" or brackets, disabled = dashed, focus = 3px outline at 3px, errors in words | D-079 |
| Spectra | colour tints with a dot | marker shape + 1–3 letter code + legend | D-077 |
| Axis strip | 12 pole glyphs, opacity = strength | 12 two-letter codes over four filled/empty squares | D-077 |
| Charts | colour gradient compass, red "you", tinted fills | halftone density, outlined circle + crosshair, dashed trail with dates, solid vs dashed lines, hatched vs empty fills | D-077 |
| Images | Commons photos as they are; colour avatars | 1-bit ordered dither at build time, attribution under each; generated monochrome glyphs; ISO codes instead of flags | D-078 |
| Landing | sentence + lead + dial graphic, mode cards, axes overview, "how it works", promises band | one screen: wordmark, one sentence, the mode table; the other sections moved to /method | D-079 |
| Design page | `/design-system` | `/styleguide` (noindex, unlinked): every component and state in both modes side by side | D-079 |


## 0d. Design V2 (2026-10-23)

The owner kept the black-and-white system (tokens, fonts, modes, palette guard)
and asked for modern brutalist pages with refined interaction. This revises
three rules of the reset.

| Area | Design reset (D-079) | Design V2 | Entries |
|---|---|---|---|
| Motion | none; instant inverts | a token-based interaction system: wipes, arrow rolls, springs, sliding indicators; transform and clip-path only; instant under reduced motion | D-080 |
| Radius | zero everywhere | `--radius-control` (0 or 999px) for controls only, in three switchable styles: sharp, pill, offset | D-080 |
| Focus ring | 3px at 3px | 2px at 3px, flipped inside inverted bands | D-080 |
| Landing | one screen: wordmark, sentence, mode table | full home page: hero with headline, mode rows and a live hero field; stat strip; 01 how it works; 02 the 12 axes; 03 index; privacy band; footer wordmark | D-081 |
| Mode table | table with a START label in the corner | whole-row links that wipe to inverted | D-080 |
| Answer options | five cells | five full-width rows with keycaps and an "[X]" that draws in | D-080 |
| Header | ruled row of cells | sticky, 1px rule, an ordered-dither band on scroll; segmented EN/DE/FR and LIGHT/DARK; a full-screen inverted sheet on phones | D-080 |
| Structure | boxes everywhere, 2px | less boxing, more air: 2px for structure, 1px for dense data, 8px spacing grid, sections padded `clamp(64px, 10vw, 160px)` | D-080 |
| Review | `/styleguide` | plus `/styleguide/buttons` (state matrix), `/styleguide/screens` (test screen, result poster), `/styleguide/home-a` and `/home-b`, captures in `docs/design/` | D-081 |

---

## A. Project & stack

**D-001 · 🟢 · Location, repo, hosting.** Folder `~/spectrum`; remote `github.com/keller-tg/spectrum`
(**public**), branch `main`. Commits use the GitHub noreply address. Domain for now:
`spectrum-six-rho.vercel.app`, served by the Vercel project `sos-kellohs-projects/spectrum`
(D-074). **Still open:** the final domain (before Phase 7).

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

**D-058 · ~~superseded by D-076~~ · Fonts.** Bodoni Moda (display, optical-size axis) + Schibsted Grotesk (text/UI),
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

**D-074 · 🟢 · Vercel setup (2026-10-22).** Team `sos-kellohs-projects` (Hobby), project
`spectrum`, Root Directory `.`, Framework Preset Next.js, Node 24.x; `engines.node` is pinned to
`24.x` to match local development. The first builds failed because the project was created while
the repo held only Phase 0 docs, so Vercel had detected "Other" (fixed in the dashboard). Production
is `main` → `spectrum-six-rho.vercel.app`; per-deployment URLs sit behind Vercel's default
Deployment Protection. A dashboard "Redeploy" rebuilds the old deployment's commit, not `main`.

---

## B. Axes & questions

**D-004 · 🟢 · Axis IDs and sign.** IDs are `distribution, ownership, trade, liberty, centralization,
participation, tradition, religion, ecology, nation, intervention, borders`. The first-named pole
is −100. Pole labels live in localized data, so renaming one never changes stored results.

**D-005 · ✅ · Pole names (spec v2)** as listed in PLAN §5.1, each with a one-line tooltip written so
people who hold that view would accept it.
*Superseded in part by D-067:* the owner renamed three axes' poles after the Phase 2 review
(Closed → Restrictive among them).

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
- **int-05/int-06** (neutrality vs defending partners) formed a declared Standard-only mirror
  pair, 14 apart. Revision 2 retired int-06 (D-068), so int-05 is now unpaired.

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

**D-067 · ✅ · Pole names revised (owner's Phase 2 review).**
- **Axis 6:** *Citizens decide directly ↔ Representatives/experts decide* (short: Direct ↔
  Delegated). "Rule by the few" misdescribed the items liberal democrats agree with (elected
  representatives having the final say, independent central banks). The far end is still
  unelected rule, anchored by part-04, and the + tooltip says so ("…or at the far end to a party or
  a crown"). The rubric is unchanged: representative democracy sits at 0.
- **Axis 8:** *Separation of religion and state ↔ Religion in public life*. The items measure
  religion's public role, not personal religiosity.
- **Axis 12:** *Open ↔ Restrictive* (was Open borders ↔ Closed borders).
- Pole glyphs: Restrictive is now a lowered checkpoint barrier instead of a shut gate. Catalog
  summaries that cited the old labels were rewritten; autocracies now read "unelected rule".

**D-068 · ✅/🟢 · Question bank revision 2.** The owner approved the structure and asked for seven
content changes. Position numbers are the new ones; `docs/question-bank-changes.md` has the full
before/after with reasons and the reviewer's verdicts.
- **Ownership:** the Quick mirror pair is now "most large companies privately ↔ collectively
  owned" (#5/#22); #62 is "most large banks owned by the public or their customers"; the utilities
  item moved to #40, replacing "**more** companies worker-owned" (status-quo wording). Extraction
  is gone.
- **Social change:** the Quick mirror pair is the axis's core idea, keeping vs adapting customs
  (#11/#31, exact complements). "Married mother and father" is replaced, not reworded, since a
  single-idea version would duplicate #17. End of life is the new non-family norm (#38).
  Family/gender items: 3 of 6 in Standard, 1 of 3 in Quick.
- **Migration:** #12/#28 are now a burden-of-proof pair: admit only if clearly beneficial vs free
  to come unless there is a strong reason to refuse. They need no quantity and split near the
  centre. #18 covers people with no legal right to stay, even after five years of living and
  working here. #61 says "at least ten years".
- **Centralization:** #70 (municipal mergers) → equal public services nationwide vs local control.
- **Intervention:** #43 (sanctions) → regime change left to a country's own people; #72 (troops
  for partners) → force to protect economic interests such as shipping routes.
- **Nation and world:** #32 softened ("being a citizen of the world is an important part of how I
  see myself"), #39 replaced (schools teaching national pride).
- Keys and axes per position are unchanged, so every structural property (3+/3−, Quick 18/18,
  mirror pairs ≥ 15 apart, all-agree = 0) holds as before.

**D-070 · 🟢 · Reviewer resolutions (revision 2).** The reviewer agent checked every changed
position twice. **Adopted:**
- the exact-complement wording for #11
- #17's explainer without single parents (it keyed evidence-minded progressives Traditional)
- the burden-of-proof pair #12/#28, replacing my net-migration pair. The reviewer rejected that
  pair for a keying error: people who want cuts that stay above zero would agree with #28 and be
  scored Open.
- the five-year trade-off in #18 (otherwise near-consensus)
- #32's wording (my "my continent" draft only worked in Europe)
- regime change for #43 (my neutrality draft duplicated #58), then "undemocratic" instead of the
  loaded "brutal"
- cooperatives and "most" in #62
- #70 without "regions lose control"
- narrower explainers for #72 and #43
- restoring utilities at #40
- a fairer Open tooltip

**Not adopted, put to the owner:**
- relabelling axis 6's + pole ("Leaders and experts decide")
- relabelling axis 8's + pole ("Religion guides law and state")
- replacing #53 for axis 7 difficulty (decide after the pilot)
- replacing #58 (an alliance item the owner did not flag)

**Owner, 2026-10-23:** revision 2 approved as written. Axes 6 and 8 keep the owner's labels; #53
and #58 wait for the pilot data.

**Documented, not changed:**
- #61's country anchoring: ten years is current law in CH/AT
- #38's overlap with axis 4
- #39's country dependence

**Phase 3 default:** the participation slider gets a far-end note above about +60 ("toward rule
without elections"), because Quick has no non-democratic item.

**D-069 · 🟢 · Question ids and claim types.** A changed meaning always gets a new id. The retired
item stays in the bank with `retired: true` and its last position, so stored answers stay scorable
and the change log can show before/after; the new item names it in `replaces` (validator: same axis
and key, target retired). Items that state a claim about facts or effects carry `empirical: true`;
the validator allows at most one per axis in Quick. Tagged: eco-03, own-03, cent-03, trad-02
(Quick); part-04, bord-04, trade-04 (Standard). `ACTIVE_QUESTIONS` / `modeQuestions()` are the only
way code reads a mode's items (tests used to slice the raw array).

**D-072 · 🟢 · Pilot (built in Phase 3).** An unlinked, noindex `/pilot` page with explicit consent
lets a participant take the test and download an anonymous answers file; nothing is stored on a
server. `scripts/pilot-analysis.ts` reports per-item agree rates and implied difficulty,
corrected item-total correlations, per-axis reliability (α) and inter-axis correlations from a
folder of those files. The owner collects 30–50 files before Phase 9. Pilot files never enter the
repo (`/pilot-data/` is gitignored). Details: PLAN §7a.

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

**D-017 · 🟢 · Compass (superseded by D-086):** Canvas 2D + d3 modules (no regl), with an SVG label overlay.
*Revised by D-086: the static compass is SVG; Canvas returns only if zoom or the trail need it.*

**D-018 · ✅ · URLs:** own results are read from IndexedDB with no code in the URL. The share code
(31 characters, scores only) is created only on Share.

**D-051 · ✅/🟢 · Match display.**
- **Closest family** = family centroid, the salience-weighted mean of members' coordinates.
- **Ideology** = best entry without a parent. **Variant** = best entry with a parent, shown under
  its parent.
- The top-5 list collapses variants into their parent.
- **Headline:** a `low` placement entry loses the headline to any medium or high entry within
  3 points.

**D-071 · 🟢 · Calibration robustness.** The gates (D-014) assume respondents who use the whole
scale and items that are equally easy to agree with, which is why they read 94–99%. The report now
adds a grid that is reported, not gated: response styles (acquiescent +0.75 on every item;
midpoint-heavy; extremity-averse), σ ∈ {0.5, 0.8, 1.2}, per-item difficulty offsets with SD ∈ {0,
0.3, 0.6}, and a mixed population. A true centrist's expected scores are computed exactly: without
offsets they are exactly 0 under every style (a uniform shift cancels under balanced keying); with
offsets they drift. Simulation only sees each item's axis and key, never its wording, so it cannot
judge the wording changes; the pilot (D-072) can. The report moved from `generated/` to
`docs/calibration-report.md` so it is readable on GitHub.

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

**D-073 · 🟢 · Privacy guard.** `scripts/check-privacy.ts` fails if the owner's personal email
appears in the working tree, and with `--history` anywhere in git history (every blob reachable
from any ref, plus author, committer and message of every commit). The address is never stored in
the repo: `PRIVACY_GUARD_SHA256` holds SHA-256 hashes of the address and its local part (locally
in the gitignored `.env.local`, in CI as a repository secret). Every email-like string (including
`%40` and `[at]` spellings) and every word-like token is hashed and compared, and findings print
locations only. It runs in `npm run check` and in `.github/workflows/privacy.yml` on every push
and pull request (plain Node 24, no install). Without the hashes it warns locally and fails in
CI. Scripts that make HTTP requests identify themselves with the repo URL as contact
(`+https://github.com/keller-tg/spectrum`), never personal data. History check on 2026-10-22: the
email appears nowhere; the first commit's author field is a machine-local address (macOS user and
computer name), not the personal email.

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
(PD, CC0, CC BY, CC BY-SA). Self-hosted copies, turned into 1-bit dither images at build time
(D-078).

**D-033 · 🟢 · Avatars:** generated, original, monochrome glyphs (D-078): a 5×5 mirror-symmetric
pattern of squares derived from the entry id. No characters, no faces, no real-world symbols.

**D-034 · 🟢 · What a country's coordinates mean:** the policy regime in force as of a stated date,
not public opinion. Regimes cover a stated period.

**D-035 · ✅ · Parties:** UK, IE, US, CA, AU, NZ and EP groups first; CH/DE/FR/AT later. Real
parties only. Each has an "as of" date and many-to-many ideology tags, and
`docs/refreshing-parties.md` explains how to update them.

**D-036 · 🟢 · Books:** Open Library links by default. Affiliate links are flagged and disclosed,
and are off at launch (see D-042 on the Impressum).

**D-043 · ✅ · Reference site:** sets the mood only. None of its code, text, questions or data is
used.

**D-045 · ~~superseded by D-077~~ · Spectrum colours:** muted tints checked for AA contrast and
colour-vision deficiency. Deep red was reserved for "you" and primary actions. The design now has
no colour; spectra are shapes plus codes.

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

**D-038 · 🟢 · OG images** are generated on demand and cached, not at build time. They are black
and white with the site's two fonts (D-075, D-076); satori reads TTF/OTF/WOFF but not WOFF2, so
Phase 8 adds `.woff` copies of the same faces.

**D-039 · 🟢 · PDF** uses a print stylesheet and `window.print()`. The print rules (already in
`app/globals.css`) force ink on white in every mode and hide navigation and controls.

**D-040 · 🟢 · AI explain (Phase 11)** uses the current Haiku model (the Claude Code environment
lists `claude-haiku-5-5`; re-verify against Anthropic docs then). It sends rounded scores only,
asks for consent, is labelled AI-generated, cached and rate-limited, and is off without a key.

---


## G. Design (black and white, 2026-10-23)

**D-075 · ✅ · Two colours.** The only colours are the CSS tokens `--ink` and `--paper`: `#000` on
`#fff` in light mode, `#fff` on `#000` in dark mode (`lib/design/tokens.ts` mirrors them for
theme-color and, later, OG images). No greys, accents, gradients, shadows, opacity, blur or rounded
corners. Mode follows `prefers-color-scheme`; the text toggle "[ LIGHT / DARK ]" stores a choice
in localStorage, the inline script applies it before first paint and adds a theme-color meta
for it. Nested `data-theme` frames are allowed (the styleguide shows both modes at once).
Forced-colours mode is respected: no `forced-color-adjust: none`, SVG paints in `currentColor`,
and selected states add an outline in the system colour because inverted backgrounds disappear
there. Print always uses ink on white.
**Enforcement:** Tailwind's theme is cut down to ink and paper (plus the built-in transparent
and current), and its radius, shadow, blur and animation scales are removed.
`scripts/check-palette.ts` runs in `npm run check` and in CI (`.github/workflows/palette.yml`). It
parses CSS and TypeScript (string literals only, so comments and prose never trip it) and
rejects:
- colour literals outside the token declarations
- named and system colours, and colour functions
- gradients, opacity, shadows, radius and filters
- Tailwind palette colours and opacity modifiers
- SVG opacity attributes and gradient or blur elements

Its unit test proves the previous design would fail. A runtime audit in the e2e suite checks
every rendered element and pseudo-element in both modes. Dithered photos are exempt by
construction. Since D-080, transient mid-animation blends are fine (a wipe is half ink, half
paper for 220ms); every resting state is pure ink or paper, and the radius rule allows exactly
`var(--radius-control)`.
**Why:** owner's design reset. WCAG AA contrast is now 21:1 everywhere.

**D-076 · 🟢 · Fonts (supersedes D-058).** **Archivo** (Omnibus-Type, variable 100–900) for display
headings at weight 850 with tight leading, and at 400 for running text (≥ 16 px, ~65ch,
line-height 1.6). **IBM Plex Mono** 400/700 for the interface, labels (small uppercase, tracked)
and every number (mono figures are tabular). Both are SIL OFL 1.1 and self-hosted from
`app/fonts/` via `next/font/local`, licences next to the files, with no font request to any
other host. Latin is preloaded (≈65 KB for three files); latin-ext loads only when a page uses
one of its characters. **Why:** a heavy neutral grotesque gives the black-and-white pages their
weight without ornament; a mono with tabular figures makes numbers and labels line up in ruled
tables. Archivo's black weight reads as a poster grotesque, not a fashion face, and Plex Mono
pairs with it without competing. Widths other than normal were dropped to keep the preload small.

**D-077 · ✅/🟢 · Encodings without colour.**
- **Spectra:** each has a marker shape and a 1–3 letter code, always shown together and keyed
  in a legend (`SpectrumLegend`): radical left ■ RL, left □ L, centre ○ C, right ◇ R,
  far right ◆ FR, third position ⋈ TP (bowtie), libertarian △ LB, anarchist ▽ AN,
  theocratic ⬡ TH. Only the two outer ends of the left–right line are filled, so the fill means
  "further out on that line" and applies to both sides alike. Crosses, stars and other shapes
  with political or religious associations are avoided. Codes are localized (DE: M, ER, DP; FR:
  GR, G, D, ED); shapes are fixed. Hollow markers are filled with paper so they knock out
  halftone dots behind them.
- **Axes:** each axis has a localized two-letter code (EN: DI OW TR SP CE PA SC RS EC NW IN MI),
  used on radar spokes, compact tables and the strip.
- **Twelve-axis strip:** the code over four small squares, two per pole. One filled square =
  leans, two = strong (|score| ≥ 60), none = near the centre (|score| < 15). The styleguide
  explains how to read it; the accessible label spells out every axis.
- **Charts:** your series is a solid line with a hatched fill and solid corners, a comparison is
  dashed with an empty fill and hollow corners. Axis results are black bars on ruled tracks
  with ticks every 10 and an uncertainty bracket. Compass: halftone dot size shows density, you
  are an outlined circle (radius from confidence) with a crosshair, past results form a dashed
  path with arrowheads and dates (sparser dots with age), a ghost compare is hollow and dashed.
  Web view: spectrum shapes as nodes, 1px edges, labels on hover, selected node inverted.
- Every chart keeps a text alternative: a title/description plus a "Show data table" disclosure.
- **Flags** are dropped; countries appear by name and ISO code.

**D-078 · 🟢 · Images at build time.** `scripts/build-images.ts` (sharp, run by `prebuild` and
`predev`) turns each source in `data/images/` into a 1-bit PNG via an 8×8 Bayer ordered dither:
greyscale, normalised, resized to its output size, thresholded. Outputs go to `public/images/`
(gitignored) and contain only pure black and white pixels (the 320×402 sample is 6 KB). They are
shown at their own size with `image-rendering: pixelated`, so scaling never adds grey, in a 2px
frame, with author, licence and a source link always visible underneath. Licence data stays in
`data/images.ts` (Commons API, never typed from memory). The first source is a public-domain
portrait (John Stuart Mill, London Stereoscopic Company, c. 1870) used on the styleguide. Entry
avatars are generated glyphs (D-033).

**D-079 · ✅/🟢 · Brutalist rules, states and pages.** *Revised by D-080/D-081 (2026-10-23): the
"no motion", "zero radius everywhere" and "one-screen landing" rules no longer hold; the focus
ring is now 2px.*
- **Form:** zero radius, zero shadow, 2px solid borders (1px hairlines for dense data), a strict
  12-column grid, sections as bordered cells that share one rule, numbered section headers
  ("01"), ruled tables.
- **States without colour:** hover and press invert ink and paper. Selected is inverted plus a
  text marker ("[X]" for options, brackets for the current page and the selected tab). Disabled
  is a dashed border. Focus is a 3px solid outline at 3px offset in both modes. Links are
  underlined. Errors and success are words (an invalid field also gets a 4px frame).
- **Motion:** none by default. A global reduced-motion rule stays as a safety net for the
  functional animation that comes later (trail playback, graph layout).
- **Landing:** one screen with the wordmark, one sentence ("Twelve axes, because politics doesn't
  fit on one line.") and the modes as a ruled table (Quick 36 / Standard 72 / Deep 144, with
  minutes). Deep shows a dashed row and says "Opens soon". The axes overview, "how it works" and
  the promises moved to /method, so no content was lost. An e2e test checks that the table fits
  the first screen on desktop and phone.
- **Wordmark and favicon:** "SPECTRUM" in bold mono capitals after a square glyph (a framed
  field with one solid square); the favicon is the same glyph and follows the system mode.
  Below 360px only the glyph shows, and the link keeps its accessible name.
- **Header:** one ruled row of cells (wordmark, sections, EN/DE/FR, theme). Under 1024px the
  sections move into a text "MENU" disclosure, and under 768px so does the theme toggle.
- **Base components** (`components/ui`, `components/charts`): button, text field, checkbox, answer
  options, cell grid, ruled table (scrolls inside its own focusable region on narrow screens, so
  the page never scrolls sideways), nav, toggle, tabs, slider and axis bar, tooltip, modal
  (native `<dialog>` over a halftone backdrop), legends, section header, figure image, entry glyph.
- **`/styleguide`** replaces `/design-system`. It is noindex, in no nav or sitemap, and shows every
  component and state in a light and a dark frame side by side, plus the shape and pattern
  legends and static previews of the compass and web view on the anchor catalog. The localized
  slugs are `/styleguide` (EN, DE) and `/guide-de-style` (FR).


**D-080 · ✅/🟢 · Interaction system and control styles (Design V2).**
- **Tokens:** `--ease-out` cubic-bezier(0.22, 1, 0.36, 1); `--ease-spring` as `linear()` with at
  most 3% overshoot (falls back to `--ease-out`); `--dur-fast` 120ms, `--dur` 220ms,
  `--dur-slow` 360ms (large surfaces only). Only transform and clip-path animate; no animation
  library. With `prefers-reduced-motion` every duration token is 0s, so wipes become instant
  inverts and drift, sweeps and springs stop. Forced colours keep the text markers plus a
  system-colour outline.
- **Hover** exists only under `(hover: hover) and (pointer: fine)`; Tailwind's `hover:` variant
  is redefined to match. Touch gets `:active` only; nothing essential is hover-only (on touch the
  mode rows spell out START).
- **The wipe:** each interactive host carries an aria-hidden copy of its own content in
  inverted colours, revealed left to right with clip-path. Fill and label flip in the same
  frame, so there is never an unreadable one. Used by buttons, mode rows and answer rows.
- **Buttons:** labels in mono caps with 0.08em tracking. Optional rolling arrow (1.5px stroke)
  and keycap hint. Sizes S 36 / M 44 / L 56; S keeps a 44px touch target with an invisible
  margin. Variants:
  - primary: ink fill
  - secondary: paper fill and a 1.5px frame
  - text: the underline draws in over 160ms

  States:
  - hover: wipe plus arrow roll
  - press: scale(0.98), released with the spring
  - focus: 2px ring at 3px
  - loading: three stepped ticks at fixed width, `aria-busy`; the label keeps its place and
    name
  - success: a checkmark draws in over 240ms
  - error: words only ("FAILED, RETRY")
  - disabled: dashed and `aria-disabled`, no hover or press
- **Control styles** via `data-controls` on `<html>`. The inline script sets it before paint from
  a review-only localStorage key, and the styleguide offers the "[ SHARP / PILL / OFFSET ]"
  switch:
  - **sharp** (default): radius 0
  - **pill**: `--radius-control: 999px` for buttons, segmented controls, tags and inputs; rows,
    cells, tables and graphics stay square
  - **offset**: radius 0 plus a solid 4px ink block behind (a pseudo-element, no blur); hover
    lifts 1px, press moves the button into its shadow

  Mixing styles on one screen is not possible, since there is one attribute. Once the owner
  picks one, the switch and the key are removed.
- **Segmented control** (theme, test length, axis picker, the on/off switch): equal segments
  and an inverted copy of the labels clipped to the selected segment, which slides with
  clip-path. Radiogroup semantics, roving focus, arrow keys. EN/DE/FR uses the same look but
  stays a set of links with `aria-current`, because changing language is navigation, not a
  form choice.
- **Navigation:** the underline draws in on hover; the current section has a bar that slides
  between items (transform only) plus brackets. On phones a native popover gives a full-screen
  inverted sheet in display type, items arriving in 40ms steps. It works without JavaScript.
- **Header:** sticky, solid paper, a 1px rule. An 8px ordered-dither band (8×8 Bayer, dense to
  empty) appears once the page has scrolled, in place of a shadow or blur.
- **Rows:**
  - Mode rows are whole-row links, at least 72px tall: wipe, START slides in, arrow rolls.
    Standard carries a permanent inverted RECOMMENDED tag; Deep is dashed, says "opens soon"
    and has no hover.
  - Answer rows are full-width: press wipes, the chosen row stays inverted and its "[X]" draws
    in over 120ms. Keycaps 1–5 show on desktop; auto-advance waits `ADVANCE_DELAY_MS` = 180.
  - Only clickable rows and cards have hover effects. The axes table rows qualify, because they
    reveal what the axis measures.
- **Sliders:** a ruled track with ticks, a thumb that grows while dragged, a bordered readout
  that follows it, arrow keys, optional snap to ticks (10 points).
- **Links:** underlined at rest (colour cannot set them apart); a 2px rule draws in on hover;
  external links get a small arrow. **Tooltips:** 300ms hover delay, 120ms entrance, at once on
  focus or tap, Escape closes. They are `display: none` when closed, so they never widen the
  page, and are shifted to stay in the viewport.
- **Structure:** 2px rules for structure, 1px for dense data and the sticky header. An 8px
  spacing grid, sections padded `clamp(64px, 10vw, 160px)`, borders not nested inside
  components, a rotated running head in the left margin on wide screens, nothing below 12px.
- **Not built:**
  - **View transitions:** optional. Next's client-side navigation would need an experimental
    flag, which is not worth it for ≤ 160ms.
  - **The ideology ticker:** optional, and it would duplicate the index.

**D-081 · 🟢 · Home page and app screens (Design V2, for review).**
- **Composition:**
  1. header
  2. hero: headline, one-sentence subline, mode rows, hero field
  3. stat strip, counted from the data at build time: 12 axes, N ideologies, 36/72/144
     questions, 0 accounts
  4. "01 / How it works": giant numerals 1–2–3 and small 1-bit diagrams
  5. "02 / The 12 axes" on an inverted band: a ruled table of code, name, poles and a tick
     scale; hover or focus shows what the axis measures
  6. "03 / Index of ideologies": book-style index with dotted leaders, shapes and codes, plus
     counts per spectrum
  7. an inverted privacy band in display type
  8. footer: three ruled columns, then the wordmark across the full width, cropped at the
     bottom
- **Two variants** for the owner to choose between, both responding to the control-style
  switch. The current `/` keeps the reset's landing (with mode rows) until the choice.
  - `/styleguide/home-a` "specimen": headline and modes on 5 columns, the field on 7 columns
    and two rows
  - `/styleguide/home-b` "typographic": the headline up to ~11vw across the grid, modes on 7
    columns, the field a smaller figure on 5

  On phones both run headline, field, modes. Headline tracking is −0.02em at weight 800 with
  0.92 leading; no glyph collisions at 390, 768, 1440 or 1920px.
- **Hero field (FIG. 01):**
  - **Data:** the real catalog on the overall map. `lib/catalog/map.ts` is the one PCA used by
    both build-derived and the field, and `derived.json` stayed byte-identical. One scale for
    both components, so distances are honest.
  - **Drawing:** halftone density from a Gaussian kernel; spectrum markers drawn on paper
    knock-outs; crop marks and rulers; the caption "FIG. 01 — CATALOG, N ENTRIES" and the
    variance share. Marker size, kernel width and label count scale with N.
  - **Labels:** placed greedily without collisions; five majors fit a phone, minors appear only
    on wide figures.
  - **Server render:** a complete SVG, so it works without JavaScript and never blocks LCP.
  - **Live layer** (1.9 KB gzipped):
    - deterministic stepped drift at 10 fps (zero at frame 0, so the server picture is the
      first frame)
    - paused off screen or in a background tab, static with reduced motion
    - a crosshair snapping to the nearest ideology, with a mono readout (name, code, PC1, PC2)
    - click or tap to jump to the index entry, until entry pages exist (Phase 5)
    - arrow keys and Enter for keyboard users, with a live region

    A "View as list" disclosure lists every entry.
- **App screens, designed now** (`/styleguide/screens`):
  - **Test screen (Phase 3):** a huge question number; the statement in display type; answer
    rows; progress as one tick per question.
  - **Result poster:** a giant match numeral; the ideology in display type; spectrum shape,
    code and family; 12 ruled axis rows with black bars and a hatched uncertainty band. It
    doubles as the share card (Phase 8).

  Dashboard and compass reuse the halftone and dashed dated trail from D-077.
- **Captures:** `npm run design:capture` writes 16 full-page screenshots and three WebM
  recordings, one per control style, to `docs/design/`.
- **Measured** (local production build, mobile Lighthouse):
  - home A: performance 99, accessibility 100, best practices 100, CLS 0
  - home B: performance 97, accessibility 100, best practices 100, CLS 0


**D-082 · 🟢 · Display preferences survive a language switch (bug fix, 2026-10-23).**
- **Symptom:** after EN → DE (any pair) the LIGHT/DARK toggle vanished until a reload, and the
  control style fell back to its default.
- **Root cause:** `app/[locale]/layout.tsx` is the root layout and renders `<html>`. A locale
  change remounts it, and React 19 strips every attribute it does not render from the `<html>`
  singleton on remount. `data-theme` and `data-controls` were written by the pre-paint inline
  script, outside React, and that script does not run again on a client-side navigation. The
  toggle hides itself without `data-theme`, so it disappeared.
- **Fix:** one self-contained `applyPreferences()` (`lib/design/preferences.ts`). It is
  serialized into the inline script for first paint, and run again by `<PreferenceSync />` in a
  layout effect each time the root layout mounts, which is the same commit in which React
  clears the attributes, before paint. No reload, no flash. Keeping the locale out of the root
  layout was rejected: `<html lang>` needs the locale, and next-intl's static rendering relies
  on it as a root param (D-057).
- **Also:** focus returns to the chosen language after the switch (it fell to `<body>`).
- **Regression test:** `tests/e2e/locale-state.spec.ts` checks all six locale pairs on desktop
  and phone: theme, control style, `lang`, hreflang, soft navigation, focus, and that the
  toggle still works.


**D-083 · 🟢 · Motion rebuilt on one composited, direction-aware wipe (2026-10-23).**
- **Audit:** `scripts/capture-motion.ts` records the interactions at quarter speed and traces
  a mode-row hover with a per-frame probe. Both builds were measured on the same page.

  | | Before | After |
  |---|---|---|
  | Wipe | revealed an aria-hidden duplicate of the content with clip-path | one slide panel |
  | Paints | 19 | 13 (≤ 0.29 ms each) |
  | Moving frames | 28 | 47 |
  | Largest step per frame | 1.0 (a full-row snap in one frame) | 0.19 |
  | Duration | 220 ms on a 1 300 px row | 380 ms on rows, 200 ms on controls |
  | Direction | always from the left | entry and exit side |
  | Keyboard focus | ring only | ring and wipe |
  | Longest frame | 16.8 ms | 16.8 ms |

  Clips: `docs/design/motion-before.webm` and `motion-after.webm`.
- **New model:** each host gets `<Wipe />`, one aria-hidden panel, `will-change: transform`,
  moved only by `transform`. It inverts what lies under it with `mix-blend-mode: difference`
  against `--blend-light`, an alias of whichever token is white in the current scope, so no
  third colour exists.
  - On pure black and white, difference with white is an exact ink↔paper swap. Fill, label,
    tags, arrows and focus rings flip in the same pixel and frame, with no duplicated content
    to keep in sync.
  - Resting states stay pure ink or paper; the colour audit checks them.
  - Forced colours hide the panels (system colours would not invert cleanly); print hides
    them too.
- **Direction:** `<WipeDirection />` is one delegated listener in the root layout. A mouse
  entering a host sets `data-wipe-in` and moves the resting panel, without animation, to the
  entry side first. Leaving sets the exit side, so the panel goes out that way. A panel still
  moving just reverses from where it is, which is the interruptible case. Touch keeps
  `:active` only. Without JavaScript, CSS `:hover` (under `scripting: none`) wipes from the
  left.
- **One "engaged" state** drives everything: the pointer (`data-wipe-in`), keyboard focus
  (`:focus-visible`) and pinned styleguide states (`data-state="hover"`). It covers the wipe,
  arrow roll, START slide-in, text-button underline and the offset lift.
- **Segmented controls** use the same inverting panel, one segment wide and moved by
  `translateX`. **Header band, mobile sheet and START word** are transform-only now; they
  were clip-path.
- **Shared and enforced:**
  - **Tokens:** `--ease-out`, `--ease-spring`, `--dur-fast`, `--dur`, `--dur-slow`,
    `--dur-wipe`, `--dur-wipe-row`, `--dur-underline`, `--dur-draw`, `--dur-check` and
    `--dur-ticks`, all 0s under reduced motion.
  - **Components and classes:** `<Wipe />` + `.wipe-host`, `<WipeDirection />`,
    `<SegmentIndicator />` and `<RollingArrow />`.
  - **`scripts/check-motion.ts`** (in `npm run check` and the "Design guards" CI job, with unit
    tests) fails on:
    - transitions of anything but transform or clip-path (display, overlay and visibility are
      allowed as discrete);
    - raw durations outside the tokens, and keyframes that change other properties;
    - `mix-blend-mode` outside `app/controls.css`;
    - Tailwind motion utilities or inline transitions in UI code;
    - a wipe panel rendered by hand.


**D-084 · 🟡 · Home variant and control style: safe defaults (2026-10-23).** The owner approved
the design without naming a home variant or a control style. Defaults, both cheap to reverse:
- `/` now renders home A, "specimen", where the live catalog field shows what the product does
  above the fold.
- The control style stays **sharp**, the documented default.
- `/styleguide/home-b` and the review-only style switch stay, so the choice can still be made.
  Switching to B is a one-line change in `app/[locale]/page.tsx`; fixing a style means
  removing the switch and its storage key.

**D-085 · 🟢 · Phase 3: test, results and pilot (2026-10-23).**
- **Storage:** IndexedDB database `spectrum` v1 (`lib/storage/db.ts`), with three stores:
  - `drafts`: one key per mode, so Quick and Standard keep separate drafts;
  - `results`: auto-increment;
  - `settings`: auto-advance.

  If IndexedDB is unavailable, a memory store takes over and the test shows a notice (D-019).
  Answers given before the store has opened are merged into the stored draft, not dropped.
- **Upgrade by prefix:** Quick is the first 36 items of Standard. "Sharpen" copies the Quick
  answers into the Standard draft and opens question 37. Answers are never re-asked.
- **Statements are English in DE and FR** until Phase 9: they are marked `lang="en"` and the
  test shows a one-line notice. The UI around them is translated.
- **Results are computed in the browser.**
  - The catalog data (coordinates, τ, indices, Map PCA, versions) is serialised at build time
    from `generated/derived.json` into the page; nothing is fetched at runtime.
  - The stored answers are re-scored whenever the page opens (§6.8).
  - "Most unusual" and "most typical" mean relative to the catalog of ideologies, not to other
    people. There is no population data, and the copy says so.
- **Share:** pressing the button encodes the result code. `/results/<code>` is the only
  dynamic route: it decodes on the server, stores nothing, and gives a broken or tampered code
  a plain message. The private `/results` page never puts anything in the URL (D-018).
- **Pilot:**
  - It keeps answers in memory only: no IndexedDB, no cookie.
  - A language switch remounts the page and loses the pilot answers. That is accepted for an
    unlinked page, and the consent screen says so.
  - The analysis treats a mirror pair as consistent unless the two answers point in opposite
    directions.
- **Not in this phase:**
  - Deep has no static pages until the Deep bank exists (Phase 9).
  - The results page links to the compass instead of embedding a preview (added in Phase 4).
  - The radar, eras, countries, figures and parties sections wait for their data (Phase 5).

**D-086 · 🟢 · Phase 4: the static compass (2026-10-23).**
- **SVG, not Canvas** (revises D-017). The figure renders on the server, so it works without
  JavaScript and its first paint is the real picture. 53 markers plus a 30 × 30 halftone
  lattice is about 1,000 nodes; at 300 entries it is about 1,250. A view change measured a
  median frame under one vsync in the e2e frame test.
- **One linear model for every dimension** (`lib/compass/geometry.ts`):
  - The 12 axes, the usable category indices (D-015, all four today) and the two map
    components (D-016) are each written as weights over the 12 coordinates.
  - So the catalog, the user and the user's uncertainty project the same way, and unit tests
    check them against the engine's index and the build-time PCA.
- **Scales:**
  - Axes and indices share the fixed −100…+100 scale.
  - Map fits one span to the catalog for both components, so distances stay honest.
- **Halftone:**
  - It is a fixed lattice of dots, each scaled to the kernel density at that point.
  - The kernel narrows as the catalog grows, so structure survives at 300+.
  - A view change animates each dot's `scale` and each marker's `translate`. That is
    transform only, on `--dur-slow`, and instant under reduced motion.
- **You:**
  - The latest stored result appears as an outlined, hatched ellipse with a crosshair and a
    "You" tag.
  - The radii are the results page's likely-range half-widths, combined across axes as if
    the axes were independent (√Σ(wᵢhᵢ)²). That is a display choice, not a statistical claim.
  - The ellipse is not animated in size; it snaps while its centre glides.
  - It is read from IndexedDB in the browser and never enters the URL.
- **Labels:**
  - Greedy and collision-free, fitted to the rendered width, because the text stays 12px.
  - The outermost entry of each spectrum goes first.
  - Labels avoid every marker's knock-out and the "You" tag.
  - A phone shows a handful and a desktop a few dozen. A unit test checks that none overlap
    at 53 and 300 entries.
- **Pole names** sit outside the plot (above it, and below it in a row), so they never hide
  data.
- **Keyboard and text alternatives:**
  - The plot is one focusable group. Arrow keys go to the nearest entry in that direction
    within a 60° cone, wrapping at the edge. Escape clears.
  - A polite live region announces each step and each view change.
  - A table lists every entry, plus "You", with both values.
- **Mini compass:** the results page shows the Map view with the user (a new section, "On
  the map").
- **Deferred:**
  - zoom and pan;
  - spectrum and family filters, layers, small multiples and the ghost compare;
  - PNG export;
  - the trail (Phase 8).

  The picker offers a "Map" or "Two axes" mode. Choosing the other axis's dimension swaps the
  two axes instead of plotting one against itself.

## H. Open items

- **Owner's choice, defaults applied (D-084):** home A and sharp are live on the branch; confirm
  or switch (B, pill, offset). Then the review switch goes.
- Final domain (before Phase 7).
- Optional: rewrite the first commit's author field (machine-local address) — needs a force push
  of `main`; owner's call.
