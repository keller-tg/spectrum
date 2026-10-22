# How scoring works

Spectrum is an interpretation tool. Everything below is deterministic, documented and unit-tested
(`lib/engine`, pure TypeScript with no UI or I/O). Constants marked *provisional* will be tuned once
real (opt-in, anonymous) data exists.

Engine version: see `lib/engine/version.ts`. Every stored result keeps its answers and the engine
version it was scored with, so results can be recomputed when the model changes. The UI then
offers "as taken" and "recomputed" views.

---

## 1. Answers

Each statement is answered on a five-point scale: strongly disagree (−2), disagree (−1),
neutral (0), agree (+1), strongly agree (+2). **"Unsure, skip" is a separate answer (`null`)**.
It is excluded from scoring, while neutral counts as a real answer at the centre.

Every question has a **key**: `+1` if agreeing moves you toward the axis's second-named pole
(+100), `−1` if toward the first-named pole (−100). The keyed value of an answer is

```
x = key · r / 2          ∈ [−1, +1]
```

## 2. Axis score: equal weight for both keying directions

On each axis, the answered `+`-keyed items share half of the weight and the answered `−`-keyed
items share the other half:

```
m₊ = weighted mean of x over answered +-keyed items
m₋ = weighted mean of x over answered −-keyed items
score = 100 · (m₊ + m₋) / 2                    (both sides answered)
score = 100 · weighted mean of x               (only one side answered; confidence × 0.8)
```

*Why:* modes are prefixes of one question list (Quick 36 ⊂ Standard 72 ⊂ Deep 144). Standard and
Deep are keyed 3+/3− and 6+/6− per axis, where this is exactly the ordinary weighted mean. Quick
has three items per axis, so one direction necessarily has two. Equal side weights mean that
someone who answers "agree" to everything gets `m₊ = +0.5`, `m₋ = −0.5`, and a score of
**exactly 0 on every axis, in every mode**. The quality check flags that pattern too (§4).

Worked example (Quick, one axis with items A+, B+, C−): answers agree, agree, strongly disagree →
x = 0.5, 0.5, +1 → m₊ = 0.5, m₋ = 1 → score = 75.

## 3. Confidence per axis (provisional)

```
confidence = n/(n + 2) · (1 − variance) · (0.8 if only one keying side answered)
```

- `n/(n+2)`: more answers, more certainty. With no skips and fully consistent answers this gives
  Quick 0.60, Standard 0.75 and Deep 0.86.
- `variance` is the weighted variance of the keyed answers around the score. Answers that pull in
  opposite directions lower confidence. If it exceeds 0.25 (SD > 0.5), or a mirror pair contradicts
  (§4), the axis gets a gentle note: *"your answers pull in opposite directions here."*

Overall confidence is the mean of the 12 axis confidences, halved when the result is flagged low
quality.

## 4. Consistency and quality (provisional thresholds, `lib/engine/quality.ts`)

| Flag | Rule | Effect |
|---|---|---|
| straightline | ≥ 80% of answers identical, or a run of identical answers ≥ 70% of all answers (needs ≥ 12 answers) | low quality |
| acquiescence | \|mean raw answer\| ≥ 1.0 (keying is balanced, so consistent views average near 0) | low quality |
| contradiction | a *mirror pair* (two near-opposite statements on one axis) answered ≥ 1.5 apart in keyed terms; flagged when ≥ 2 pairs and ≥ 25% of answered pairs | low quality, plus per-axis notes |
| fast | median time per answer under 1.2 s | low quality |
| sparse | ≥ 40% skipped | lower confidence only |

Low-quality results lead with a gentle note instead of a confident verdict, and the dashboard
leaves them out of trend lines by default (the user can include them).

## 5. Category indices (Economic, Governmental, Societal, Diplomatic)

There are no editorial sign conventions. For each category, `build-derived` runs a principal
component analysis over the catalog's coordinates on the category's three axes:

```
loadings l = first principal component, oriented so the category's first axis loads positively
index     = Σ lᵢ·sᵢ / Σ|lᵢ|          ∈ [−100, +100]
```

So the negative end matches the first-listed pole of the category's first axis (Equality,
Liberty, Progressive, Nationalism). The index is not mean-centred, so 0 means neutral on all three
axes. The UI shows the loadings and the explained variance. **When the first component explains
less than 50% of the variance, the category shows its three axes instead of one index**, because a
single number would hide too much.

