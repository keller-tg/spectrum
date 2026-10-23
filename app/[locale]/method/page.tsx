import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxesOverview } from "@/components/home/AxesOverview";
import { Cell, CellGrid } from "@/components/ui/Cell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/method">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.method" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/method",
  });
}

const HOW = ["answer", "see", "explore"] as const;
const TERMS = ["local", "tracking", "honest", "neutral"] as const;

/** The instrument, how a result is made, and the terms. The full method text arrives in Phase 3. */
export default async function Page({ params }: PageProps<"/[locale]/method">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("pages.method");
  const stub = await getTranslations("stub");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16">
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-5">{t("lead")}</p>

      <section aria-labelledby="method-axes" className="mt-14">
        <SectionHeader number={1} id="method-axes" title={t("axesTitle")}>
          {t("axesLead")}
        </SectionHeader>
        <div className="mt-6">
          <AxesOverview locale={locale} />
        </div>
      </section>

      <section aria-labelledby="method-how" className="mt-14">
        <SectionHeader number={2} id="method-how" title={t("howTitle")} />
        <CellGrid as="ol" className="mt-6">
          {HOW.map((key, i) => (
            <Cell key={key} as="li" span={4} number={i + 1} title={t(`how.${key}.title`)}>
              <p className="prose-text mt-2">{t(`how.${key}.body`)}</p>
            </Cell>
          ))}
        </CellGrid>
      </section>

      <section aria-labelledby="method-terms" className="mt-14">
        <SectionHeader number={3} id="method-terms" title={t("termsTitle")} />
        <CellGrid as="ul" className="mt-6">
          {TERMS.map((key) => (
            <Cell key={key} as="li" span={6} title={t(`terms.${key}.title`)}>
              <p className="prose-text mt-2">{t(`terms.${key}.body`)}</p>
            </Cell>
          ))}
        </CellGrid>
      </section>

      <p className="label mt-12 inline-block border-2 border-dashed border-ink px-3 py-2">
        {stub("phaseNote", { phase: 3 })}
      </p>
    </div>
  );
}
