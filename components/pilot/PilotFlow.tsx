"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuestionStage, type StageItem } from "@/components/test/QuestionStage";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import type { Locale } from "@/data/locales";
import type { AnswerRecord } from "@/lib/engine/types";
import { ENGINE_VERSION } from "@/lib/engine/version";
import { PILOT_FORMAT, PILOT_VERSION, pilotFileSchema } from "@/lib/schema/pilot";

type PilotMode = "standard" | "quick";

function randomName() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `spectrum-pilot-${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}.json`;
}

/**
 * The pilot (PLAN §7a, D-072): explicit consent, then the real test with
 * answers held only in this component's memory (no IndexedDB, no cookie, no
 * request), then one anonymous file to download. Answers are cleared once the
 * file is saved; the participant decides whether to pass it on.
 */
export function PilotFlow({
  items,
  bankVersion,
  contentLang,
}: {
  items: Record<PilotMode, readonly StageItem[]>;
  bankVersion: string;
  contentLang?: string;
}) {
  const t = useTranslations("pilot");
  const th = useTranslations("home");
  const locale = useLocale() as Locale;
  const [step, setStep] = useState<"consent" | "test" | "done">("consent");
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<PilotMode>("standard");
  const [country, setCountry] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [index, setIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [fileName, setFileName] = useState("");
  const code = country.trim().toUpperCase();
  const countryOk = code === "" || /^[A-Z]{2}$/.test(code);

  if (step === "consent")
    return (
      <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <p className="annot font-bold">{t("kicker")}</p>
        <h1 className="display mt-4 text-display-lg">{t("title")}</h1>
        <div className="prose-text mt-6 space-y-4">
          <p>{t("intro")}</p>
          <p>{t("contains")}</p>
          <p>{t("sensitive")}</p>
          <p>{t("nothingStored")}</p>
          <p>{t("yourChoice")}</p>
          <p className="annot font-bold">{t("noSwitch")}</p>
        </div>
        <div className="mt-10 grid max-w-2xl gap-6">
          <div>
            <p className="label">{t("length")}</p>
            <div className="mt-2">
              <Segmented<PilotMode>
                label={t("length")}
                value={mode}
                onChange={setMode}
                options={[
                  { value: "standard", label: th("modes.standard.name") },
                  { value: "quick", label: th("modes.quick.name") },
                ]}
              />
            </div>
          </div>
          <TextField
            id="pilot-country"
            label={t("country")}
            hint={t("countryHint")}
            value={country}
            maxLength={2}
            autoComplete="off"
            onChange={(e) => setCountry(e.target.value)}
            error={countryOk ? undefined : t("countryError")}
          />
          <Checkbox
            id="pilot-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          >
            {t("consent")}
          </Checkbox>
          <div>
            <Button
              size="l"
              arrow
              disabled={!consent || !countryOk}
              onClick={() => consent && countryOk && setStep("test")}
            >
              {t("start")}
            </Button>
          </div>
        </div>
      </div>
    );

  if (step === "done")
    return (
      <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <h1 className="display text-display-lg">{t("thanks")}</h1>
        <p className="prose-text mt-6">{t("saved", { name: fileName })}</p>
        <p className="prose-text mt-4">{t("cleared")}</p>
      </div>
    );

  const list = items[mode];
  return (
    <>
      <p className="annot border-b border-ink px-4 py-2 text-center font-bold">{t("banner")}</p>
      <QuestionStage
        items={list}
        index={index}
        answers={answers}
        contentLang={contentLang}
        modeLabel={th(`modes.${mode}.name`)}
        autoAdvance={autoAdvance}
        onAutoAdvance={setAutoAdvance}
        onAnswer={(id, r, ms) => setAnswers((a) => ({ ...a, [id]: { r, ms } }))}
        onSkip={(id) => setAnswers((a) => ({ ...a, [id]: { r: null } }))}
        onMove={(i) => {
          setIndex(i);
          window.scrollTo({ top: 0 });
        }}
        onFinish={() => {
          const file = pilotFileSchema.parse({
            format: PILOT_FORMAT,
            version: PILOT_VERSION,
            bankVersion,
            engineVersion: ENGINE_VERSION,
            mode,
            locale,
            answers: Object.fromEntries(list.map((q) => [q.id, answers[q.id]])),
            ...(code ? { country: code } : {}),
          });
          const name = randomName();
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(file, null, 1)], { type: "application/json" }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = name;
          document.body.append(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setAnswers({});
          setFileName(name);
          setStep("done");
        }}
      />
    </>
  );
}
