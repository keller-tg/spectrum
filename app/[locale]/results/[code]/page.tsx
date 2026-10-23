import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  AxisRows,
  Furthest,
  MatchList,
  ResultPoster,
  SectionHead,
} from "@/components/results/ResultSections";
import { ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/data/locales";
import { catalogData } from "@/lib/catalog/client-data";
import { decodeResult } from "@/lib/engine/codec";
import { buildReport } from "@/lib/results/report";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/results/[code]">): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  const t = await getTranslations({ locale, namespace: "pages.sharedResult" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => ({ pathname: "/results/[code]", params: { code } }),
    noindex: true,
  });
}

/**
 * A result someone chose to share: the code carries rounded scores and
 * confidences only (no answers, no date). Decoded on the server; a damaged or
 * tampered code fails its checksum and shows a plain message instead.
 */
export default async function Page({ params }: PageProps<"/[locale]/results/[code]">) {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  const t = await getTranslations("pages.sharedResult");
  const tr = await getTranslations("results");
  const th = await getTranslations("home");
  const shared = decodeResult(code);

  if (!shared)
    return (
      <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <h1 className="display text-display-lg">{t("broken")}</h1>
        <p className="prose-text mt-5">{t("brokenBody")}</p>
        <div className="mt-8">
          <ButtonLink href="/test" size="l" arrow>
            {tr("takeTest")}
          </ButtonLink>
        </div>
      </div>
    );

  const catalog = catalogData(locale);
  const report = buildReport(shared.scores, shared.confidences, catalog);
  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
      <p className="annot font-bold">{t("kicker")}</p>
      <h1 className="display mt-4 text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-4">{t("lead")}</p>
      <div className="mt-10 space-y-20">
        <ResultPoster
          report={report}
          modeLabel={th(`modes.${shared.mode}.name`)}
          lowQuality={shared.lowQuality}
        />
        <section aria-labelledby="shared-axes">
          <SectionHead id="shared-axes" number={1} title={tr("sections.axes")} />
          <div className="mt-6">
            <AxisRows axes={report.axes} locale={locale} />
          </div>
        </section>
        <section aria-labelledby="shared-matches">
          <SectionHead id="shared-matches" number={2} title={tr("sections.ideologies")} />
          <div className="mt-6">
            <MatchList items={report.summary.top} />
          </div>
          <Furthest report={report} />
        </section>
        <div className="border-t-2 border-ink pt-8">
          <p className="prose-text">{t("yourTurn")}</p>
          <div className="mt-6">
            <ButtonLink href="/test" size="l" arrow>
              {tr("takeTest")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
