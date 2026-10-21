"use client";

import { useState } from "react";
import { AnswerScale, type AnswerValue } from "./AnswerScale";

export function AnswerScaleDemo() {
  const [value, setValue] = useState<AnswerValue | null>(null);
  const [skipped, setSkipped] = useState(false);
  return (
    <AnswerScale
      value={value}
      skipped={skipped}
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
