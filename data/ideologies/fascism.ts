import type { IdeologyInput } from "@/lib/schema/entries";

export default {
  id: "fascism",
  kind: "ideology",
  status: "stub",
  tier: "A",
  names: { en: "Fascism" },
  slugs: { en: "fascism" },
  spectrum: "far-right",
  tags: [],
  family: "fascism",
  labelStatus: "self-described",
  termOrigin: {
    en: "Taken by Benito Mussolini's movement from the fasci (leagues) it founded in 1919 and from the Roman fasces; scholars also use 'fascism' generically for related interwar and later movements.",
  },
  extremist: true,
  estimate: false,
  coords: {
    distribution: -20,
    ownership: 10,
    trade: -75,
    liberty: 90,
    centralization: -90,
    participation: 100,
    tradition: 60,
    religion: 20,
    ecology: -40,
    nation: -100,
    intervention: -100,
    borders: 70,
  },
  salience: {
    distribution: 0.4,
    ownership: 0.4,
    trade: 0.5,
    liberty: 1,
    centralization: 0.7,
    participation: 0.9,
    tradition: 0.6,
    religion: 0.3,
    ecology: 0.2,
    nation: 1,
    intervention: 0.8,
    borders: 0.5,
  },
  rationale: {
    en: "Defined by ultranationalism that places the nation above all other loyalties and laws, a totalitarian one-party state under a single leader (Authority, unelected rule) and the glorification of war and imperial expansion (Interventionist); its corporatist economy kept private property under state direction and aimed at autarky.",
  },
  placement: {
    confidence: "high",
    reason: {
      en: "Extensively studied; the Italian case anchors the coordinates, while generic fascism varies mainly on race and religion.",
    },
  },
  classificationNote: {
    en: "Placed on the far right rather than in the third position, following scholarly consensus: fascists presented their movement as a 'third way' beyond capitalism and communism, but its ultranationalism, hierarchy and alliances with conservative elites place it on the far right.",
  },
  sources: [
    {
      title: "Fascism",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Fascism",
      kind: "encyclopedia",
      accessed: "2026-10-21",
    },
    {
      title: "Fascism",
      publisher:
        "Encyclopedia.com (New Dictionary of the History of Ideas and other Gale reference works)",
      url: "https://www.encyclopedia.com/social-sciences-and-law/political-science-and-government/political-science-terms-and-concepts/fascism",
      kind: "encyclopedia",
      accessed: "2026-10-21",
    },
    {
      title: "Benito Mussolini: What is Fascism, 1932",
      publisher: "Internet Modern History Sourcebook, Fordham University",
      url: "https://sourcebooks.fordham.edu/mod/mussolini-fascism.asp",
      kind: "primary",
      accessed: "2026-10-21",
    },
  ],
  review: { status: "draft", by: "claude-subagent-b", date: "2026-10-21" },
} satisfies IdeologyInput;
