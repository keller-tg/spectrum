import { useTranslations } from "next-intl";
import { AXES, CATEGORIES, type AxisId, type CategoryId } from "@/data/axes";
import type { Locale } from "@/data/locales";
import type { DimId } from "@/lib/compass/geometry";

export interface DimText {
  /** Full name, e.g. "Economic distribution" or "Economic index". */
  name: string;
  /** Short name for readouts and table headers. */
  short: string;
  /** What −100 and +100 mean, for the ends of the plot. */
  neg: string;
  pos: string;
}

/** Words for every dimension the compass offers, in the page's locale. */
export function useDimText(locale: Locale, explained: readonly number[]) {
  const t = useTranslations("compass");
  return (id: DimId): DimText => {
    if (id.startsWith("axis:")) {
      const axis = AXES[id.slice(5) as AxisId];
      return {
        name: axis.name[locale],
        short: axis.code[locale],
        neg: axis.neg.short[locale],
        pos: axis.pos.short[locale],
      };
    }
    if (id.startsWith("index:")) {
      const name = t("indexName", { name: CATEGORIES[id.slice(6) as CategoryId].name[locale] });
      return { name, short: name, neg: t("poleNeg", { name }), pos: t("polePos", { name }) };
    }
    const k = id === "pc1" ? 1 : 2;
    const short = t("pc", { k });
    return {
      name: t("pcName", { k, share: Math.round((explained[k - 1] ?? 0) * 100) }),
      short,
      neg: t("poleNeg", { name: short }),
      pos: t("polePos", { name: short }),
    };
  };
}

/** Signed score with a true minus sign. */
export const signed = (v: number) => {
  const r = Math.round(v);
  return r > 0 ? `+${r}` : r < 0 ? `−${-r}` : "0";
};
