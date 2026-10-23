import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeComposition } from "@/components/home/HomeComposition";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/styleguide/home-b">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "styleguide.home" });
  return pageMetadata({
    locale,
    title: t("typographic"),
    description: t("lead"),
    hrefFor: () => "/styleguide/home-b",
    noindex: true,
  });
}

/** Home variant B, "typographic" (D-081), for review. Noindex, not linked. */
export default async function Page({ params }: PageProps<"/[locale]/styleguide/home-b">) {
  const locale = (await params).locale as Locale;
  return <HomeComposition locale={locale} variant="typographic" />;
}
