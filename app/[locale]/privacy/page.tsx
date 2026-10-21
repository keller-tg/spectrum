import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.privacy" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/privacy",
  });
}

export default async function Page() {
  const t = await getTranslations("pages.privacy");
  return (
    <PageStub title={t("title")} lead={t("lead")} phase={7}>
      <p className="mt-6 rounded-lg border border-rule-strong bg-paper-raised p-4 text-ink">
        {t("now")}
      </p>
    </PageStub>
  );
}
