import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModeTable } from "@/components/home/ModeTable";
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
  const th = await getTranslations("home");
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16">
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-5">{t("lead")}</p>
      <div className="mt-10 max-w-4xl">
        <ModeTable locale={locale} blurbs />
        <p className="prose-text mt-4">{th("modesNote")}</p>
      </div>
    </div>
  );
}
