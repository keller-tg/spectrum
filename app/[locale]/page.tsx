import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeComposition } from "@/components/home/HomeComposition";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...pageMetadata({
      locale,
      title: t("homeTitle"),
      description: t("homeDescription"),
      hrefFor: () => "/",
    }),
    title: { absolute: t("homeTitle") },
  };
}

/** Home: variant A, "specimen" (D-084; B stays on /styleguide/home-b for comparison). */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  return <HomeComposition locale={locale} variant="specimen" />;
}
