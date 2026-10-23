import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxisBar, formatScore } from "@/components/charts/AxisBar";
import { SpectrumMarker } from "@/components/charts/SpectrumMarker";
import { AnswerRowsDemo } from "@/components/test/AnswerRows";
import { TickProgress } from "@/components/test/TickProgress";
import { Button } from "@/components/ui/Button";
import { AXES, AXIS_IDS, type AxisId } from "@/data/axes";
import { FAMILIES } from "@/data/families";
import type { Locale } from "@/data/locales";
import { MODES } from "@/data/modes";
import { ACTIVE_QUESTIONS } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import { SPECTRUMS } from "@/data/spectrums";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/styleguide/screens">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "styleguide.screens" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/styleguide/screens",
    noindex: true,
  });
}

/** Example scores for the result poster; a fixed profile, not a real result. */
const EXAMPLE: Record<AxisId, number> = {
  distribution: -46,
  ownership: 12,
  trade: 8,
  liberty: -30,
  centralization: -10,
  participation: 4,
  tradition: -38,
  religion: -42,
  ecology: 24,
  nation: 28,
  intervention: 6,
  borders: -18,
};
const SPREAD: Record<AxisId, number> = {
  distribution: 12,
  ownership: 22,
  trade: 25,
  liberty: 15,
  centralization: 24,
  participation: 26,
  tradition: 14,
  religion: 13,
  ecology: 19,
  nation: 18,
  intervention: 27,
  borders: 16,
};

/**
 * App screens designed now, built in their phases (D-081): the test screen
 * (Phase 3) and the result poster, which doubles as the share card (Phase 3/8).
 */
export default async function ScreensPage({ params }: PageProps<"/[locale]/styleguide/screens">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("styleguide.screens");
  const index = 7;
  const question = ACTIVE_QUESTIONS[index - 1];
  const statement = question ? QUESTION_TEXT_EN[question.id]?.text : "";
  const total = MODES.standard.count;
  const entry = loadIdeologies().find((e) => e.id === "social-democracy");
  const family = FAMILIES.find((f) => f.id === entry?.family);
  const spectrum = entry ? SPECTRUMS[entry.spectrum] : null;

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-16 sm:px-6 lg:px-10">
      <p className="annot font-bold">{t("kicker")}</p>
      <h1 className="display mt-4 text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-5">{t("lead")}</p>

      {/* Test screen */}
      <section aria-labelledby="screen-test" className="mt-16 border-t-2 border-ink pt-6">
        <h2 id="screen-test" className="annot font-bold">
          {t("test")}
        </h2>
        <div className="mt-8 grid grid-cols-12 gap-x-6 gap-y-10 lg:gap-x-10">
          <div className="col-span-12 lg:col-span-7">
            <p className="annot">
              {t("questionOf", { n: index, count: total })} · {t("mode")}
            </p>
            <p aria-hidden="true" className="mt-4 font-mono text-numeral font-bold">
              {String(index).padStart(2, "0")}
            </p>
            <p lang="en" className="display mt-6 text-display-md">
              {statement}
            </p>
            <div className="mt-10">
              <TickProgress total={total} current={index} label={t("progress")} />
              <p className="annot mt-2 flex justify-between">
                <span>1</span>
                <span>{total}</span>
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <AnswerRowsDemo initial={1} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" size="s">
                {t("back")}
              </Button>
              <Button variant="text" size="s">
                {t("explain")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Result poster */}
      <section aria-labelledby="screen-result" className="mt-20 border-t-2 border-ink pt-6">
        <h2 id="screen-result" className="annot font-bold">
          {t("result")}
        </h2>
        <article
          aria-label={t("posterLabel")}
          className="mt-8 max-w-4xl border-2 border-ink p-6 sm:p-10"
        >
          <header className="annot flex flex-wrap justify-between gap-2 border-b border-ink pb-3">
            <span className="font-bold">{t("posterHead")}</span>
            <span>{t("example")}</span>
          </header>
          <div className="mt-8 grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
            <p className="font-mono leading-[0.8] font-bold">
              <span className="text-numeral">87</span>
              <span className="text-4xl">%</span>
            </p>
            <div>
              <p className="annot">{t("match")}</p>
              <p className="display mt-2 text-display-lg">
                {entry?.names[locale] ?? entry?.names.en}
              </p>
              {spectrum && entry ? (
                <p className="mt-3 flex flex-wrap items-center gap-2">
                  <SpectrumMarker id={entry.spectrum} size={16} />
                  <span className="annot font-bold">{spectrum.code[locale]}</span>
                  <span>{spectrum.name[locale]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{family?.names[locale] ?? family?.names.en}</span>
                </p>
              ) : null}
            </div>
          </div>
          <ul className="mt-10 border-t-2 border-ink">
            {AXIS_IDS.map((axis) => {
              const value = EXAMPLE[axis];
              const spread = SPREAD[axis];
              const pole = (value < 0 ? AXES[axis].neg : AXES[axis].pos).label[locale];
              return (
                <li key={axis} className="border-b border-ink py-4">
                  <AxisBar
                    axis={axis}
                    value={value}
                    interval={[Math.max(-100, value - spread), Math.min(100, value + spread)]}
                    band="hatch"
                    locale={locale}
                    description={t("bar", {
                      axis: AXES[axis].name[locale],
                      score: formatScore(value),
                      pole,
                      low: formatScore(Math.max(-100, value - spread)),
                      high: formatScore(Math.min(100, value + spread)),
                    })}
                  />
                </li>
              );
            })}
          </ul>
          <footer className="annot mt-6 flex flex-wrap justify-between gap-2">
            <span>{t("posterFoot")}</span>
            <span>{t("legend")}</span>
          </footer>
        </article>
      </section>
    </div>
  );
}
