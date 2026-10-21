import { getTranslations } from "next-intl/server";
import { AXIS_IDS, AXES, CATEGORY_IDS, CATEGORIES, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { AxisGlyph } from "./AxisGlyph";

/** Below this magnitude an axis reads as "near the centre". */
const CENTRE_BAND = 15;
const STRONG = 60;

interface IconStripProps {
  coords: Record<AxisId, number>;
  /** Optional per-axis salience (0–1); low salience fades the glyph further. */
  salience?: Partial<Record<AxisId, number>>;
  locale: Locale;
  size?: number;
}

/**
 * The twelve-icon strip: one glyph per axis, showing the pole an entry leans to.
 * Opacity encodes strength; an accessible label spells the whole profile out.
 */
export async function IconStrip({ coords, salience, locale, size = 18 }: IconStripProps) {
  const t = await getTranslations({ locale, namespace: "axisStrip" });

  const describe = (id: AxisId) => {
    const value = coords[id];
    const axis = AXES[id].name[locale];
    if (Math.abs(value) < CENTRE_BAND) return t("centre", { axis });
    const pole = (value < 0 ? AXES[id].neg : AXES[id].pos).label[locale];
    return t(Math.abs(value) >= STRONG ? "strong" : "lean", { axis, pole });
  };

  const label = `${t("label")}. ${AXIS_IDS.map(describe).join("; ")}.`;

  return (
    <div role="img" aria-label={label} className="inline-flex items-center gap-2.5">
      {CATEGORY_IDS.map((cat) => (
        <span key={cat} className="inline-flex items-center gap-[3px]">
          {CATEGORIES[cat].axes.map((id) => {
            const value = coords[id];
            const centred = Math.abs(value) < CENTRE_BAND;
            const weight = salience?.[id] ?? 1;
            const strength = centred
              ? 0.35
              : 0.4 + 0.6 * (Math.abs(value) / 100) * (0.5 + 0.5 * weight);
            return (
              <AxisGlyph
                key={id}
                axis={id}
                side={centred ? undefined : value < 0 ? "neg" : "pos"}
                size={size}
                style={{ opacity: Math.min(1, strength) }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}
