# Catalog content style

Applies to every catalog entry: ideologies, regimes, countries, figures and parties. It
covers generation subagents and reviewers alike. Decisions behind it: D-030, D-031, D-046
to D-051, D-065 and D-091.

## 1. Voice and tone
- **Neutral and descriptive:**
  - Describe what adherents believe and what happened, with no verdicts.
  - Attribute claims ("supporters argue…", "critics such as … contend…").
  - Never write "rightly", "so-called", "evil", "heroic" or similar words in your own voice.
- **Symmetric treatment:** a left-wing and a right-wing entry of the same weight get the same
  structure, length and kind of wording. Scholarly classifications ("far-right", "totalitarian")
  are attributed to scholars, not asserted.
- **Plain English:** short sentences, no jargon without a gloss, and British spelling ("organise",
  "labour"). The summary is 50–120 words.
- **No copied prose.** Paraphrase everything. A direct quotation is at most 15 words and
  attributed.
- **No symbols:** no flags, emblems, salutes, uniforms or slogans as headings. Slogans may
  appear only as short quotations in historical context.
- **Living people** in key thinkers: name, years and a factual note only.

## 2. Extremist entries (`extremist: true`)
- The voice is third person ("Adherents hold that…"). No "we", "our" or "us".
- A **harms** section is mandatory. It covers documented violence, repression or
  discrimination, each claim backed by a listed source. Keep it factual and specific: dates,
  places, scale as the sources give it.
- No exclamation marks anywhere.
- **Atrocity flag (D-030, D-065):** set `atrocity` on an ideology only when genocide is
  established by an international tribunal or broad scholarly consensus **and** scholarship
  treats it as the direct implementation of that ideology's own programme. Otherwise the harms
  section names the regime or event; the flag goes on the regime entry later.

## 3. Labels and placement
- **`labelStatus`:**
  - `self-described`: adherents use the name.
  - `academic`: a scholarly category.
  - `contested`: the name is rejected or disputed by those it describes, or used mainly as a
    pejorative.
  - `academic` and `contested` need `content.en.nameNote`, covering who uses the term, who
    disputes it and how adherents describe themselves.
- **`termOrigin`:** where the name comes from, in one or two sentences.
- **`placement.confidence`:**
  - `high`: well-studied, a clear programme.
  - `medium`: varies between currents or countries.
  - `low`: defining ideas lie off the twelve axes, or the sources disagree.
  - Give a one-line reason.
- **`spectrum`:** one of the nine spectra. *Theocratic* is only for currents that make
  religious law or clerical rule the basis of the state. If the spectrum could be argued,
  add a `classificationNote`.
- **`family` and `parent`:**
  - The family comes from `data/families.ts`.
  - A variant sets `parent` to an ideology without a parent in the same family. Depth is
    never more than family → ideology → variant.

## 4. Coordinates
- Twelve axes from −100 (first pole) to +100 (second pole), with meanings in `data/axes.ts`.
  Place every value against the anchors in `data/rubric.ts` (−100, −50, 0, +50, +100) and against
  existing neighbours. Round to 5.
- **Salience** (0–1) is how central the axis is to the ideology. At least one axis is ≥ 0.8. An
  axis the ideology is silent on gets a low salience and a value near its typical practice.
- **The rationale** explains the defining coordinates in one or two sentences and names the
  axes.
- **Avoid unrelated near-duplicates:** run `npx tsx scripts/check-entries.ts <id>`. Any entry
  within 8 points must be a parent or child, or the two must be distinguished on some axis.
- **Model the real programme:** where the real ideology combines unusual positions, keep them
  off-diagonal (e.g. a market economy with collective ownership). Do not pull values towards a
  left–right line.

## 5. Sources (D-031)
- **At least two, from at least two different sites,** and one of them a secondary source that
  is not Wikipedia (SEP, IEP, Britannica, a university press, a journal article, a reputable
  dictionary or encyclopedia).
- **Cite only pages you actually opened in this session,** and confirm each discusses this
  entry. Set `accessed` to the date you opened it. `kind` is one of `encyclopedia`, `academic`,
  `dataset` or `primary`.
- Think-tank glossaries and advocacy sites do not count as independent support. A primary
  text (a manifesto or founding speech) may be added as a third source.

## 6. Ideology fields for a complete entry
- `status: "complete"` and `tier: "A"`.
- `review: { status: "draft", by: "claude-subagent-<batch>", date }`.
- `avatar: { seed: <id>, motif: "glyph" }`. The glyph is generated from the id (D-033).
- `content.en`:
  - `summary`.
  - `voice`: one sentence in the adherents' own terms; third person if extremist.
  - `coreBeliefs`: 3–7 items.
  - `origins`: one paragraph.
  - `keyThinkers`: at least one, as `{ name, years?, note? }`.
  - `historicalExamples`: at least one.
  - `criticisms`: at least two, as `{ point, from }`. `from` names a perspective or critic,
    and the criticisms come from **at least two different directions**.
  - `harms`: required if extremist.
  - `nameNote`: required if the label is academic or contested.

## 7. Privacy
Never put personal data of the project owner or anyone else into files, headers or requests.
A User-Agent contact, if one is ever needed, is `+https://github.com/keller-tg/spectrum`.
