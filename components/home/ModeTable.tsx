import { getTranslations } from "next-intl/server";
import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES, type ModeId } from "@/data/modes";
import { Link } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";

/** Deep opens once its question bank exists (Phase 9). */
const OPEN: Record<ModeId, boolean> = { quick: true, standard: true, deep: false };

/**
 * The three test lengths as one ruled table. The mode name is the link and
 * stretches over its whole row, so the row inverts on hover as one block.
 * A mode that is not open yet has a dashed frame and says so in words.
 * Cells draw their own rules (separate borders), so one row can be dashed.
 */
export async function ModeTable({ locale, blurbs = false }: { locale: Locale; blurbs?: boolean }) {
  const t = await getTranslations("home");
  const head =
    "label border-t-2 border-r-2 border-b-2 border-ink px-2 py-2 max-[359px]:text-[0.6875rem] min-[360px]:px-3";

  return (
    <table className="w-full border-separate border-spacing-0">
      <caption className="label caption-top pb-2 text-left">{t("chooseMode")}</caption>
      <thead>
        <tr>
          <th scope="col" className={`${head} border-l-2 text-left`}>
            {t("table.mode")}
          </th>
          <th scope="col" className={`${head} text-right`}>
            {t("table.questions")}
          </th>
          <th scope="col" className={`${head} text-right`}>
            {t("table.minutes")}
          </th>
          <th scope="col" className={`${head} hidden sm:table-cell`}>
            <span className="sr-only">{t("table.action")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {MODE_IDS.map((id, i) => {
          const mode = MODES[id];
          const open = OPEN[id];
          const next = MODE_IDS[i + 1];
          const dashed = !open || (next !== undefined && !OPEN[next]);
          const cell = `border-r-2 border-b-2 border-ink px-2 py-3 align-top min-[360px]:px-3 ${!open ? "border-dashed" : dashed ? "[border-bottom-style:dashed]" : ""}`;
          const name = (
            <>
              <span className="display block text-xl min-[360px]:text-2xl sm:text-3xl">
                {t(`modes.${id}.name`)}
              </span>
              {id === "standard" ? (
                <span className="label mt-1 block">{t("recommended")}</span>
              ) : null}
              {!open ? <span className="label mt-1 block sm:hidden">{t("opensSoon")}</span> : null}
              {blurbs ? (
                <span className="prose-text mt-2 block font-normal">{t(`modes.${id}.blurb`)}</span>
              ) : null}
            </>
          );
          return (
            <tr key={id} className={open ? "relative hover:bg-ink hover:text-paper" : undefined}>
              <th scope="row" className={`${cell} border-l-2 text-left`}>
                {open ? (
                  <Link
                    href={{
                      pathname: "/test/[mode]/[n]",
                      params: { mode: modeSlug(locale, id), n: "1" },
                    }}
                    className="no-underline outline-none after:absolute after:inset-0 focus-visible:after:outline-3 focus-visible:after:outline-offset-3 focus-visible:after:outline-ink"
                  >
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </th>
              <td
                className={`${cell} text-right text-xl font-bold tabular-nums min-[360px]:text-2xl sm:text-3xl`}
              >
                {mode.count}
              </td>
              <td
                className={`${cell} text-right text-xl tabular-nums min-[360px]:text-2xl sm:text-3xl`}
              >
                {mode.minutes}
              </td>
              <td className={`${cell} label hidden text-right sm:table-cell`}>
                {open ? t("start") : t("opensSoon")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
