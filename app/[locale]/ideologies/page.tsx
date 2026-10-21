import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/ideologies">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.ideologies" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/ideologies",
  });
}

export default async function Page() {
  const t = await getTranslations("pages.ideologies");
  return <PageStub title={t("title")} lead={t("lead")} phase={5} />;
}
