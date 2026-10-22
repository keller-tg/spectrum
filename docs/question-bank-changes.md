# Question bank: changes in revision 2

Only the items that changed since revision 1 (commit `0ce76c6`), with the reviewer agent's verdict on each. Position numbers are the **new** order. The full list is in [`question-bank.md`](question-bank.md).

**Unchanged on purpose:** the axis and key at every position. So 3+/3− per axis in Standard, Quick at 18/18, one mirror pair per axis inside Quick (≥ 15 apart), and "all agree = exactly 0, flagged" all hold as before (validator and tests green). Changed meanings get new ids; the 14 old items are retired, not deleted (D-069).

**Summary:** 17 positions changed: 14 new items and 3 moved items. The Quick empirical-claim cap (≤ 1 per axis) is enforced by the validator. Quick has one each on ownership (#29), centralization (#35), ecology (#25) and social change (#17).

## 1. Pole labels

| Axis | Before | After | Tooltips |
|---|---|---|---|
| 6. Participation | Rule by the many ↔ Rule by the few | **Citizens decide directly ↔ Representatives/experts decide** (short: Direct ↔ Delegated) | − unchanged; + now: "Decisions are best left to elected representatives and experts, or at the far end to a party or a crown." #45 stays the non-democratic anchor. |
| 8. Religion and state | Secular ↔ Religious | **Separation of religion and state ↔ Religion in public life** | unchanged |
| 12. Migration | Open borders ↔ Closed borders | **Open ↔ Restrictive** | Open now: "Moving to and settling in another country should be easy, with few barriers." (reviewer: the old one described only free movement, which a liberal-immigration voter would not sign). Restrictive unchanged. |
| 7. Social change | (measures) family, gender and custom | (measures) norms and customs, *for example* on family, gender and the end of life | — |

Catalog summaries that quoted the old labels now use the new ones; autocracies read "unelected rule". The Restrictive glyph is a lowered checkpoint barrier instead of a shut gate.

## 2. Changed items

### 2. Ownership

**#5** · Quick · your request 3

- **Before:** Services such as water and electricity are best provided by private companies.  
  <sub>`q-own-01` · agree → Private ownership · ?: “Provided” means the companies own and run the service; the state may still set rules for it.</sub>
- **After:** Most large companies should be privately owned.  
  <sub>`q-own-07` · agree → Private ownership · ?: Privately owned means owned by individuals, families or shareholders, rather than by the state, the public or the workers as a group.</sub>
- **Why:** The Quick mirror pair moves from utilities to a larger-scope question: who should own most large companies.
- **Reviewer:** accept · easy to agree

**#22** · Quick · your request 3

- **Before:** Companies that supply water and power should be owned by the public.  
  <sub>`q-own-02` · agree → Collective ownership, mirror of #5 · ?: “Owned by the public” can mean the state, a municipality or another public body acting for citizens.</sub>
- **After:** Most large companies should be owned collectively rather than privately.  
  <sub>`q-own-08` · agree → Collective ownership, mirror of #5 · ?: Collective ownership means ownership by the state, a municipality or another public body, or by the workers as a cooperative.</sub>
- **Why:** Mirror of #5 (privately vs collectively). "Collectively" covers both state ownership and worker cooperatives, so state socialists and libertarian socialists both answer in the intended direction.
- **Reviewer:** accept · hard

**#40** · Standard · follows from request 3 (found by the reviewer)

- **Before:** More companies should be owned by the people who work in them.  
  <sub>`q-own-04` · agree → Collective ownership · ?: Worker ownership is often organised as a cooperative, in which each member has a vote.</sub>
- **After:** Companies that supply water and power should be owned by the public.  
  <sub>`q-own-02` · agree → Collective ownership · ?: “Owned by the public” can mean the state, a municipality or another public body acting for citizens.</sub>
- **Why:** The old #40 ("**More** companies should be owned by the people who work in them") broke the rule against wording relative to today's situation. The utilities item from the old #22 moves here, so the axis keeps one infrastructure item. That item is what separates a mixed economy (the rubric's 0 anchor) from market liberalism.
- **Reviewer:** accept · easy–medium (proposed by the reviewer; optional "water and electricity networks" not adopted, to keep an existing id)

**#62** · Standard · your request 3

- **Before:** Companies that extract oil, gas and minerals should be owned by the state.  
  <sub>`q-own-06` · agree → Collective ownership · ?: Extraction means mining or drilling natural resources out of the ground.</sub>
- **After:** Most large banks should be owned by the public or by their customers, rather than by private investors.  
  <sub>`q-own-09` · agree → Collective ownership · ?: Owned by the public means by the state, a region or a municipality. Owned by customers means a cooperative bank, such as a credit union.</sub>
- **Why:** A second larger-scope domain (banks), replacing the sector-specific extraction item. It includes cooperative banks, consistent with #22, and says "most", so someone who wants one public bank beside private ones is not forced to agree.
- **Reviewer:** revised as the reviewer suggested → accept · hard (medium in CH/DE)

### 7. Social change

**#11** · Quick · your request 2

- **Before:** Children are best raised by a married mother and father.  
  <sub>`q-trad-01` · agree → Traditional · ?: This is about which family form is best for children, not about what the law should allow.</sub>
- **After:** Long-standing customs are better kept as they are than changed to fit modern values.  
  <sub>`q-trad-08` · agree → Traditional · ?: Customs are the habits, rituals and norms a society has kept over generations.</sub>
- **Why:** The Quick mirror pair is now the axis's core idea, keeping vs adapting customs. The old #11 (married + mother + father) is **replaced rather than reworded**: a single-idea version ("a mother and a father") would duplicate #17. This item and #31 are exact complements.
- **Reviewer:** first draft ("When in doubt, keep an old custom") was **not** a true complement of #31 → reviewer's wording adopted → accept · medium

**#17** · Quick · your request 2

- **Before:** Traditions should be adapted to modern values rather than kept as they are.  
  <sub>`q-trad-03` · agree → Progressive · ?: Traditions are customs, rituals and norms handed down over generations.</sub>
- **After:** Many different kinds of families can raise children equally well.  
  <sub>`q-trad-02` · agree → Progressive, empirical · ?: Kinds of families include same-sex couples, unmarried couples, stepfamilies and extended families.</sub>
- **Why:** Moved from #31. It is now Quick's only family item, and Quick's only empirical item on this axis. The explainer no longer lists single parents: their children's poorer average outcomes (mostly income-driven) would push evidence-minded progressives to disagree for reasons that have nothing to do with values.
- **Reviewer:** explainer fixed as suggested → accept · medium

**#31** · Quick · your request 2

- **Before:** Many different kinds of families can raise children equally well.  
  <sub>`q-trad-02` · agree → Progressive, mirror of #11 · ?: Kinds of families include single parents, same-sex couples, unmarried couples and extended families.</sub>
- **After:** Traditions should be adapted to modern values rather than kept as they are.  
  <sub>`q-trad-03` · agree → Progressive, mirror of #11 · ?: Traditions are customs, rituals and norms handed down over generations.</sub>
- **Why:** Moved from #17. It is now the mirror of #11.
- **Reviewer:** accept · easy

**#38** · Standard · your request 2

- **Before:** When in doubt, it is better to keep an old custom than to change it.  
  <sub>`q-trad-04` · agree → Traditional · ?: Customs are the habits, rituals and norms a society has kept over generations.</sub>
- **After:** It is wrong for a doctor to help a terminally ill patient end their life, even if the patient asks for it.  
  <sub>`q-trad-07` · agree → Traditional · ?: Terminally ill means the illness cannot be cured and is expected to cause death. This is often called assisted dying; the question is whether it is morally right, not only what the law allows.</sub>
- **Why:** A norm outside family and gender: end of life. "Terminally ill" keeps it on the actual debate.
- **Reviewer:** accept with caveats · hard; overlaps axis 4 (self-determination), acceptable for one Standard item

### 12. Migration

**#12** · Quick · your request 5

- **Before:** My country should accept only a small number of immigrants each year.  
  <sub>`q-bord-01` · agree → Closed borders · ?: Immigrants are people who move to your country to live there long-term.</sub>
- **After:** My country should accept immigrants only if they clearly benefit the country.  
  <sub>`q-bord-07` · agree → Restrictive · ?: This is about people moving to work or settle long-term, not about refugees.</sub>
- **Why:** Replaces the vague "only a small number" with a rule (admit only if they clearly benefit the country). The rule does not depend on the respondent's current immigration level. Together with #28 it splits near the centre.
- **Reviewer:** my first draft (net migration ≤ 0) was rejected together with #28 → reviewer's pair adopted → accept · easy–medium

**#18** · Quick · your request 5

- **Before:** People who enter the country without permission should be sent back quickly.  
  <sub>`q-bord-03` · agree → Closed borders · ?: Sending people back is also called deportation or removal.</sub>
- **After:** People with no legal right to stay, such as rejected asylum seekers, should be deported even after living and working here for five years.  
  <sub>`q-bord-08` · agree → Restrictive · ?: Deportation means the state sends a person to their home country or to another country that accepts them. A rejected asylum seeker is someone whose claim to protection has been turned down.</sub>
- **Why:** Now covers people with no legal right to stay, so it no longer overlaps the refugee item #50. The five-year clause adds the real trade-off (deport vs let long-term residents stay). Without it, the item was close to consensus.
- **Reviewer:** first draft was near-consensus → five-year trade-off added → accept · medium

**#28** · Quick · your request 5

- **Before:** My country should let in most people who want to live and work here.  
  <sub>`q-bord-02` · agree → Open borders, mirror of #12 · ?: Living and working here means settling long-term, not just visiting.</sub>
- **After:** People should be free to move to my country to live and work unless there is a strong reason to refuse them.  
  <sub>`q-bord-09` · agree → Open, mirror of #12 · ?: This is about people moving to work or settle long-term, not about refugees.</sub>
- **Why:** The complement of #12: free movement is the default unless there is a strong reason to refuse. It had to change because the old #28 was the mirror of the old #12.
- **Reviewer:** my first draft ("admit more people than leave") was **rejected** for a keying error (people who want cuts that stay above zero would agree and be scored Open; it also read as "more than now") → reviewer's pair adopted → accept · medium–hard

**#61** · Standard · your request 5

- **Before:** Immigrants should have to live in the country for many years before they can become citizens.  
  <sub>`q-bord-06` · agree → Closed borders · ?: Citizenship gives full rights, such as voting and a passport.</sub>
- **After:** Immigrants should have to live in the country for at least ten years before they can become citizens.  
  <sub>`q-bord-10` · agree → Restrictive · ?: Citizenship gives full rights, such as voting and a passport.</sub>
- **Why:** "Many years" becomes a concrete threshold.
- **Reviewer:** accept · medium overall, but respondents anchor on their own law (10 years is current law in CH/AT, 2–3× the rule in CA/AU/US/IE/FR/DE). Any number does this, so it is documented, not reworded

### 5. Centralization

**#70** · Standard · your request 6

- **Before:** Small municipalities should be merged into larger ones.  
  <sub>`q-cent-06` · agree → Centralized · ?: A municipality is the smallest unit of local government, such as a town or village council.</sub>
- **After:** Equal public services across the whole country matter more than letting regions and towns run them their own way.  
  <sub>`q-cent-07` · agree → Centralized · ?: Public services here means things like hospitals, policing and social care. Regions are units below the national level, such as states, provinces or cantons.</sub>
- **Why:** Municipal mergers measured size, not centralization, and were country-specific. The new item sets equal services nationwide against local control, without assuming regions have control today. The explainer leaves out schools, to avoid overlap with #23.
- **Reviewer:** revised as suggested (first draft said "regions lose control", assuming they have it) → accept

### 11. Foreign intervention

**#43** · Standard · your request 6

- **Before:** Economic sanctions against other countries usually do more harm than good.  
  <sub>`q-int-04` · agree → Restraint · ?: Sanctions are restrictions on trade, finance or travel imposed to pressure a government.</sub>
- **After:** Replacing an undemocratic government should be left to that country’s own people, not to my country.  
  <sub>`q-int-07` · agree → Restraint · ?: Helping to replace a government can mean military action or arming rebels.</sub>
- **Why:** Sanctions measured a tool and made an empirical claim. The new item is normative restraint (no regime change). A first draft about "not taking sides in other countries' wars" duplicated the neutrality item #58, so it was dropped.
- **Reviewer:** two rounds: the neutrality draft overlapped #58; then "brutal" was a loaded term and the explainer bundled soft democracy promotion → reviewer's fix applied verbatim · easy–medium

**#72** · Standard · your request 6

- **Before:** My country should be ready to send troops to help defend partner countries if they are attacked.  
  <sub>`q-int-06` · agree → Interventionist, mirror of #58 · ?: Partner countries are countries your country cooperates with closely.</sub>
- **After:** My country should be willing to use military force abroad to protect its economic interests, such as trade routes.  
  <sub>`q-int-08` · agree → Interventionist · ?: Here, this means interests such as shipping routes and energy supplies.</sub>
- **Why:** "Send troops to defend partners" measured an alliance commitment. The new item covers interest-based use of force, beside the humanitarian #7 and the human-rights #16.
- **Reviewer:** accept · hard (very hard in DE); explainer narrowed to shipping routes and energy ("investments abroad" read as gunboat diplomacy)

### 10. Nation and world

**#32** · Quick · your request 7

- **Before:** I feel as much a citizen of the world as of my own country.  
  <sub>`q-nat-03` · agree → Internationalism · ?: This is about where your sense of belonging and loyalty lies.</sub>
- **After:** Being a citizen of the world is an important part of how I see myself.  
  <sub>`q-nat-07` · agree → Internationalism · ?: This is about where your sense of belonging and loyalty lies.</sub>
- **Why:** The old #32 ("as much a citizen of the world as of my own country") was hard to agree with. The new item asks only that it be part of how you see yourself, so it is medium. An interim draft mentioning "my continent" only worked in Europe.
- **Reviewer:** reviewer's wording · accept · medium

**#39** · Standard · your request 7

- **Before:** A shared national identity is important for holding a society together.  
  <sub>`q-nat-04` · agree → Nationalism · ?: National identity is a common sense of history, culture and belonging to the nation.</sub>
- **After:** Schools should teach children to be proud of their country.  
  <sub>`q-nat-08` · agree → Nationalism · ?: This is about whether national pride should be an aim of education, not about whether history is taught.</sub>
- **Why:** The old #39 ("a shared national identity holds society together") was easy to agree with, and was also an empirical claim. The new item is a medium-difficulty nationalism item that states a value.
- **Reviewer:** accept · medium overall; easy in US/FR, hard in DE

## 3. The reviewer re-run

An independent reviewer agent checked every changed position twice: once on my first draft, then a short final pass on the revised wording. It was asked to look for keying errors, mirror pairs that are not true complements, wording relative to the status quo, portability across UK/IE/US/CA/AU/NZ/CH/DE/AT/FR, overlap with unchanged items, cross-loading and difficulty. The first pass rejected or revised 9 of my 16 drafts; the final pass accepted all but two, whose fixes were then applied verbatim.

**Difficulty by pole (reviewer's estimate, how easy it is to agree for a typical Western European):**

- **Axis 10:** Nationalism #4 medium, #39 medium, #54 medium–hard · Internationalism #24 easy–medium, #32 medium, #65 hard → roughly mirrored.
- **Axis 12:** Restrictive #12 easy–medium, #18 medium, #61 medium · Open #28 medium–hard, #47 medium, #50 medium–hard → close; results may lean slightly Restrictive. If the pilot confirms it, dropping "even when many arrive at once" from #50 levels the poles.

## 4. Open points for you

These are reviewer points I did **not** act on, because they would override a choice you made explicitly or go beyond what you asked:

1. **Axis 6 label.** The + end still reaches one-person or one-party rule (#45), and "Representatives/experts decide" does not describe that. Quick has no non-democratic item, so Quick scores cannot reach that end. *My plan unless you object:* keep your label, and in Phase 3 add a far-end note on the results slider above about +60 ("toward rule without elections"). The reviewer's alternative label is "Leaders and experts decide".
2. **Axis 8 label.** The reviewer argues that "Religion in public life" is not the opposite of separation: US-style separationists and many Christian democrats want both. The + items are about law and state institutions. Its alternative: **"Religion guides law and state"** (short: "Religious influence"). I find that argument convincing; your call.
3. **Axis 7 difficulty.** The Traditional items (#38 assisted dying, #53 mothers as main carers) are hard to agree with in Western Europe, while the Progressive ones (#31, #71) are easy. So results will lean Progressive. Candidate fix: replace #53 with a medium-difficulty traditional item about something other than family. I left #53 because you offered "#53 *or* #11" and #11 went. I suggest deciding after the pilot.
4. **#58 (neutral rather than in a military alliance)** is the same alliance-type item you objected to in #72. The reviewer suggests replacing it next. Not touched, because you didn't flag it.
