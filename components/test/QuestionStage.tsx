"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import type { AnswerRecord } from "@/lib/engine/types";
import { AnswerRows, type AnswerValue } from "./AnswerRows";
import { TickProgress } from "./TickProgress";

export interface StageItem {
  id: string;
  text: string;
  explainer: string;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * The test screen (PLAN §7), shared by the test and the pilot. Fixed layout:
 * every statement of the mode is stacked in one grid cell (only the current
 * one visible), so the area is as tall as the longest statement and the answer
 * rows never move. No axis or pole is named anywhere. Keys: 1–5 answer, 0 or S
 * skip, ← → move, ? explains.
 */
export function QuestionStage({
  items,
  index,
  answers,
  contentLang,
  modeLabel,
  autoAdvance,
  onAutoAdvance,
  onAnswer,
  onSkip,
  onMove,
  onFinish,
  finishing = false,
}: {
  items: readonly StageItem[];
  /** 0-based. */
  index: number;
  answers: Readonly<Record<string, AnswerRecord>>;
  /** Language of the statements, when it differs from the interface. */
  contentLang?: string;
  modeLabel: string;
  autoAdvance: boolean;
  onAutoAdvance: (on: boolean) => void;
  onAnswer: (id: string, value: AnswerValue, ms: number) => void;
  onSkip: (id: string, ms: number) => void;
  /** Go to another question (0-based). */
  onMove: (index: number) => void;
  onFinish: () => void;
  finishing?: boolean;
}) {
  const t = useTranslations("test");
  const item = items[index] as StageItem;
  const total = items.length;
  const record = answers[item.id];
  const shownAt = useRef(0);
  const explainer = useRef<HTMLButtonElement>(null);
  const last = index === total - 1;
  const done = items.map((q) => answers[q.id] !== undefined);
  const open = done.filter((d) => !d).length;
  const firstOpen = done.indexOf(false);

  useEffect(() => {
    shownAt.current = performance.now();
  }, [index]);

  const elapsed = () => Math.round(performance.now() - shownAt.current);
  const advance = () => {
    if (!last) onMove(index + 1);
  };
  const answer = (value: AnswerValue) => onAnswer(item.id, value, elapsed());
  const skip = () => {
    onSkip(item.id, elapsed());
    advance();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (document.querySelector("dialog[open]")) return;
      const inGroup =
        event.target instanceof Element && event.target.closest('[role="radiogroup"]');
      if (/^[1-5]$/.test(event.key)) {
        event.preventDefault();
        answer((Number(event.key) - 3) as AnswerValue);
        if (autoAdvance) setTimeout(advance, 180);
      } else if (event.key === "0" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        skip();
      } else if (event.key === "ArrowRight" && !inGroup && !last) {
        onMove(index + 1);
      } else if (event.key === "ArrowLeft" && !inGroup && index > 0) {
        onMove(index - 1);
      } else if (event.key === "?") {
        event.preventDefault();
        explainer.current?.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const value = record?.r ?? null;
  return (
    <div className="mx-auto grid max-w-[96rem] grid-cols-12 gap-x-6 gap-y-10 px-4 pt-8 pb-16 sm:px-6 lg:gap-x-12 lg:px-10 lg:pt-12">
      <div className="col-span-12 lg:col-span-7">
        <p className="annot font-bold">
          {t("questionOf", { n: index + 1, count: total })} · {modeLabel}
        </p>
        <p aria-hidden="true" className="mt-4 font-mono text-numeral font-bold">
          {String(index + 1).padStart(2, "0")}
        </p>
        <div className="mt-6 grid" lang={contentLang}>
          {items.map((q, i) => (
            <p
              key={q.id}
              aria-hidden={i !== index}
              className={`display col-start-1 row-start-1 text-display-md ${i === index ? "" : "invisible"}`}
              {...(i === index ? { id: "question-statement" } : {})}
            >
              {q.text}
            </p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Modal
            triggerLabel={t("explain")}
            title={t("explainTitle")}
            closeLabel={t("close")}
            triggerRef={explainer}
          >
            <span lang={contentLang}>{item.explainer}</span>
          </Modal>
          <span className="annot">{t("keys")}</span>
        </div>
        <div className="mt-10">
          <TickProgress total={total} current={index + 1} done={done} label={t("progress")} />
          <p className="annot mt-2 flex justify-between">
            <span>
              {done.filter(Boolean).length} / {total}
            </span>
            <span>{total}</span>
          </p>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-5">
        <div aria-labelledby="question-statement" role="group">
          <AnswerRows
            value={value === null ? null : (value as AnswerValue | undefined)}
            skipped={record !== undefined && record.r === null}
            onAnswer={answer}
            onSkip={skip}
            onAdvance={autoAdvance ? advance : undefined}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="s"
            disabled={index === 0}
            onClick={() => index > 0 && onMove(index - 1)}
          >
            {t("back")}
          </Button>
          {!last ? (
            <Button variant="secondary" size="s" arrow onClick={() => onMove(index + 1)}>
              {t("next")}
            </Button>
          ) : null}
          <Toggle
            label={t("autoAdvance")}
            onText={t("on")}
            offText={t("off")}
            checked={autoAdvance}
            onChange={onAutoAdvance}
          />
        </div>
        {last || open === 0 ? (
          <div className="mt-8 border-t-2 border-ink pt-6">
            {open > 0 ? (
              <p className="prose-text">
                {t("openLeft", { count: open })}{" "}
                <button type="button" className="link" onClick={() => onMove(firstOpen)}>
                  {t("goToOpen")}
                </button>
              </p>
            ) : (
              <p className="prose-text">{t("allDone")}</p>
            )}
            <div className="mt-4">
              <Button
                size="l"
                arrow
                disabled={open > 0}
                status={finishing ? "loading" : undefined}
                loadingLabel={t("finishing")}
                onClick={() => open === 0 && !finishing && onFinish()}
              >
                {t("finish")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
