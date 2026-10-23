import { getTranslations } from "next-intl/server";
import { AXES, AXIS_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { Section } from "./Section";

/** A 21-tick scale from −100 to +100, centre marked. */
function Scale() {
  return (
    <svg viewBox="0 0 122 14" aria-hidden="true" className="h-3.5 w-32" stroke="currentColor">
      <path d="M1 7H121" strokeWidth="1" />
      {Array.from({ length: 21 }, (_, k) => (
        <path
          key={k}
          d={`M${1 + k * 6} ${k === 10 ? 0 : k % 5 === 0 ? 3 : 5}V${k === 10 ? 14 : k % 5 === 0 ? 11 : 9}`}
          strokeWidth={k === 10 ? 1.5 : 1}
        />
      ))}
    </svg>
  );
}

/**
 * The twelve axes as a ruled table. Rows are interactive: hover (or focus on
 * the axis name) inverts the row and shows what the axis measures.
 */
export async function AxesTable({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.axes");
  return (
    <Section
      number={2}
      kicker={t("kicker")}
      title={t("title")}
      lead={t("lead")}
      id="home-axes"
      invert
    >
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{t("title")}</caption>
        <thead>
          <tr className="annot border-b-2 border-ink">
            <th scope="col" className="w-12 py-3 pr-3 font-bold">
              {t("code")}
            </th>
            <th scope="col" className="py-3 pr-3 font-bold">
              {t("axis")}
            </th>
            <th scope="col" className="hidden py-3 pr-3 font-bold sm:table-cell">
              −100
            </th>
            <th scope="col" className="hidden py-3 pr-3 font-bold lg:table-cell">
              <span className="sr-only">{t("scale")}</span>
            </th>
            <th scope="col" className="hidden py-3 font-bold sm:table-cell">
              +100
            </th>
          </tr>
        </thead>
        <tbody>
          {AXIS_IDS.map((id) => {
            const axis = AXES[id];
            const tip = `axis-tip-${id}`;
            return (
              <tr
                key={id}
                className="tip-host relative border-b border-ink hover:bg-ink hover:text-paper has-focus-visible:bg-ink has-focus-visible:text-paper"
              >
                <td className="label py-4 pr-3 align-baseline">{axis.code[locale]}</td>
                <td className="py-4 pr-3 align-baseline">
                  <button
                    type="button"
                    aria-describedby={tip}
                    className="label -my-3 min-h-11 text-left text-base"
                  >
                    {axis.name[locale]}
                  </button>
                  <p className="mt-1 text-sm sm:hidden">
                    {axis.neg.short[locale]} · {axis.pos.short[locale]}
                  </p>
                  <span role="tooltip" id={tip} className="tip">
                    {axis.measures[locale]}
                  </span>
                </td>
                <td className="hidden py-4 pr-3 align-baseline sm:table-cell">
                  {axis.neg.label[locale]}
                </td>
                <td className="hidden py-4 pr-3 align-middle lg:table-cell">
                  <Scale />
                </td>
                <td className="hidden py-4 align-baseline sm:table-cell">
                  {axis.pos.label[locale]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}
