"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

/** Raw answer: −2 … +2, or null for an explicit skip (never merged with neutral 0). */
export type AnswerValue = -2 | -1 | 0 | 1 | 2;

const OPTIONS: {
  value: AnswerValue;
  key: "stronglyDisagree" | "disagree" | "neutral" | "agree" | "stronglyAgree";
}[] = [
  { value: -2, key: "stronglyDisagree" },
  { value: -1, key: "disagree" },
  { value: 0, key: "neutral" },
  { value: 1, key: "agree" },
  { value: 2, key: "stronglyAgree" },
];

const MARK = { on: "[X]", off: "[ ]" } as const;

interface AnswerScaleProps {
  value: AnswerValue | null | undefined;
  skipped?: boolean;
  onAnswer: (value: AnswerValue) => void;
  onSkip: () => void;
}

const cell =
  "relative flex min-h-14 w-full items-center gap-4 border-r-2 border-b-2 border-ink px-4 py-3 text-left hover:bg-ink hover:text-paper focus-visible:z-10 active:bg-ink active:text-paper aria-checked:bg-ink aria-checked:text-paper aria-pressed:bg-ink aria-pressed:text-paper";
const option = `${cell} sm:min-h-32 sm:flex-col sm:items-start sm:justify-between`;

/**
 * Five ruled cells plus a separate skip. Geometry is fixed (same grid, same
 * cell sizes) so nothing moves between questions. The chosen cell is inverted
 * and marked "[X]". Arrow keys move within the group; the test page adds
 * global 1–5 shortcuts, which the key numbers show.
 */
export function AnswerScale({ value, skipped = false, onAnswer, onSkip }: AnswerScaleProps) {
  const t = useTranslations("scale");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex =
    value === null || value === undefined ? 2 : OPTIONS.findIndex((o) => o.value === value);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + OPTIONS.length) % OPTIONS.length;
    refs.current[next]?.focus();
    const chosen = OPTIONS[next];
    if (chosen) onAnswer(chosen.value);
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t("groupLabel")}
        className="grid grid-cols-1 border-t-2 border-l-2 border-ink sm:grid-cols-5"
      >
        {OPTIONS.map((o, index) => {
          const checked = value === o.value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onAnswer(o.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={option}
            >
              <span
                aria-hidden="true"
                className="label flex shrink-0 gap-3 sm:w-full sm:justify-between"
              >
                <span>{index + 1}</span>
                <span className="whitespace-pre">{checked ? MARK.on : MARK.off}</span>
              </span>
              <span className="label text-[0.9375rem]">{t(o.key)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 border-t-2 border-l-2 border-ink">
        <button type="button" onClick={onSkip} aria-pressed={skipped} className={cell}>
          <span aria-hidden="true" className="label whitespace-pre">
            {skipped ? MARK.on : MARK.off}
          </span>
          <span className="label text-[0.9375rem]">{t("skip")}</span>
        </button>
      </div>
    </div>
  );
}
