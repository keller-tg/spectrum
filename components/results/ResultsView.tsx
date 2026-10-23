"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Radar } from "@/components/charts/Radar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { AXES, AXIS_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { MODES, type ModeId } from "@/data/modes";
import { modeQuestions } from "@/data/questions/bank";
import { useRouter } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";
import type { CatalogData } from "@/lib/catalog/client-data";
import { scoreTest } from "@/lib/engine/score";
import { buildReport } from "@/lib/results/report";
import { openStore, type StoredResult, type Store } from "@/lib/storage/db";
import {
  AxisRows,
  Furthest,
  IndexRows,
  MatchList,
  Positions,
  ResultPoster,
  SectionHead,
} from "./ResultSections";
import { ShareBox } from "./ShareBox";
import { CompassFigure } from "@/components/compass/CompassFigure";
import { userInput } from "@/lib/compass/user";
import { dimensions, MAP_VIEW } from "@/lib/compass/geometry";

/** The next longer mode whose questions exist, for "N more questions". */
function nextMode(mode: ModeId): ModeId | null {
  const order: ModeId[] = ["quick", "standard", "deep"];
  const next = order[order.indexOf(mode) + 1];
  return next && modeQuestions(next).length === MODES[next].count ? next : null;
}

/**
 * Your results (PLAN §8), read from this browser's store; nothing about them is
 * in the address bar. Answers are re-scored with the current engine, so an
 * engine update changes the reading, never the stored answers (§6.8).
 */
export function ResultsView({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("results");
  const tm = useTranslations("home");
  const ta = useTranslations("anchors");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [result, setResult] = useState<StoredResult | null | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      const s = await openStore();
      setStore(s);
      setResult((await s.latestResult()) ?? null);
    })();
  }, []);

  const scored = useMemo(
    () => (result ? scoreTest(modeQuestions(result.mode), result.answers) : null),
    [result],
  );
  const report = useMemo(
    () => (scored ? buildReport(scored.scores, scored.confidences, catalog) : null),
    [scored, catalog],
  );
  const dims = useMemo(() => dimensions(catalog), [catalog]);
  const userMark = useMemo(
    () => (scored ? userInput(scored.scores, scored.confidences) : null),
    [scored],
  );

  // Loading and empty states keep the same header and height as the result, so
  // nothing shifts when this browser's store answers.
  if (result === undefined || !result || !scored || !report)
    return (
      <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <h1 className="display text-display-lg">{t("title")}</h1>
        <p className="prose-text mt-4">{t("lead")}</p>
        <div className="mt-10 min-h-[75svh]">
          {result === undefined ? (
            <p className="annot">{t("loading")}</p>
          ) : (
            <>
              <p className="prose-text">{t("empty")}</p>
              <div className="mt-8">
                <ButtonLink href="/test" size="l" arrow>
                  {t("takeTest")}
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </div>
    );

  const modeLabel = tm(`modes.${result.mode}.name`);
  const more = nextMode(result.mode);
  const headline = report.summary.headline?.item.entry;
  const sections = [
    ["summary", t("sections.summary")],
    ["axes", t("sections.axes")],
    ["positions", t("sections.positions")],
    ["radar", t("sections.radar")],
    ["indices", t("sections.indices")],
    ["compass", t("sections.compass")],
    ["ideologies", t("sections.ideologies")],
    ["uncertainty", t("sections.uncertainty")],
    ["share", t("sections.share")],
  ] as const;
  type Key = (typeof sections)[number][0];
  const id = (key: Key) => ta(key);
  const num = (key: Key) => sections.findIndex(([k]) => k === key) + 1;
  const label = (key: Key) => sections.find(([k]) => k === key)?.[1] ?? "";
  const tensions = AXIS_IDS.filter((a) => scored.axes[a].tension);

  const continueWith = async (mode: ModeId, from: number) => {
    await store?.putDraft({
      mode,
      answers: result.answers,
      startedAt: result.createdAt,
      updatedAt: new Date().toISOString(),
    });
    router.push({
      pathname: "/test/[mode]/[n]",
      params: { mode: modeSlug(locale, mode), n: String(from) },
    });
  };

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-4">{t("lead")}</p>
      {!store?.persistent ? (
        <p role="status" className="annot mt-6 border border-ink px-4 py-2 font-bold">
          {t("notStored")}
        </p>
      ) : null}

      <div className="mt-10 grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label={t("toc")} className="hidden lg:block">
          <ol className="sticky top-[calc(var(--header-h)+2rem)] space-y-1 border-l-2 border-ink pl-4">
            {sections.map(([key, label], i) => (
              <li key={key}>
                <a
                  href={`#${id(key)}`}
                  className="link-host annot inline-flex min-h-8 items-center gap-2"
                >
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="link">{label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-20">
          <section aria-labelledby={id("summary")}>
            <SectionHead id={id("summary")} number={num("summary")} title={label("summary")} />
            <div className="mt-8">
              <ResultPoster
                report={report}
                modeLabel={modeLabel}
                dateLabel={format.dateTime(new Date(result.createdAt), { dateStyle: "medium" })}
                lowQuality={scored.quality.low}
              />
            </div>
            {more ? (
              <div className="mt-6 flex flex-wrap items-center gap-4 border-[1.5px] border-ink p-5">
                <p className="prose-text">
                  {t("more", { count: MODES[more].count - MODES[result.mode].count })}
                </p>
                <Button arrow onClick={() => void continueWith(more, MODES[result.mode].count + 1)}>
                  {t("moreButton", { count: MODES[more].count - MODES[result.mode].count })}
                </Button>
              </div>
            ) : null}
          </section>

          <section aria-labelledby={id("axes")}>
            <SectionHead id={id("axes")} number={num("axes")} title={label("axes")} />
            <p className="prose-text mt-6">{t("axesLead")}</p>
            <div className="mt-6">
              <AxisRows axes={report.axes} locale={locale} />
            </div>
          </section>

          <section aria-labelledby={id("positions")}>
            <SectionHead
              id={id("positions")}
              number={num("positions")}
              title={label("positions")}
            />
            <div className="mt-8">
              <Positions report={report} locale={locale} />
            </div>
          </section>

          <section aria-labelledby={id("radar")}>
            <SectionHead id={id("radar")} number={num("radar")} title={label("radar")} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Radar
                id="result-radar"
                series={
                  headline
                    ? [
                        { label: t("you"), values: scored.scores },
                        { label: headline.name, values: headline.coords },
                      ]
                    : [{ label: t("you"), values: scored.scores }]
                }
                locale={locale}
                title={t("radarTitle", { name: headline?.name ?? "" })}
                dataLabel={t("dataTable")}
                axisHeader={t("axis")}
              />
              <div className="prose-text space-y-4">
                <p>{t("radarHow")}</p>
                <p>
                  <TextLink href="/compass">{t("compassLink")}</TextLink>
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby={id("indices")}>
            <SectionHead id={id("indices")} number={num("indices")} title={label("indices")} />
            <p className="prose-text mt-6">{t("indicesLead")}</p>
            <div className="mt-6">
              <IndexRows indices={report.indices} locale={locale} />
            </div>
          </section>

          <section aria-labelledby={id("compass")}>
            <SectionHead id={id("compass")} number={num("compass")} title={label("compass")} />
            <p className="prose-text mt-6">{t("compassLead", { count: catalog.entries.length })}</p>
            <div className="mt-6 max-w-3xl">
              <CompassFigure
                id="result-compass"
                entries={catalog.entries}
                dims={dims}
                view={MAP_VIEW}
                user={userMark}
                explained={catalog.map.explained}
                caption={t("compassCaption", { count: catalog.entries.length })}
              />
            </div>
            <p className="mt-6">
              <TextLink href="/compass">{t("compassOpen")}</TextLink>
            </p>
          </section>

          <section aria-labelledby={id("ideologies")}>
            <SectionHead
              id={id("ideologies")}
              number={num("ideologies")}
              title={label("ideologies")}
            />
            <p className="prose-text mt-6">{t("matchesLead", { count: catalog.entries.length })}</p>
            <div className="mt-6">
              <MatchList items={report.summary.top} />
            </div>
            <Furthest report={report} />
            <p className="prose-text mt-6">{t("moreCatalogs")}</p>
          </section>

          <section aria-labelledby={id("uncertainty")}>
            <SectionHead
              id={id("uncertainty")}
              number={num("uncertainty")}
              title={label("uncertainty")}
            />
            <dl className="mt-8 grid border-t-2 border-ink">
              <div className="border-b border-ink py-4">
                <dt className="annot font-bold">{t("overall")}</dt>
                <dd className="prose-text mt-1">
                  {t("overallBody", {
                    percent: Math.round(scored.overallConfidence * 100),
                    answered: scored.answered,
                    skipped: scored.skipped,
                  })}
                </dd>
              </div>
              <div className="border-b border-ink py-4">
                <dt className="annot font-bold">{t("tensions")}</dt>
                <dd className="prose-text mt-1">
                  {tensions.length
                    ? t("tensionsBody", {
                        axes: tensions.map((a) => AXES[a].name[locale]).join(", "),
                      })
                    : t("tensionsNone")}
                </dd>
              </div>
              {headline ? (
                <div className="border-b border-ink py-4">
                  <dt className="annot font-bold">{t("placement")}</dt>
                  <dd className="prose-text mt-1">
                    {t(`placementBody.${headline.placement ?? "medium"}`, { name: headline.name })}
                  </dd>
                </div>
              ) : null}
              {scored.quality.flags.length ? (
                <div className="border-b border-ink py-4">
                  <dt className="annot font-bold">{t("quality")}</dt>
                  <dd className="prose-text mt-1">
                    {scored.quality.flags.map((f) => t(`flags.${f}`)).join(" ")}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section aria-labelledby={id("share")}>
            <SectionHead id={id("share")} number={num("share")} title={label("share")} />
            <div className="mt-8">
              <ShareBox
                result={{
                  mode: result.mode,
                  lowQuality: scored.quality.low,
                  flags: scored.quality.flags,
                  scores: scored.scores,
                  confidences: scored.confidences,
                }}
              />
            </div>
            <div className="mt-10 flex flex-wrap gap-3 border-t border-ink pt-6">
              <Button variant="secondary" onClick={() => void continueWith(result.mode, 1)}>
                {t("edit")}
              </Button>
              <ButtonLink href="/test" variant="secondary">
                {t("retake")}
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="text">
                {t("dashboard")}
              </ButtonLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
