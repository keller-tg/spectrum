import type { AxisId, CategoryId } from "@/data/axes";
import { FAMILIES } from "@/data/families";
import type { Locale } from "@/data/locales";
import { SPECTRUMS, type SpectrumId } from "@/data/spectrums";
import type { IndexDef } from "@/lib/engine/indices";
import type { AxisVector, Matchable } from "@/lib/engine/types";
import { loadDerived } from "./derived";
import { loadIdeologies, toMatchable } from "./ideologies";

/** One catalog entry as the browser needs it: matchable plus what to print. */
export interface CatalogEntry extends Matchable {
  name: string;
  spectrum: SpectrumId;
  spectrumCode: string;
  spectrumName: string;
  familyName: string;
}

/** Everything the client-side views (results, compass) compute with. */
export interface CatalogData {
  entries: CatalogEntry[];
  families: { id: string; name: string }[];
  tau: number;
  indices: Record<CategoryId, IndexDef>;
  map: { mean: number[]; components: number[][]; explained: number[] };
  bankVersion: string;
  catalogVersion: string;
}

/** Server-only: the visible catalog with localized names, plus the derived constants. */
export function catalogData(locale: Locale): CatalogData {
  const derived = loadDerived();
  const familyName = (id: string) => {
    const f = FAMILIES.find((x) => x.id === id);
    return f ? (f.names[locale] ?? f.names.en) : id;
  };
  const entries = loadIdeologies()
    .map((e) => ({ e, m: toMatchable(e) }))
    .filter(({ m }) => !m.hidden)
    .map(({ e, m }) => ({
      ...m,
      coords: m.coords as AxisVector,
      salience: m.salience as Record<AxisId, number>,
      name: e.names[locale] ?? e.names.en,
      spectrum: e.spectrum,
      spectrumCode: SPECTRUMS[e.spectrum].code[locale],
      spectrumName: SPECTRUMS[e.spectrum].name[locale],
      familyName: familyName(e.family),
    }));
  return {
    entries,
    families: FAMILIES.map((f) => ({ id: f.id, name: f.names[locale] ?? f.names.en })),
    tau: derived.tau.ideology.tau,
    indices: derived.indices,
    map: {
      mean: derived.map.mean,
      components: derived.map.components.slice(0, 2),
      explained: derived.map.explained.slice(0, 2),
    },
    bankVersion: derived.questionBankVersion,
    catalogVersion: derived.catalogVersion,
  };
}
