"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/** Raw answer: −2 … +2, or null for an explicit skip (never merged with neutral 0). */
export type AnswerValue = -2 | -1 | 0 | 1 | 2;

/** The chosen row stays visibly selected this long before the test moves on. */
export const ADVANCE_DELAY_MS = 180;

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

function RowContent({ keycap, label }: { keycap: string; label: string }) {
  return (
    <>
      <kbd className="keycap" aria-hidden="true">
        {keycap}
      </kbd>
      <span aria-hidden="true" className="label whitespace-pre">
        [<span className="mark-x">{"X"}</span>]
      </span>
      <span className="label text-[0.9375rem]">{label}</span>
    </>
  );
}

interface AnswerRowsProps {
  value: AnswerValue | null | undefined;
  skipped?: boolean;
  onAnswer: (value: AnswerValue) => void;
  onSkip: () => void;
  /** Called ADVANCE_DELAY_MS after an answer, when auto-advance is on. */
  onAdvance?: () => void;
  /** Pins the hover look on one row (styleguide only). */
  pinnedHover?: AnswerValue;
}

/**
 * Five full-width ruled rows plus a separate skip. Pressing wipes the row in;
 * the chosen row stays inverted with "[X]" (the X draws in over 120ms).
 * Keycaps 1–5 show on desktop; arrow keys move within the group.
 */
export function AnswerRows({
  value,
  skipped = false,
  onAnswer,
  onSkip,
  onAdvance,
  pinnedHover,
}: AnswerRowsProps) {
  const t = useTranslations("scale");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusIndex =
    value === null || value === undefined ? 2 : OPTIONS.findIndex((o) => o.value === value);

  useEffect(() => () => clearTimeout(timer.current), []);

  const answer = (v: AnswerValue) => {
    onAnswer(v);
    if (onAdvance) {
      clearTimeout(timer.current);
      timer.current = setTimeout(onAdvance, ADVANCE_DELAY_MS);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
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
      <div role="radiogroup" aria-label={t("groupLabel")} className="border-2 border-ink">
        {OPTIONS.map((o, index) => (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => answer(o.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            data-state={pinnedHover === o.value ? "hover" : undefined}
            className="answer-row wipe-host border-ink not-last:border-b"
          >
            <RowContent keycap={String(index + 1)} label={t(o.key)} />
            <span className="wipe" aria-hidden="true">
              <RowContent keycap={String(index + 1)} label={t(o.key)} />
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        aria-pressed={skipped}
        className="answer-row wipe-host mt-3 border-[1.5px] border-dashed border-ink"
      >
        <RowContent keycap="0" label={t("skip")} />
        <span className="wipe" aria-hidden="true">
          <RowContent keycap="0" label={t("skip")} />
        </span>
      </button>
    </div>
  );
}

/** Self-contained demo with local state (styleguide, screens). */
export function AnswerRowsDemo({
  initial = null,
  initialSkipped = false,
  pinnedHover,
}: {
  initial?: AnswerValue | null;
  initialSkipped?: boolean;
  pinnedHover?: AnswerValue;
}) {
  const [value, setValue] = useState<AnswerValue | null>(initial);
  const [skipped, setSkipped] = useState(initialSkipped);
  return (
    <AnswerRows
      value={value}
      skipped={skipped}
      pinnedHover={pinnedHover}
      onAnswer={(v) => {
        setValue(v);
        setSkipped(false);
      }}
      onSkip={() => {
        setValue(null);
        setSkipped(true);
      }}
    />
  );
}
