import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModeCards } from "@/components/home/ModeCards";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/test">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.test" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/test",
  });
}

export default async function Page({ params }: PageProps<"/[locale]/test">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("pages.test");
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
      <h1 className="display rise text-display-lg text-ink">{t("title")}</h1>
      <p className="mt-5 mb-12 max-w-2xl text-lg leading-relaxed text-ink-2">{t("lead")}</p>
      <ModeCards locale={locale} />
    </div>
  );
}
