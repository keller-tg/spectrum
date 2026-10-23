import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModeRows } from "@/components/home/ModeRows";
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

/** One screen: wordmark, one sentence, the three test lengths. Nothing else. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("home");
  const tm = await getTranslations("meta");

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-y-8 px-4 pt-8 pb-10 sm:pt-12">
      <div className="col-span-12 lg:col-span-10">
        <p
          aria-hidden="true"
          className="font-mono text-xl font-bold tracking-[0.2em] uppercase sm:text-2xl"
        >
          {tm("siteName")}
        </p>
        <h1 className="display mt-4 text-display-xl">{t("sentence")}</h1>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <ModeRows locale={locale} />
      </div>
    </div>
  );
}
