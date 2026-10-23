import type { Localized } from "./locales";

/**
 * The twelve axes. Sign convention: the first-named pole is −100 ("neg"), the
 * second +100 ("pos") (D-004). Labels live here, not in stored results, so a
 * rename never touches user data.
 */
export const AXIS_IDS = [
  "distribution",
  "ownership",
  "trade",
  "liberty",
  "centralization",
  "participation",
  "tradition",
  "religion",
  "ecology",
  "nation",
  "intervention",
  "borders",
] as const;
export type AxisId = (typeof AXIS_IDS)[number];

export const CATEGORY_IDS = ["economic", "governmental", "societal", "diplomatic"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export type PoleSide = "neg" | "pos";

export interface PoleDef {
  /** Full pole name as in the spec, e.g. "Ecological sustainability". */
  label: Localized;
  /** Compact form for strips, chips and chart ends. */
  short: Localized;
  /** One line, written so people holding this view would accept it as fair. */
  tooltip: Localized;
}

export interface AxisDef {
  id: AxisId;
  /** 1-based position, used for display ("Axis 7"). */
  index: number;
  /** Two-letter code for strips, radar spokes and compact tables (D-077). */
  code: Localized;
  category: CategoryId;
  name: Localized;
  measures: Localized;
  neg: PoleDef;
  pos: PoleDef;
}

export const CATEGORIES: Record<CategoryId, { name: Localized; axes: readonly AxisId[] }> = {
  economic: {
    name: { en: "Economic", de: "Wirtschaft", fr: "Économie" },
    axes: ["distribution", "ownership", "trade"],
  },
  governmental: {
    name: { en: "Governmental", de: "Staat", fr: "Gouvernement" },
    axes: ["liberty", "centralization", "participation"],
  },
  societal: {
    name: { en: "Societal", de: "Gesellschaft", fr: "Société" },
    axes: ["tradition", "religion", "ecology"],
  },
  diplomatic: {
    name: { en: "Diplomatic", de: "Außenpolitik", fr: "Diplomatie" },
    axes: ["nation", "intervention", "borders"],
  },
};

export const AXES: Record<AxisId, AxisDef> = {
  distribution: {
    id: "distribution",
    index: 1,
    code: { en: "DI", de: "VE", fr: "RP" },
    category: "economic",
    name: { en: "Distribution", de: "Verteilung", fr: "Répartition" },
    measures: {
      en: "How far the state should redistribute income and wealth through taxes, transfers and wage rules.",
      de: "Wie stark der Staat Einkommen und Vermögen über Steuern, Transfers und Lohnregeln umverteilen soll.",
      fr: "Dans quelle mesure l’État doit redistribuer revenus et patrimoine par l’impôt, les transferts et les règles salariales.",
    },
    neg: {
      label: { en: "Equality", de: "Gleichheit", fr: "Égalité" },
      short: { en: "Equality", de: "Gleichheit", fr: "Égalité" },
      tooltip: {
        en: "The state should actively narrow gaps in income and wealth.",
        de: "Der Staat soll Unterschiede bei Einkommen und Vermögen aktiv verringern.",
        fr: "L’État doit réduire activement les écarts de revenus et de patrimoine.",
      },
    },
    pos: {
      label: { en: "Markets", de: "Markt", fr: "Marché" },
      short: { en: "Markets", de: "Markt", fr: "Marché" },
      tooltip: {
        en: "Incomes and prices are best left to free exchange, with little state correction.",
        de: "Einkommen und Preise sollen sich im freien Austausch bilden, mit wenig staatlicher Korrektur.",
        fr: "Revenus et prix doivent résulter de l’échange libre, avec peu de correction par l’État.",
      },
    },
  },
  ownership: {
    id: "ownership",
    index: 2,
    code: { en: "OW", de: "EI", fr: "PR" },
    category: "economic",
    name: { en: "Ownership", de: "Eigentum", fr: "Propriété" },
    measures: {
      en: "Who should own firms, land, natural resources and infrastructure.",
      de: "Wem Unternehmen, Boden, Rohstoffe und Infrastruktur gehören sollen.",
      fr: "À qui doivent appartenir entreprises, terres, ressources naturelles et infrastructures.",
    },
    neg: {
      label: { en: "Collective ownership", de: "Gemeineigentum", fr: "Propriété collective" },
      short: { en: "Collective", de: "Kollektiv", fr: "Collective" },
      tooltip: {
        en: "Key assets belong to the public, the state, cooperatives or the commons.",
        de: "Wichtige Güter gehören der Öffentlichkeit, dem Staat, Genossenschaften oder der Allgemeinheit.",
        fr: "Les biens essentiels appartiennent au public, à l’État, aux coopératives ou aux communs.",
      },
    },
    pos: {
      label: { en: "Private ownership", de: "Privateigentum", fr: "Propriété privée" },
      short: { en: "Private", de: "Privat", fr: "Privée" },
      tooltip: {
        en: "Productive assets are best owned by individuals and private firms.",
        de: "Produktive Güter sind am besten in der Hand von Einzelnen und privaten Unternehmen.",
        fr: "Les biens productifs sont mieux entre les mains de particuliers et d’entreprises privées.",
      },
    },
  },
  trade: {
    id: "trade",
    index: 3,
    code: { en: "TR", de: "HA", fr: "CO" },
    category: "economic",
    name: { en: "Trade", de: "Handel", fr: "Commerce" },
    measures: {
      en: "How open the country should be to foreign goods, services and capital.",
      de: "Wie offen das Land für ausländische Waren, Dienstleistungen und Kapital sein soll.",
      fr: "Dans quelle mesure le pays doit s’ouvrir aux biens, services et capitaux étrangers.",
    },
    neg: {
      label: { en: "Protectionism", de: "Protektionismus", fr: "Protectionnisme" },
      short: { en: "Protection", de: "Schutz", fr: "Protection" },
      tooltip: {
        en: "Shield domestic producers and jobs from foreign competition.",
        de: "Heimische Produzenten und Arbeitsplätze vor ausländischer Konkurrenz schützen.",
        fr: "Protéger producteurs et emplois nationaux de la concurrence étrangère.",
      },
    },
    pos: {
      label: { en: "Free trade", de: "Freihandel", fr: "Libre-échange" },
      short: { en: "Free trade", de: "Freihandel", fr: "Libre-échange" },
      tooltip: {
        en: "Let goods, services and capital cross borders with few barriers.",
        de: "Waren, Dienstleistungen und Kapital sollen Grenzen mit wenigen Hürden passieren.",
        fr: "Laisser biens, services et capitaux franchir les frontières avec peu d’obstacles.",
      },
    },
  },
  liberty: {
    id: "liberty",
    index: 4,
    code: { en: "SP", de: "SM", fr: "PE" },
    category: "governmental",
    name: { en: "State power", de: "Staatsmacht", fr: "Pouvoir de l’État" },
    measures: {
      en: "How much power the state should have over individual life.",
      de: "Wie viel Macht der Staat über das Leben der Einzelnen haben soll.",
      fr: "Quel pouvoir l’État doit avoir sur la vie de chacun.",
    },
    neg: {
      label: { en: "Liberty", de: "Freiheit", fr: "Liberté" },
      short: { en: "Liberty", de: "Freiheit", fr: "Liberté" },
      tooltip: {
        en: "Individuals decide for themselves; state power over private life stays narrow.",
        de: "Menschen entscheiden selbst; die Macht des Staates über das Privatleben bleibt eng begrenzt.",
        fr: "Chacun décide pour soi ; le pouvoir de l’État sur la vie privée reste limité.",
      },
    },
    pos: {
      label: { en: "Authority", de: "Autorität", fr: "Autorité" },
      short: { en: "Authority", de: "Autorität", fr: "Autorité" },
      tooltip: {
        en: "A strong state keeps order and may limit freedoms for security and cohesion.",
        de: "Ein starker Staat sorgt für Ordnung und darf Freiheiten für Sicherheit und Zusammenhalt einschränken.",
        fr: "Un État fort maintient l’ordre et peut restreindre des libertés pour la sécurité et la cohésion.",
      },
    },
  },
  centralization: {
    id: "centralization",
    index: 5,
    code: { en: "CE", de: "ZE", fr: "CE" },
    category: "governmental",
    name: { en: "Centralization", de: "Zentralisierung", fr: "Centralisation" },
    measures: {
      en: "Where power should sit: at the national level or with regions and localities.",
      de: "Wo die Macht liegen soll: auf nationaler Ebene oder bei Regionen und Gemeinden.",
      fr: "Où doit se situer le pouvoir : au niveau national ou auprès des régions et des communes.",
    },
    neg: {
      label: { en: "Centralized", de: "Zentralisiert", fr: "Centralisé" },
      short: { en: "Central", de: "Zentral", fr: "Central" },
      tooltip: {
        en: "Decide nationally, so the same rules apply everywhere.",
        de: "National entscheiden, damit überall dieselben Regeln gelten.",
        fr: "Décider au niveau national, pour que les mêmes règles s’appliquent partout.",
      },
    },
    pos: {
      label: { en: "Decentralized", de: "Dezentralisiert", fr: "Décentralisé" },
      short: { en: "Local", de: "Lokal", fr: "Local" },
      tooltip: {
        en: "Decide as locally as possible; regions and communities run their own affairs.",
        de: "So lokal wie möglich entscheiden; Regionen und Gemeinden regeln ihre Angelegenheiten selbst.",
        fr: "Décider au plus près ; régions et communes gèrent leurs propres affaires.",
      },
    },
  },
  participation: {
    id: "participation",
    index: 6,
    code: { en: "PA", de: "MB", fr: "PA" },
    category: "governmental",
    name: { en: "Participation", de: "Mitbestimmung", fr: "Participation" },
    measures: {
      en: "How far collective decisions should pass from citizens to elected representatives and experts, or at the far end to rulers who need no election.",
      de: "Wie weit kollektive Entscheidungen von der Bürgerschaft an Gewählte und Fachleute übergehen sollen, am äußersten Ende an Herrschende ohne Wahl.",
      fr: "Dans quelle mesure les décisions collectives doivent passer des citoyens aux élus et aux experts, voire, à l’extrême, à des dirigeants non élus.",
    },
    neg: {
      label: {
        en: "Citizens decide directly",
        de: "Bürgerschaft entscheidet direkt",
        fr: "Les citoyens décident directement",
      },
      short: { en: "Direct", de: "Direkt", fr: "Direct" },
      tooltip: {
        en: "Citizens should decide directly and often, through votes and assemblies.",
        de: "Bürgerinnen und Bürger entscheiden direkt und oft, durch Abstimmungen und Versammlungen.",
        fr: "Les citoyens décident directement et souvent, par des votations et des assemblées.",
      },
    },
    pos: {
      label: {
        en: "Representatives/experts decide",
        de: "Gewählte/Fachleute entscheiden",
        fr: "Les élus/experts décident",
      },
      short: { en: "Delegated", de: "Delegiert", fr: "Délégué" },
      tooltip: {
        en: "Decisions are best left to elected representatives and experts, or at the far end to a party or a crown.",
        de: "Entscheidungen liegen am besten bei Gewählten und Fachleuten, am äußersten Ende bei einer Partei oder einer Krone.",
        fr: "Mieux vaut confier les décisions aux élus et aux experts, voire, à l’extrême, à un parti ou à une couronne.",
      },
    },
  },
  tradition: {
    id: "tradition",
    index: 7,
    code: { en: "SC", de: "GW", fr: "CS" },
    category: "societal",
    name: { en: "Social change", de: "Gesellschaftlicher Wandel", fr: "Changement social" },
    measures: {
      en: "How society should treat inherited norms and customs, for example on family, gender and the end of life.",
      de: "Wie die Gesellschaft mit überlieferten Normen und Bräuchen umgehen soll, etwa zu Familie, Geschlecht und Lebensende.",
      fr: "Comment la société doit traiter les normes et coutumes héritées, par exemple sur la famille, le genre et la fin de vie.",
    },
    neg: {
      label: { en: "Progressive", de: "Progressiv", fr: "Progressiste" },
      short: { en: "Progressive", de: "Progressiv", fr: "Progressiste" },
      tooltip: {
        en: "Reform customs and norms as values and knowledge change.",
        de: "Bräuche und Normen reformieren, wenn sich Werte und Wissen wandeln.",
        fr: "Réformer coutumes et normes à mesure que les valeurs et les connaissances évoluent.",
      },
    },
    pos: {
      label: { en: "Traditional", de: "Traditionell", fr: "Traditionnel" },
      short: { en: "Traditional", de: "Traditionell", fr: "Traditionnel" },
      tooltip: {
        en: "Preserve the customs, family forms and roles that have stood the test of time.",
        de: "Bräuche, Familienformen und Rollen bewahren, die sich über lange Zeit bewährt haben.",
        fr: "Préserver les coutumes, formes familiales et rôles qui ont fait leurs preuves.",
      },
    },
  },
  religion: {
    id: "religion",
    index: 8,
    code: { en: "RS", de: "RS", fr: "RE" },
    category: "societal",
    name: { en: "Religion and state", de: "Religion und Staat", fr: "Religion et État" },
    measures: {
      en: "What role religion should play in law and public life.",
      de: "Welche Rolle Religion in Recht und öffentlichem Leben spielen soll.",
      fr: "Quel rôle la religion doit jouer dans le droit et la vie publique.",
    },
    neg: {
      label: {
        en: "Separation of religion and state",
        de: "Trennung von Religion und Staat",
        fr: "Séparation des religions et de l’État",
      },
      short: { en: "Separation", de: "Trennung", fr: "Séparation" },
      tooltip: {
        en: "Law and public institutions stay neutral between religions and non-belief.",
        de: "Recht und öffentliche Institutionen bleiben neutral gegenüber Religionen und Nichtglauben.",
        fr: "Le droit et les institutions publiques restent neutres entre religions et non-croyance.",
      },
    },
    pos: {
      label: {
        en: "Religion in public life",
        de: "Religion im öffentlichen Leben",
        fr: "Religion dans la vie publique",
      },
      short: { en: "Public religion", de: "Öffentliche Religion", fr: "Religion publique" },
      tooltip: {
        en: "Faith and religious teaching should guide law and public life.",
        de: "Glaube und religiöse Lehre sollen Recht und öffentliches Leben prägen.",
        fr: "La foi et l’enseignement religieux doivent guider le droit et la vie publique.",
      },
    },
  },
  ecology: {
    id: "ecology",
    index: 9,
    code: { en: "EC", de: "ÖK", fr: "EC" },
    category: "societal",
    name: { en: "Ecology", de: "Ökologie", fr: "Écologie" },
    measures: {
      en: "What comes first when economic growth and ecological limits conflict.",
      de: "Was Vorrang hat, wenn Wirtschaftswachstum und ökologische Grenzen kollidieren.",
      fr: "Ce qui prime quand la croissance économique et les limites écologiques s’opposent.",
    },
    neg: {
      label: { en: "Growth", de: "Wachstum", fr: "Croissance" },
      short: { en: "Growth", de: "Wachstum", fr: "Croissance" },
      tooltip: {
        en: "Prosperity and development come first; innovation can handle ecological costs.",
        de: "Wohlstand und Entwicklung haben Vorrang; Innovation kann ökologische Kosten auffangen.",
        fr: "La prospérité et le développement d’abord ; l’innovation peut absorber les coûts écologiques.",
      },
    },
    pos: {
      label: {
        en: "Ecological sustainability",
        de: "Ökologische Nachhaltigkeit",
        fr: "Durabilité écologique",
      },
      short: { en: "Sustainability", de: "Nachhaltigkeit", fr: "Durabilité" },
      tooltip: {
        en: "Keep the economy within ecological limits, even at the cost of growth.",
        de: "Die Wirtschaft innerhalb ökologischer Grenzen halten, auch auf Kosten des Wachstums.",
        fr: "Maintenir l’économie dans les limites écologiques, même au détriment de la croissance.",
      },
    },
  },
  nation: {
    id: "nation",
    index: 10,
    code: { en: "NW", de: "NW", fr: "NM" },
    category: "diplomatic",
    name: { en: "Nation and world", de: "Nation und Welt", fr: "Nation et monde" },
    measures: {
      en: "Whether the nation or shared international institutions should come first.",
      de: "Ob die Nation oder gemeinsame internationale Institutionen Vorrang haben sollen.",
      fr: "Si la nation ou les institutions internationales communes doivent passer en premier.",
    },
    neg: {
      label: { en: "Nationalism", de: "Nationalismus", fr: "Nationalisme" },
      short: { en: "Nation", de: "Nation", fr: "Nation" },
      tooltip: {
        en: "The nation is the primary community; its sovereignty and identity come first.",
        de: "Die Nation ist die wichtigste Gemeinschaft; ihre Souveränität und Identität haben Vorrang.",
        fr: "La nation est la communauté première ; sa souveraineté et son identité passent d’abord.",
      },
    },
    pos: {
      label: { en: "Internationalism", de: "Internationalismus", fr: "Internationalisme" },
      short: { en: "International", de: "International", fr: "International" },
      tooltip: {
        en: "Nations should cooperate closely and share sovereignty in common institutions.",
        de: "Staaten sollen eng zusammenarbeiten und Souveränität in gemeinsamen Institutionen teilen.",
        fr: "Les nations doivent coopérer étroitement et partager leur souveraineté dans des institutions communes.",
      },
    },
  },
  intervention: {
    id: "intervention",
    index: 11,
    code: { en: "IN", de: "IA", fr: "IE" },
    category: "diplomatic",
    name: {
      en: "Foreign intervention",
      de: "Intervention im Ausland",
      fr: "Intervention extérieure",
    },
    measures: {
      en: "Willingness to use military or economic pressure abroad.",
      de: "Bereitschaft, militärischen oder wirtschaftlichen Druck im Ausland einzusetzen.",
      fr: "Disposition à exercer une pression militaire ou économique à l’étranger.",
    },
    neg: {
      label: { en: "Interventionist", de: "Interventionistisch", fr: "Interventionniste" },
      short: { en: "Intervene", de: "Eingreifen", fr: "Intervenir" },
      tooltip: {
        en: "Use military and economic power abroad to defend allies, interests or values.",
        de: "Militärische und wirtschaftliche Macht im Ausland einsetzen, um Verbündete, Interessen oder Werte zu verteidigen.",
        fr: "Utiliser la puissance militaire et économique à l’étranger pour défendre alliés, intérêts ou valeurs.",
      },
    },
    pos: {
      label: { en: "Restraint", de: "Zurückhaltung", fr: "Retenue" },
      short: { en: "Restraint", de: "Zurückhaltung", fr: "Retenue" },
      tooltip: {
        en: "Avoid foreign wars and entanglements; use force only in self-defence.",
        de: "Kriege und Verstrickungen im Ausland meiden; Gewalt nur zur Selbstverteidigung.",
        fr: "Éviter guerres et engagements extérieurs ; la force seulement en légitime défense.",
      },
    },
  },
  borders: {
    id: "borders",
    index: 12,
    code: { en: "MI", de: "MI", fr: "MI" },
    category: "diplomatic",
    name: { en: "Migration", de: "Migration", fr: "Migration" },
    measures: {
      en: "How freely people should be able to move to and settle in a country.",
      de: "Wie frei Menschen in ein Land ziehen und sich dort niederlassen können sollen.",
      fr: "Avec quelle liberté on doit pouvoir venir s’installer dans un pays.",
    },
    neg: {
      label: { en: "Open", de: "Offen", fr: "Ouverte" },
      short: { en: "Open", de: "Offen", fr: "Ouverte" },
      tooltip: {
        en: "Moving to and settling in another country should be easy, with few barriers.",
        de: "In ein anderes Land zu ziehen und sich dort niederzulassen soll einfach sein, mit wenigen Hürden.",
        fr: "S’installer dans un autre pays doit être facile, avec peu d’obstacles.",
      },
    },
    pos: {
      label: { en: "Restrictive", de: "Restriktiv", fr: "Restrictive" },
      short: { en: "Restrictive", de: "Restriktiv", fr: "Restrictive" },
      tooltip: {
        en: "Strict limits on who may enter and settle, decided by the nation.",
        de: "Strenge Grenzen dafür, wer einreisen und sich niederlassen darf, festgelegt von der Nation.",
        fr: "Des limites strictes à qui peut entrer et s’installer, fixées par la nation.",
      },
    },
  },
};

export const AXIS_LIST: readonly AxisDef[] = AXIS_IDS.map((id) => AXES[id]);
