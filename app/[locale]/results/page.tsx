import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
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

export default async function Page() {
  const t = await getTranslations("pages.results");
  return <PageStub title={t("title")} lead={t("lead")} phase={3} />;
}
