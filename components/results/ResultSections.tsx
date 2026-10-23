import { useTranslations } from "next-intl";
import { AxisBar, formatScore, ScaleTrack } from "@/components/charts/AxisBar";
import { SpectrumMarker } from "@/components/charts/SpectrumMarker";
import { AXES, CATEGORIES } from "@/data/axes";
import type { Locale } from "@/data/locales";
import type { TopItem } from "@/lib/engine/match";
import type { CatalogEntry } from "@/lib/catalog/client-data";
import type { AxisRow, IndexRow, Report } from "@/lib/results/report";
import { displaySimilarity } from "@/lib/engine/match";

/**
 * Result building blocks (PLAN §8), plain components so they render both in
 * the private results view (client, from this browser's store) and on a
 * shared result page (server, from a share code).
 */

export function SectionHead({ id, number, title }: { id: string; number: number; title: string }) {
  return (
    <header className="border-b-2 border-ink pb-4">
      <p className="annot font-bold">{String(number).padStart(2, "0")} /</p>
      <h2 id={id} className="display mt-2 text-display-md">
        {title}
      </h2>
    </header>
  );
}

function Entry({ entry, percent }: { entry: CatalogEntry; percent?: number }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-bold">{entry.name}</span>
      <span className="inline-flex items-center gap-1.5 self-center">
        <SpectrumMarker id={entry.spectrum} size={12} />
        <span className="annot font-bold">{entry.spectrumCode}</span>
      </span>
      {percent !== undefined ? (
        <span className="ml-auto font-mono font-bold">{percent}%</span>
      ) : null}
    </span>
  );
}

