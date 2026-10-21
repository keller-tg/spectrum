import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/ui/PageStub";
import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES } from "@/data/modes";
import { modeFromSlug, modeSlug } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

/** Every question page of every mode exists statically, per locale. */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return MODE_IDS.flatMap((id) =>
    Array.from({ length: MODES[id].count }, (_, i) => ({
      mode: modeSlug(locale, id),
      n: String(i + 1),
    })),
  );
}

function resolve(locale: Locale, slug: string, n: string) {
  const mode = modeFromSlug(locale, slug);
  const index = Number(n);
  if (!mode || !Number.isInteger(index) || index < 1 || index > MODES[mode].count) return null;
  return { mode, index };
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/test/[mode]/[n]">): Promise<Metadata> {
  const { locale: raw, mode: slug, n } = await params;
  const locale = raw as Locale;
  const found = resolve(locale, slug, n);
  if (!found) return {};
  const t = await getTranslations({ locale, namespace: "pages.question" });
  return pageMetadata({
    locale,
    title: t("title", { n: found.index, count: MODES[found.mode].count }),
    description: t("lead"),
    hrefFor: (l) => ({
      pathname: "/test/[mode]/[n]",
      params: { mode: modeSlug(l, found.mode), n },
    }),
    noindex: true,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/test/[mode]/[n]">) {
  const { locale: raw, mode: slug, n } = await params;
  const found = resolve(raw as Locale, slug, n);
  if (!found) notFound();
  const t = await getTranslations("pages.question");
  return (
    <PageStub
      title={t("title", { n: found.index, count: MODES[found.mode].count })}
      lead={t("lead")}
      phase={3}
    />
  );
}
