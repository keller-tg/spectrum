import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compare/[code]">): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  const t = await getTranslations({ locale, namespace: "pages.compare" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => ({ pathname: "/compare/[code]", params: { code } }),
    noindex: true,
  });
}

export default async function Page() {
  const t = await getTranslations("pages.compare");
  return <PageStub title={t("title")} lead={t("lead")} phase={8} />;
}
