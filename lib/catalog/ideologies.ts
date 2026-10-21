import { FAMILIES } from "@/data/families";
import { IDEOLOGIES } from "@/data/ideologies";
import type { Matchable } from "@/lib/engine/types";
import { ideologySchema, type Ideology } from "@/lib/schema/entries";

/** Parsed ideology catalog (the build validator guarantees this parse succeeds). */
export function loadIdeologies(): Ideology[] {
  return IDEOLOGIES.map((raw) => ideologySchema.parse(raw));
}

/** Engine view of an ideology. Online/satirical labels are hidden from matching (D-050). */
export function toMatchable(e: Ideology): Matchable {
  return {
    id: e.id,
    coords: e.coords,
    salience: e.salience,
    family: e.family,
    ...(e.parent ? { parent: e.parent } : {}),
    placement: e.placement.confidence,
    atrocity: Boolean(e.atrocity),
    hidden: e.tags.includes("online-satirical"),
  };
}

export const familyIds = () => FAMILIES.map((f) => f.id);
