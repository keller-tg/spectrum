import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TestScreen } from "@/components/test/TestScreen";
import { CONTENT_COMPLETE } from "@/data/locales";
import { modeQuestions } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import type { Locale } from "@/data/locales";
import { MODE_IDS, MODES } from "@/data/modes";
import { modeFromSlug, modeSlug } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

/** Every question page of every open mode exists statically, per locale (Deep: Phase 9). */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return MODE_IDS.filter((id) => modeQuestions(id).length === MODES[id].count).flatMap((id) =>
    Array.from({ length: MODES[id].count }, (_, i) => ({
      mode: modeSlug(locale, id),
      n: String(i + 1),
    })),
  );
}

function resolve(locale: Locale, slug: string, n: string) {
  const mode = modeFromSlug(locale, slug);
  const index = Number(n);
  if (!mode || !Number.isInteger(index) || index < 1 || index > modeQuestions(mode).length)
    return null;
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
  const locale = raw as Locale;
  const found = resolve(locale, slug, n);
  if (!found) notFound();
  const th = await getTranslations("home");
  // Statements exist in English only until Phase 9 (D-028); they are marked lang="en".
  const items = modeQuestions(found.mode).map((q) => ({
    id: q.id,
    text: QUESTION_TEXT_EN[q.id]?.text ?? "",
    explainer: QUESTION_TEXT_EN[q.id]?.explainer ?? "",
  }));
  return (
    <TestScreen
      mode={found.mode}
      modeLabel={th(`modes.${found.mode}.name`)}
      items={items}
      index={found.index - 1}
      contentLang={locale === "en" || CONTENT_COMPLETE[locale] ? undefined : "en"}
    />
  );
}
