"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/data/locales";
import type { ModeId } from "@/data/modes";
import { useRouter } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";
import { QuestionStage, type StageItem } from "./QuestionStage";
import { useTest } from "./TestProvider";

/** One routed question (/test/[mode]/[n]); the URL holds the position, never an answer. */
export function TestScreen({
  mode,
  modeLabel,
  items,
  index,
  contentLang,
}: {
  mode: ModeId;
  modeLabel: string;
  items: readonly StageItem[];
  index: number;
  contentLang?: string;
}) {
  const t = useTranslations("test");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const test = useTest();
  const [finishing, setFinishing] = useState(false);

  const go = (i: number) =>
    router.push({
      pathname: "/test/[mode]/[n]",
      params: { mode: modeSlug(locale, mode), n: String(i + 1) },
    });

  return (
    <>
      {!test.persistent ? (
        <p role="status" className="annot border-b border-ink px-4 py-2 text-center font-bold">
          {t("notStored")}
        </p>
      ) : null}
      {contentLang ? (
        <p className="annot border-b border-ink px-4 py-2 text-center">{t("englishOnly")}</p>
      ) : null}
      <QuestionStage
        items={items}
        index={index}
        answers={test.answers}
        contentLang={contentLang}
        modeLabel={modeLabel}
        autoAdvance={test.autoAdvance}
        onAutoAdvance={test.setAutoAdvance}
        onAnswer={(id, value, ms) => test.setAnswer(id, value, ms)}
        onSkip={(id) => test.setAnswer(id, null, 0)}
        onMove={go}
        finishing={finishing}
        onFinish={async () => {
          setFinishing(true);
          await test.finish();
          router.push("/results");
        }}
      />
    </>
  );
}
