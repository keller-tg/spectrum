import { getTranslations } from "next-intl/server";
import { AXIS_IDS, AXES, CATEGORY_IDS, CATEGORIES, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";

/** Below this magnitude an axis reads as "near the centre". */
const CENTRE_BAND = 15;
const STRONG = 60;

/** Four marks per axis: two for the first pole, two for the second. */
function marks(value: number): readonly [boolean, boolean, boolean, boolean] {
  const m = Math.abs(value);
  if (m < CENTRE_BAND) return [false, false, false, false];
  const strong = m >= STRONG;
  return value < 0 ? [strong, true, false, false] : [false, false, true, strong];
}

/**
 * The twelve-axis strip (D-077): each axis is its two-letter code over four
 * small squares. Filled squares sit on the side of the pole the entry leans
 * to; one filled = leans, two filled = strong, none = near the centre.
 * An accessible label spells the whole profile out.
 */
export async function IconStrip({
  coords,
  locale,
}: {
  coords: Record<AxisId, number>;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "axisStrip" });

  const describe = (id: AxisId) => {
    const value = coords[id];
    const axis = AXES[id].name[locale];
    if (Math.abs(value) < CENTRE_BAND) return t("centre", { axis });
    const pole = (value < 0 ? AXES[id].neg : AXES[id].pos).label[locale];
    return t(Math.abs(value) >= STRONG ? "strong" : "lean", { axis, pole });
  };

  return (
    <div
      role="img"
      aria-label={`${t("label")}. ${AXIS_IDS.map(describe).join("; ")}.`}
      className="inline-flex flex-wrap items-stretch border-2 border-ink"
    >
      {CATEGORY_IDS.map((cat) => (
        <span key={cat} className="flex border-ink not-first:border-l-2">
          {CATEGORIES[cat].axes.map((id) => (
            <span
              key={id}
              className="flex flex-col items-center gap-1 border-ink px-1.5 py-1 not-first:border-l"
            >
              <span className="text-xs leading-none font-bold">{AXES[id].code[locale]}</span>
              <span className="flex gap-px">
                {marks(coords[id]).map((filled, i) => (
                  <span
                    key={i}
                    className={`size-1.5 border border-ink ${filled ? "bg-ink" : ""} ${i === 2 ? "ml-0.5" : ""}`}
                  />
                ))}
              </span>
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
