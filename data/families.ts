import type { Family } from "@/lib/schema/entries";

/**
 * Ideology families (family → ideology → variant, D-047). A family groups
 * traditions with a shared lineage; members may sit in different spectra.
 * English first; de/fr names arrive with Phase 9.
 */
export const FAMILIES: readonly Family[] = [
  {
    id: "marxism",
    names: { en: "Marxism and communism" },
    spectrumHome: "radical-left",
    description: {
      en: "Traditions descending from Marx's critique of capitalism, aiming at a classless society through collective ownership.",
    },
  },
  {
    id: "socialism",
    names: { en: "Democratic and libertarian socialism" },
    spectrumHome: "left",
    description: {
      en: "Non-Leninist socialism that seeks social ownership through democratic or grassroots means.",
    },
  },
  {
    id: "social-democracy",
    names: { en: "Social democracy" },
    spectrumHome: "left",
    description: {
      en: "Reform of capitalism through welfare states, labour rights and redistribution within liberal democracy.",
    },
  },
  {
    id: "green-politics",
    names: { en: "Green politics" },
    spectrumHome: "left",
    description: {
      en: "Politics organised around ecological sustainability, from reformist green parties to eco-socialism.",
    },
  },
  {
    id: "liberalism",
    names: { en: "Liberalism" },
    spectrumHome: "centre",
    description: {
      en: "Traditions centred on individual rights, constitutional government and market economies.",
    },
  },
  {
    id: "christian-democracy",
    names: { en: "Christian democracy" },
    spectrumHome: "centre",
    description: {
      en: "Democratic politics inspired by Christian social teaching, often favouring a social market economy.",
    },
  },
  {
    id: "conservatism",
    names: { en: "Conservatism" },
    spectrumHome: "right",
    description: {
      en: "Traditions that value continuity, inherited institutions, order and gradual change.",
    },
  },
  {
    id: "national-populism",
    names: { en: "National populism" },
    spectrumHome: "far-right",
    description: {
      en: "Movements that pit a national 'people' against elites and outsiders, usually within electoral politics.",
    },
  },
  {
    id: "fascism",
    names: { en: "Fascism" },
    spectrumHome: "far-right",
    description: {
      en: "Ultranationalist, authoritarian movements of the interwar era and their successors.",
    },
  },
  {
    id: "third-position",
    names: { en: "Third position" },
    spectrumHome: "third-position",
    description: {
      en: "Currents claiming to transcend capitalism and communism by fusing radical economics with nationalism.",
    },
  },
  {
    id: "statist-nationalism",
    names: { en: "Statist nationalism" },
    spectrumHome: "third-position",
    description: {
      en: "State-led nationalist modernisation projects, often in post-colonial or post-imperial settings.",
    },
  },
  {
    id: "monarchism",
    names: { en: "Monarchism" },
    spectrumHome: "right",
    description: {
      en: "Support for a monarch as head of state, from ceremonial roles to absolute rule.",
    },
  },
  {
    id: "libertarianism",
    names: { en: "Libertarianism" },
    spectrumHome: "libertarian",
    description: {
      en: "Traditions that minimise or abolish the state in favour of individual liberty and voluntary exchange.",
    },
  },
  {
    id: "anarchism",
    names: { en: "Anarchism" },
    spectrumHome: "anarchist",
    description: {
      en: "Traditions rejecting the state and other coercive hierarchies in favour of voluntary association.",
    },
  },
  {
    id: "communalism",
    names: { en: "Communalism" },
    spectrumHome: "anarchist",
    description: {
      en: "Directly democratic, confederal self-government of municipalities, from Bookchin to Öcalan.",
    },
  },
  {
    id: "direct-democracy",
    names: { en: "Direct democracy" },
    spectrumHome: "centre",
    description: {
      en: "Constitutional traditions that give citizens binding votes on laws alongside elected institutions.",
    },
  },
  {
    id: "distributism",
    names: { en: "Distributism" },
    spectrumHome: "centre",
    description: {
      en: "Catholic-inspired economics favouring widely spread small property over both capitalism and socialism.",
    },
  },
  {
    id: "georgism",
    names: { en: "Georgism" },
    spectrumHome: "centre",
    description: {
      en: "Economic tradition holding that land value belongs to the community and should fund the state.",
    },
  },
  {
    id: "technopolitics",
    names: { en: "Technocracy and techno-progressivism" },
    spectrumHome: "centre",
    description: {
      en: "Politics organised around expertise, technology and the transformation of the human condition.",
    },
  },
  {
    id: "accelerationism",
    names: { en: "Accelerationism" },
    spectrumHome: "centre",
    description: {
      en: "Theories that intensifying technological and capitalist processes will transform society; the currents disagree sharply on the goal.",
    },
  },
  {
    id: "theocracy",
    names: { en: "Theocracy" },
    spectrumHome: "theocratic",
    description: {
      en: "Currents that make religious law or clerical rule the basis of the state.",
    },
  },
  {
    id: "feminism",
    names: { en: "Feminism" },
    spectrumHome: "left",
    description: {
      en: "Traditions that analyse and seek to end sex-based inequality, from liberal reform to socialist and anarchist currents.",
    },
  },
  {
    id: "left-populism",
    names: { en: "Left-wing populism" },
    spectrumHome: "left",
    description: {
      en: "Movements that frame politics as ordinary people against economic and political elites, combined with redistributive demands.",
    },
  },
  {
    id: "pan-africanism",
    names: { en: "Pan-Africanism" },
    spectrumHome: "left",
    description: {
      en: "Movements for the political and economic unity and self-determination of Africans and the African diaspora.",
    },
  },
  {
    id: "agrarianism",
    names: { en: "Agrarianism" },
    spectrumHome: "centre",
    description: {
      en: "Politics centred on smallholders, rural communities and the value of farming as a way of life.",
    },
  },
  {
    id: "communitarianism",
    names: { en: "Communitarianism" },
    spectrumHome: "centre",
    description: {
      en: "Thought that stresses community, shared values and social responsibility as a counterweight to individualism.",
    },
  },
  {
    id: "muslim-democracy",
    names: { en: "Muslim democracy" },
    spectrumHome: "centre",
    description: {
      en: "Parties and thinkers that combine Islamic values with electoral democracy and pluralism, by analogy with Christian democracy.",
    },
  },
  {
    id: "authoritarian-conservatism",
    names: { en: "Authoritarian conservatism" },
    spectrumHome: "far-right",
    description: {
      en: "Regimes and movements that defend tradition, religion and hierarchy through non-democratic rule, distinct from fascism's mass mobilisation.",
    },
  },
  {
    id: "ethnonationalism",
    names: { en: "Ethnonationalism" },
    spectrumHome: "far-right",
    description: {
      en: "Movements that define the nation by shared ancestry and seek an ethnically homogeneous state.",
    },
  },
  {
    id: "religious-nationalism",
    names: { en: "Religious nationalism" },
    spectrumHome: "far-right",
    description: {
      en: "Movements that define the nation by a religious identity and seek to shape the state around it.",
    },
  },
];
