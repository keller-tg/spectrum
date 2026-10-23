import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PilotFlow } from "@/components/pilot/PilotFlow";
import { CONTENT_COMPLETE, type Locale } from "@/data/locales";
import { modeQuestions } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import { loadDerived } from "@/lib/catalog/derived";

/** Unlinked and never indexed (also an X-Robots-Tag header, next.config.ts); not in robots.txt. */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/pilot">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pilot" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

const texts = (mode: "quick" | "standard") =>
  modeQuestions(mode).map((q) => ({
    id: q.id,
    text: QUESTION_TEXT_EN[q.id]?.text ?? "",
    explainer: QUESTION_TEXT_EN[q.id]?.explainer ?? "",
  }));

export default async function Page({ params }: PageProps<"/[locale]/pilot">) {
  const locale = (await params).locale as Locale;
  return (
    <PilotFlow
      items={{ standard: texts("standard"), quick: texts("quick") }}
      bankVersion={loadDerived().questionBankVersion}
      contentLang={locale === "en" || CONTENT_COMPLETE[locale] ? undefined : "en"}
    />
  );
}
