import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { Locale } from "@/data/locales";
import { catalogData } from "@/lib/catalog/client-data";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.dashboard" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/dashboard",
    noindex: true,
  });
}

/** Static shell; the history comes from this browser's store, never from a server or the URL. */
export default async function Page({ params }: PageProps<"/[locale]/dashboard">) {
  const locale = (await params).locale as Locale;
  return <DashboardView catalog={catalogData(locale)} />;
}