/** The poster: giant match numeral, ideology in display type, spectrum and family. */
export function ResultPoster({
  report,
  modeLabel,
  dateLabel,
  lowQuality,
}: {
  report: Report;
  modeLabel: string;
  dateLabel?: string;
  lowQuality: boolean;
}) {
  const t = useTranslations("results");
  const headline = report.summary.headline;
  const entry = headline?.item.entry;
  const between = report.summary.inBetween;
  return (
    <article className="border-2 border-ink p-6 sm:p-10">
      <header className="annot flex flex-wrap justify-between gap-2 border-b border-ink pb-3">
        <span className="font-bold">{t("posterHead", { mode: modeLabel })}</span>
        {dateLabel ? <span>{dateLabel}</span> : null}
      </header>
      {lowQuality ? (
        <p className="prose-text mt-6 border-[1.5px] border-dashed border-ink p-3">
          {t("lowQuality")}
        </p>
      ) : null}
      {entry && report.headlinePercent !== null ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
          <p className="font-mono leading-[0.8] font-bold">
            <span className="text-numeral">{report.headlinePercent}</span>
            <span className="text-4xl">%</span>
          </p>
          <div>
            <p className="annot">{t("closest")}</p>
            <p className="display mt-2 text-display-lg">{entry.name}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <SpectrumMarker id={entry.spectrum} size={16} />
              <span className="annot font-bold">{entry.spectrumCode}</span>
              <span>{entry.spectrumName}</span>
              <span aria-hidden="true">·</span>
              <span>{t("family", { name: entry.familyName })}</span>
            </p>
            {headline?.bestVariant ? (
              <p className="mt-2">
                {t("variant", {
                  name: headline.bestVariant.entry.name,
                  percent: displaySimilarity(headline.bestVariant.similarity),
                })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {entry?.atrocity ? (
        <p className="prose-text mt-6 border-l-2 border-ink pl-4">{t("atrocityNote")}</p>
      ) : null}
      {between ? (
        <p className="prose-text mt-6">
          {t("inBetween", {
            a: between[0].item.entry.name,
            b: between[1].item.entry.name,
          })}
        </p>
      ) : null}
      <p className="annot mt-8 border-t border-ink pt-3">{t("honest")}</p>
    </article>
  );
}

export function AxisRows({ axes, locale }: { axes: readonly AxisRow[]; locale: Locale }) {
  const t = useTranslations("results");
  return (
    <ul className="border-t-2 border-ink">
      {axes.map((a) => {
        const def = AXES[a.axis];
        const pole = (a.score < 0 ? def.neg : def.pos).label[locale];
        return (
          <li
            key={a.axis}
            className="grid gap-4 border-b border-ink py-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10"
          >
            <AxisBar
              axis={a.axis}
              value={a.score}
              interval={a.range}
              band="hatch"
              locale={locale}
              description={t("axisBar", {
                axis: def.name[locale],
                score: formatScore(a.score),
                pole,
                low: formatScore(a.range[0]),
                high: formatScore(a.range[1]),
              })}
            />
            <div className="text-sm">
              <p className="annot font-bold">
                {t("confidence", { percent: Math.round(a.confidence * 100) })}
              </p>
              <p className="mt-2 font-sans leading-relaxed">
                <span className="annot font-bold">{t("measured")} </span>
                {def.measures[locale]}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Positions({ report, locale }: { report: Report; locale: Locale }) {
  const t = useTranslations("results");
  const row = (kind: "unusual" | "typical", a: AxisRow | null) =>
    a ? (
      <div className="border-ink p-5">
        <p className="annot font-bold">{t(kind)}</p>
        <p className="display mt-3 text-2xl">
          {AXES[a.axis].name[locale]} {formatScore(a.score)}
        </p>
        <p className="prose-text mt-2">
          {t(`${kind}Body`, { percent: Math.round(a.company * 100) })}
        </p>
      </div>
    ) : null;
  return (
    <div className="grid border-2 border-ink md:grid-cols-2 md:divide-x-2 md:divide-ink">
      {row("unusual", report.unusual)}
      {row("typical", report.typical)}
    </div>
  );
}

export function IndexRows({ indices, locale }: { indices: readonly IndexRow[]; locale: Locale }) {
  const t = useTranslations("results");
  return (
    <ul className="border-t-2 border-ink">
      {indices.map((row) => {
        const name = CATEGORIES[row.category].name[locale];
        const formula = row.def.axes
          .map((a, i) => `${(row.def.loadings[i] ?? 0).toFixed(2)}·${AXES[a].code[locale]}`)
          .join(" + ")
          .replace(/\+ -/g, "− ");
        return (
          <li key={row.category} className="border-b border-ink py-5">
            <div className="label flex items-baseline justify-between gap-3">
              <span>{t("indexName", { name })}</span>
              <span className="text-base tabular-nums">
                {row.def.usable ? formatScore(row.value) : t("indexUnusable")}
              </span>
            </div>
            {row.def.usable ? (
              <div className="mt-2">
                <ScaleTrack
                  value={row.value}
                  description={t("indexBar", { name, score: formatScore(row.value) })}
                />
              </div>
            ) : null}
            <p className="annot mt-2">
              {t("indexFormula", { formula, share: Math.round(row.def.explained * 100) })}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function MatchList({
  items,
  start = 1,
}: {
  items: readonly TopItem<CatalogEntry>[];
  start?: number;
}) {
  const t = useTranslations("results");
  return (
    <ol className="border-t-2 border-ink" start={start}>
      {items.map((g, i) => (
        <li
          key={g.item.entry.id}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-ink py-4"
        >
          <span aria-hidden="true" className="font-mono text-2xl font-bold">
            {String(start + i).padStart(2, "0")}
          </span>
          <div>
            <Entry entry={g.item.entry} percent={displaySimilarity(g.groupSimilarity)} />
            <p className="mt-1 text-sm">{g.item.entry.familyName}</p>
            {g.bestVariant ? (
              <p className="mt-1 text-sm">
                {t("variant", {
                  name: g.bestVariant.entry.name,
                  percent: displaySimilarity(g.bestVariant.similarity),
                })}
              </p>
            ) : null}
            {g.item.entry.placement === "low" ? (
              <p className="annot mt-1">{t("placementLow")}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Furthest({ report }: { report: Report }) {
  const t = useTranslations("results");
  const f = report.summary.furthest;
  if (!f) return null;
  return (
    <div className="mt-8 border-[1.5px] border-dashed border-ink p-5">
      <p className="annot font-bold">{t("furthest")}</p>
      <div className="mt-3">
        <Entry entry={f.entry} percent={displaySimilarity(f.similarity)} />
      </div>
    </div>
  );
}
