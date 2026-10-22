import type { IdeologyInput } from "@/lib/schema/entries";

export default {
  id: "juche",
  kind: "ideology",
  status: "stub",
  tier: "A",
  names: { en: "Juche" },
  slugs: { en: "juche" },
  aka: ["Kimilsungism–Kimjongilism"],
  spectrum: "radical-left",
  tags: [],
  family: "marxism",
  labelStatus: "self-described",
  termOrigin: {
    en: "Official ideology of North Korea, traced to Kim Il Sung's 1955 speech on establishing Juche in ideological work and declared a distinct ideology by Kim Jong Il in the 1970s.",
  },
  extremist: true,
  estimate: false,
  coords: {
    distribution: -90,
    ownership: -95,
    trade: -95,
    liberty: 100,
    centralization: -100,
    participation: 100,
    tradition: 30,
    religion: -90,
    ecology: -50,
    nation: -85,
    intervention: -10,
    borders: 100,
  },
  salience: {
    distribution: 0.8,
    ownership: 0.9,
    trade: 0.9,
    liberty: 1,
    centralization: 0.8,
    participation: 0.9,
    tradition: 0.4,
    religion: 0.6,
    ecology: 0.2,
    nation: 0.8,
    intervention: 0.4,
    borders: 0.7,
  },
  rationale: {
    en: "Defined by self-reliance in politics, economy and defence (toward autarky), a totalising single-leader system with hereditary succession (Authority, unelected rule) and a primacy of the Korean nation that departs from Marxist-Leninist internationalism; property is collective and religion suppressed.",
  },
  placement: {
    confidence: "medium",
    reason: {
      en: "Doctrine is published by the state and revised with each leader, so stated principles and practice are hard to separate.",
    },
  },
  classificationNote: {
    en: "Placed on the radical left for its Marxist-Leninist lineage and collective ownership; its ethnic nationalism, self-reliance and dynastic succession lead some scholars to compare it with nationalist third-position ideologies.",
  },
  sources: [
    {
      title: "Juche",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Juche",
      kind: "encyclopedia",
      accessed: "2026-10-21",
    },
    {
      title:
        "On Eliminating Dogmatism and Formalism and Establishing Juche in Ideological Work (Kim Il Sung, 1955)",
      publisher: "Marxists Internet Archive",
      url: "https://www.marxists.org/archive/kim-il-sung/1955/12/28.htm",
      kind: "primary",
      accessed: "2026-10-21",
    },
  ],
  review: { status: "draft", by: "claude-subagent-a", date: "2026-10-21" },
} satisfies IdeologyInput;
