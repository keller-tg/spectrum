import { getTranslations } from "next-intl/server";
import { RollingArrow } from "@/components/ui/icons";
import { Wipe } from "@/components/ui/Wipe";
import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES, type ModeId } from "@/data/modes";
import { Link } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";

/** Deep opens once its question bank exists (Phase 9). */
const OPEN: Record<ModeId, boolean> = { quick: true, standard: true, deep: false };

/**
 * The three test lengths as whole-row links (D-080). Each row wipes to
 * inverted from the left, "START" slides in and the arrow rolls. Standard
 * carries a permanent inverted RECOMMENDED tag; Deep is dashed, says
 * "opens soon" and has no hover. A column header names the numbers.
 */
export async function ModeRows({
  locale,
  blurbs = false,
  pinnedHover,
}: {
  locale: Locale;
  blurbs?: boolean;
  /** Pins the hover look on one row (styleguide only). */
  pinnedHover?: ModeId;
}) {
  const t = await getTranslations("home");

  const cells = (id: ModeId) => {
    const mode = MODES[id];
    const open = OPEN[id];
    return (
      <>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="display text-2xl sm:text-3xl">{t(`modes.${id}.name`)}</span>
            {id === "standard" ? (
              <span className="tag annot bg-ink px-2 py-1 font-bold text-paper">{t("recommended")}</span>
            ) : null}
            {!open ? <span className="annot font-bold">{t("opensSoon")}</span> : null}
          </span>
          {blurbs ? (
            <span className="prose-text mt-1 block text-base">{t(`modes.${id}.blurb`)}</span>
          ) : null}
        </span>
        <span className="text-right text-2xl font-bold sm:text-3xl" aria-hidden="true">
          {mode.count}
        </span>
        <span className="text-right text-2xl sm:text-3xl" aria-hidden="true">
          {mode.minutes}
        </span>
        <span className="label flex items-center justify-end gap-2" aria-hidden="true">
          {open ? (
            <>
              <span className="mode-start hidden sm:inline-flex">
                <span className="mode-start-word">{t("start")}</span>
              </span>
              <RollingArrow />
            </>
          ) : null}
        </span>
        <span className="sr-only">
          {t("rowQuestions", { count: mode.count })}, {t("rowMinutes", { minutes: mode.minutes })}
        </span>
      </>
    );
  };

  return (
    <div>
      <p className="annot font-bold">{t("chooseMode")}</p>
      <div aria-hidden="true" className="mode-grid annot mt-3 border-b-2 border-ink pb-2">
        <span>{t("table.mode")}</span>
        <span className="text-right">
          <span className="sm:hidden">{t("table.questionsShort")}</span>
          <span className="hidden sm:inline">{t("table.questions")}</span>
        </span>
        <span className="text-right">
          <span className="sm:hidden">{t("table.minutesShort")}</span>
          <span className="hidden sm:inline">{t("table.minutes")}</span>
        </span>
        <span />
      </div>
      <ol>
        {MODE_IDS.map((id) =>
          OPEN[id] ? (
            <li key={id} className="border-b-2 border-ink">
              <Link
                href={{
                  pathname: "/test/[mode]/[n]",
                  params: { mode: modeSlug(locale, id), n: "1" },
                }}
                className="mode-row mode-grid wipe-host"
                data-state={pinnedHover === id ? "hover" : undefined}
              >
                {cells(id)}
                <Wipe />
              </Link>
            </li>
          ) : (
            <li
              key={id}
              className="mode-row mode-grid mt-2 border-[1.5px] border-dashed border-ink"
            >
              {cells(id)}
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