## 6. Matching

Every catalog entry has coordinates on all 12 axes and a **salience** per axis (0–1: how central
that axis is to the entry).

```
weight   wₐ = cₐ · (0.2 + 0.8·σₐ)            c = your confidence, σ = entry salience
distance d  = √( Σ wₐ (sₐ − eₐ)² / Σ wₐ )    weighted RMS gap in axis points (0 … 200)
similarity  = 100 · 2^(−(d/τ)²)              shown rounded, capped at 99 %
```

- Axes you barely answered barely count. The 0.2 salience floor stops an entry defined by only one
  or two axes from matching everyone.
- **τ** (the distance at which similarity is 50%) is fitted per catalog kind on a seeded synthetic
  population: 20,000 users, 70% scattered around catalog entries (SD 25) and 30% uniform in
  [−80, 80]. τ is chosen so the median best match is 75%, which typically makes the top five
  span roughly 75 → 55%.
- **This curve is a placeholder.** Real users cluster near the centre, so τ must be re-tuned on
  opt-in community data once it exists.
- **Percentiles were rejected:** a best match is by definition closer than nearly everything else,
  so percentile scaling pushes every top match to 95%+.

**What the results show**

- **Closest family** is the family's salience-weighted centroid.
- **Closest ideology** is the best entry that has no parent.
- **Closest variant** is the best entry that has a parent, shown under that parent.
- **The top five** contain ideologies only. Variants collapse into their parent, so the list is
  never ten near-duplicates.
- **"In between X and Y"** appears when the top two are within 4 points.
- **Furthest from you** is the entry with the largest distance.
- **Headline rule:** an entry whose placement confidence is *low* never leads if a medium or high
  entry is within 3 points.
- **Share cards:** an entry under the atrocity-context policy is never the hero of a share card.
  It is still shown, with a context note, and never hidden.

## 7. Calibration tests (`npm run calibration`)

Simulated respondents are generated from each ideology's coordinates. For every question the
latent response is `2 · key · coord/100 + N(0, σ²)`, rounded to the five-point scale. They are
scored and matched by the real engine. Results are reported at σ ∈ {0, 0.5, 0.8, 1.0}, and the
gates apply at σ = 0.5. Until the Deep items exist, Deep uses the Deep *bank structure*.

| Gate | Requirement |
|---|---|
| (a) Deep | own ideology (or a parent/child/same-family entry) in the top 3 for ≥ 90% |
| (a) Standard | the same, ≥ 80% |
| (a) Quick | own ideology in the top 5, or top match in the same family, ≥ 80% |
| (b) | answering the same thing to everything gives exactly 0 on all axes in every mode, and is flagged |
| (c) | no simulated respondent ranks a clearly opposite entry (unweighted distance ≥ 100) above their own archetype |

Strict numbers (exact entry at ranks 1, 3 and 5) and parent/child-only numbers are reported next
to the gated values. **Catalog data is never adjusted to pass a gate**; failures are reported.

The gates assume idealised respondents. A robustness grid (reported in
`docs/calibration-report.md`, not gated) repeats the simulation with:

- **response styles:** acquiescent (+0.75 added to every latent answer), midpoint-heavy (neutral
  unless the latent answer is at least 1 away from 0), extremity-averse (never a strong answer);
- **noise** σ ∈ {0.5, 0.8, 1.2};
- **item difficulty offsets:** each item gets a fixed offset ~ N(0, SD²), SD ∈ {0, 0.3, 0.6}, so
  some statements are easier to agree with than others;
- a **mixed population** (styles at random, σ 0.8, offsets 0.5).

It also computes, exactly rather than by sampling, the expected axis scores of a **true centrist**
(every coordinate 0). With balanced keying a style that shifts every item equally cancels out, so
the centrist stays at exactly 0 under every style; only item offsets move them. The pilot
(Phase 3) measures the real offsets.

## 8. Share codes

A share code is 23 bytes (31 base64url characters):

- format version
- mode and quality flags
- 12 scores as signed bytes
- 12 confidences as 4-bit values
- engine version
- a CRC-8 checksum

It contains scores only, never answers, and is created only when you press Share. Malformed or
tampered codes are rejected.
