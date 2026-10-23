import type { Localized } from "./locales";

/**
 * The nine spectra (D-029). The design has no colour (D-075), so each spectrum is
 * told apart by a marker shape plus a short code, always shown together and
 * explained in a legend (D-077).
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

/** Filled shapes mark only the two ends of the left–right line; all others are outlines. */
export const SPECTRUM_SHAPES = [
  "square-filled",
  "square",
  "circle",
  "diamond",
  "diamond-filled",
  "bowtie",
  "triangle-up",
  "triangle-down",
  "hexagon",
] as const;
export type SpectrumShape = (typeof SPECTRUM_SHAPES)[number];

export interface SpectrumDef {
  id: SpectrumId;
  name: Localized;
  /** 1–3 letter code shown next to the marker shape. */
  code: Localized;
  shape: SpectrumShape;
  /** Scope note shown in the explorer legend; neutral and descriptive. */
  scope: Localized;
}

export const SPECTRUMS: Record<SpectrumId, SpectrumDef> = {
  "radical-left": {
    id: "radical-left",
    code: { en: "RL", de: "RL", fr: "GR" },
    shape: "square-filled",
    name: { en: "Radical left", de: "Radikale Linke", fr: "Gauche radicale" },
    scope: {
      en: "Seeks to replace capitalism, usually through collective ownership.",
      de: "Will den Kapitalismus ersetzen, meist durch gemeinschaftliches Eigentum.",
      fr: "Cherche à remplacer le capitalisme, le plus souvent par la propriété collective.",
    },
  },
  left: {
    id: "left",
    code: { en: "L", de: "L", fr: "G" },
    shape: "square",
    name: { en: "Left", de: "Linke", fr: "Gauche" },
    scope: {
      en: "Reforms markets toward equality and social protection within democracy.",
      de: "Reformiert Märkte in Richtung Gleichheit und sozialer Absicherung innerhalb der Demokratie.",
      fr: "Réforme les marchés vers l’égalité et la protection sociale, dans le cadre démocratique.",
    },
  },
  centre: {
    id: "centre",
    code: { en: "C", de: "M", fr: "C" },
    shape: "circle",
    name: { en: "Centre", de: "Mitte", fr: "Centre" },
    scope: {
      en: "Moderate on most axes; favours balance, pragmatism and institutions.",
      de: "Auf den meisten Achsen gemäßigt; setzt auf Ausgleich, Pragmatismus und Institutionen.",
      fr: "Modéré sur la plupart des axes ; privilégie l’équilibre, le pragmatisme et les institutions.",
    },
  },
  right: {
    id: "right",
    code: { en: "R", de: "R", fr: "D" },
    shape: "diamond",
    name: { en: "Right", de: "Rechte", fr: "Droite" },
    scope: {
      en: "Values markets, tradition and order within democratic institutions.",
      de: "Schätzt Markt, Tradition und Ordnung innerhalb demokratischer Institutionen.",
      fr: "Valorise le marché, la tradition et l’ordre dans le cadre des institutions démocratiques.",
    },
  },
  "far-right": {
    id: "far-right",
    code: { en: "FR", de: "ER", fr: "ED" },
    shape: "diamond-filled",
    name: { en: "Far right", de: "Extreme Rechte", fr: "Extrême droite" },
    scope: {
      en: "Ultranationalist or authoritarian currents, often hostile to pluralism.",
      de: "Ultranationalistische oder autoritäre Strömungen, oft dem Pluralismus feindlich gesinnt.",
      fr: "Courants ultranationalistes ou autoritaires, souvent hostiles au pluralisme.",
    },
  },
  "third-position": {
    id: "third-position",
    code: { en: "TP", de: "DP", fr: "TP" },
    shape: "bowtie",
    name: { en: "Third position", de: "Dritte Position", fr: "Troisième position" },
    scope: {
      en: "Claims to reject both capitalism and communism, typically fused with nationalism.",
      de: "Beansprucht, Kapitalismus und Kommunismus abzulehnen, meist verbunden mit Nationalismus.",
      fr: "Revendique le rejet du capitalisme comme du communisme, généralement allié au nationalisme.",
    },
  },
  libertarian: {
    id: "libertarian",
    code: { en: "LB", de: "LB", fr: "LB" },
    shape: "triangle-up",
    name: { en: "Libertarian", de: "Libertär", fr: "Libertarien" },
    scope: {
      en: "Minimises the state in favour of individual liberty and voluntary exchange.",
      de: "Minimiert den Staat zugunsten individueller Freiheit und freiwilligen Austauschs.",
      fr: "Réduit l’État au minimum au profit de la liberté individuelle et de l’échange volontaire.",
    },
  },
  anarchist: {
    id: "anarchist",
    code: { en: "AN", de: "AN", fr: "AN" },
    shape: "triangle-down",
    name: { en: "Anarchist", de: "Anarchistisch", fr: "Anarchiste" },
    scope: {
      en: "Rejects the state and other coercive hierarchies in favour of voluntary association.",
      de: "Lehnt den Staat und andere Zwangshierarchien zugunsten freiwilliger Assoziation ab.",
      fr: "Rejette l’État et les autres hiérarchies coercitives au profit de l’association volontaire.",
    },
  },
  theocratic: {
    id: "theocratic",
    code: { en: "TH", de: "TH", fr: "TH" },
    shape: "hexagon",
    name: { en: "Theocratic", de: "Theokratisch", fr: "Théocratique" },
    scope: {
      en: "Makes religious law or clerical rule the basis of the state.",
      de: "Macht religiöses Recht oder geistliche Herrschaft zur Grundlage des Staates.",
      fr: "Fait de la loi religieuse ou du pouvoir clérical le fondement de l’État.",
    },
  },
};

export const SPECTRUM_LIST: readonly SpectrumDef[] = SPECTRUM_IDS.map((id) => SPECTRUMS[id]);
