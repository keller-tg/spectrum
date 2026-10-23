import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/imprint">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.imprint" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/imprint",
  });
}

// The responsible party must be named before public launch (D-042, RED).
export default async function Page() {
  const t = await getTranslations("pages.imprint");
  return (
    <PageStub title={t("title")} lead={t("lead")} phase={12}>
      <p className="prose-text mt-6 border-2 border-ink p-4">{t("pending")}</p>
    </PageStub>
  );
}
