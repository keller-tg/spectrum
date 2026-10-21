"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

/** Raw answer: −2 … +2, or null for an explicit skip (never merged with neutral 0). */
export type AnswerValue = -2 | -1 | 0 | 1 | 2;

const OPTIONS: {
  value: AnswerValue;
  key: "stronglyDisagree" | "disagree" | "neutral" | "agree" | "stronglyAgree";
  size: number;
}[] = [
  { value: -2, key: "stronglyDisagree", size: 30 },
  { value: -1, key: "disagree", size: 22 },
  { value: 0, key: "neutral", size: 15 },
  { value: 1, key: "agree", size: 22 },
  { value: 2, key: "stronglyAgree", size: 30 },
];

interface AnswerScaleProps {
  value: AnswerValue | null | undefined;
  skipped?: boolean;
  onAnswer: (value: AnswerValue) => void;
  onSkip: () => void;
}

/**
 * Five-point scale plus a separate skip. Geometry is fixed (same grid, same
 * marker sizes) so nothing moves between questions. Arrow keys move within
 * the group; the test page adds global 1–5 shortcuts.
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
    const option = OPTIONS[next];
    if (option) onAnswer(option.value);
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t("groupLabel")}
        className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3"
      >
        {OPTIONS.map((option, index) => {
          const checked = value === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onAnswer(option.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`group flex min-h-14 items-center gap-4 rounded-xl border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] sm:min-h-36 sm:flex-col sm:justify-center sm:gap-3 sm:px-2 sm:text-center ${
                checked
                  ? "border-accent bg-accent/8"
                  : "border-rule-strong bg-paper-raised hover:border-ink"
              }`}
            >
              <span className="grid w-8 shrink-0 place-items-center sm:h-8 sm:w-auto">
                <span
                  aria-hidden="true"
                  className={`block rounded-full border-2 transition-colors duration-150 ${checked ? "border-accent bg-accent" : "border-ink-3 group-hover:border-ink"}`}
                  style={{ width: option.size, height: option.size }}
                />
              </span>
              <span
                className={`text-sm leading-tight font-semibold ${checked ? "text-ink" : "text-ink-2 group-hover:text-ink"}`}
              >
                <span
                  aria-hidden="true"
                  className="tabular mr-2 text-xs font-normal text-ink-3 sm:hidden"
                >
                  {index + 1}
                </span>
                {t(option.key)}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onSkip}
        aria-pressed={skipped}
        className={`mt-3 w-full rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition-colors sm:mt-4 ${
          skipped
            ? "border-ink bg-paper-sunk text-ink"
            : "border-rule-strong text-ink-2 hover:border-ink hover:text-ink"
        }`}
      >
        {t("skip")}
      </button>
    </div>
  );
}
