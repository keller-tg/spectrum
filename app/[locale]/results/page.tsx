import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResultsView } from "@/components/results/ResultsView";
import type { Locale } from "@/data/locales";
import { catalogData } from "@/lib/catalog/client-data";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/results">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.results" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/results",
    noindex: true,
  });
}

/** Static shell; the result itself comes from this browser's store, never from the URL. */
export default async function Page({ params }: PageProps<"/[locale]/results">) {
  const locale = (await params).locale as Locale;
  return <ResultsView catalog={catalogData(locale)} />;
}
