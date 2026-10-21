import type { Localized } from "./locales";

/**
 * The nine spectra (D-029). Colours live in app/globals.css as --sp-<id>
 * tokens so both themes can tune them; this file holds names and scope notes.
 */
export const SPECTRUM_IDS = [
  "radical-left",
  "left",
  "centre",
  "right",
  "far-right",
  "third-position",
  "libertarian",
  "anarchist",
  "theocratic",
] as const;
export type SpectrumId = (typeof SPECTRUM_IDS)[number];

export interface SpectrumDef {
  id: SpectrumId;
  name: Localized;
  /** Scope note shown in the explorer legend; neutral and descriptive. */
  scope: Localized;
}

export const SPECTRUMS: Record<SpectrumId, SpectrumDef> = {
  "radical-left": {
    id: "radical-left",
    name: { en: "Radical left", de: "Radikale Linke", fr: "Gauche radicale" },
    scope: {
      en: "Seeks to replace capitalism, usually through collective ownership.",
      de: "Will den Kapitalismus ersetzen, meist durch gemeinschaftliches Eigentum.",
      fr: "Cherche à remplacer le capitalisme, le plus souvent par la propriété collective.",
    },
  },
  left: {
    id: "left",
    name: { en: "Left", de: "Linke", fr: "Gauche" },
    scope: {
      en: "Reforms markets toward equality and social protection within democracy.",
      de: "Reformiert Märkte in Richtung Gleichheit und sozialer Absicherung innerhalb der Demokratie.",
      fr: "Réforme les marchés vers l’égalité et la protection sociale, dans le cadre démocratique.",
    },
  },
  centre: {
    id: "centre",
    name: { en: "Centre", de: "Mitte", fr: "Centre" },
    scope: {
      en: "Moderate on most axes; favours balance, pragmatism and institutions.",
      de: "Auf den meisten Achsen gemäßigt; setzt auf Ausgleich, Pragmatismus und Institutionen.",
      fr: "Modéré sur la plupart des axes ; privilégie l’équilibre, le pragmatisme et les institutions.",
    },
  },
  right: {
    id: "right",
    name: { en: "Right", de: "Rechte", fr: "Droite" },
    scope: {
      en: "Values markets, tradition and order within democratic institutions.",
      de: "Schätzt Markt, Tradition und Ordnung innerhalb demokratischer Institutionen.",
      fr: "Valorise le marché, la tradition et l’ordre dans le cadre des institutions démocratiques.",
    },
  },
  "far-right": {
    id: "far-right",
    name: { en: "Far right", de: "Extreme Rechte", fr: "Extrême droite" },
    scope: {
      en: "Ultranationalist or authoritarian currents, often hostile to pluralism.",
      de: "Ultranationalistische oder autoritäre Strömungen, oft dem Pluralismus feindlich gesinnt.",
      fr: "Courants ultranationalistes ou autoritaires, souvent hostiles au pluralisme.",
    },
  },
  "third-position": {
    id: "third-position",
    name: { en: "Third position", de: "Dritte Position", fr: "Troisième position" },
    scope: {
      en: "Claims to reject both capitalism and communism, typically fused with nationalism.",
      de: "Beansprucht, Kapitalismus und Kommunismus abzulehnen, meist verbunden mit Nationalismus.",
      fr: "Revendique le rejet du capitalisme comme du communisme, généralement allié au nationalisme.",
    },
  },
  libertarian: {
    id: "libertarian",
    name: { en: "Libertarian", de: "Libertär", fr: "Libertarien" },
    scope: {
      en: "Minimises the state in favour of individual liberty and voluntary exchange.",
      de: "Minimiert den Staat zugunsten individueller Freiheit und freiwilligen Austauschs.",
      fr: "Réduit l’État au minimum au profit de la liberté individuelle et de l’échange volontaire.",
    },
  },
  anarchist: {
    id: "anarchist",
    name: { en: "Anarchist", de: "Anarchistisch", fr: "Anarchiste" },
    scope: {
      en: "Rejects the state and other coercive hierarchies in favour of voluntary association.",
      de: "Lehnt den Staat und andere Zwangshierarchien zugunsten freiwilliger Assoziation ab.",
      fr: "Rejette l’État et les autres hiérarchies coercitives au profit de l’association volontaire.",
    },
  },
  theocratic: {
    id: "theocratic",
    name: { en: "Theocratic", de: "Theokratisch", fr: "Théocratique" },
    scope: {
      en: "Makes religious law or clerical rule the basis of the state.",
      de: "Macht religiöses Recht oder geistliche Herrschaft zur Grundlage des Staates.",
      fr: "Fait de la loi religieuse ou du pouvoir clérical le fondement de l’État.",
    },
  },
};

export const SPECTRUM_LIST: readonly SpectrumDef[] = SPECTRUM_IDS.map((id) => SPECTRUMS[id]);
