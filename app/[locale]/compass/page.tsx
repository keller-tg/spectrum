import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CompassExplorer } from "@/components/compass/CompassExplorer";
import type { Locale } from "@/data/locales";
import { catalogData } from "@/lib/catalog/client-data";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compass">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.compass" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/compass",
  });
}

/**
 * Static page: the catalog figure renders on the server (Map view, no user);
 * the browser adds the latest stored result, which never enters the URL.
 */
export default async function Page({ params }: PageProps<"/[locale]/compass">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("pages.compass");
  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-4">{t("lead")}</p>
      <div className="mt-10">
        <CompassExplorer catalog={catalogData(locale)} />
      </div>
    </div>
  );
}
