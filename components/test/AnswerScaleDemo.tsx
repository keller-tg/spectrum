"use client";

import { useState } from "react";
import { AnswerScale, type AnswerValue } from "./AnswerScale";

export function AnswerScaleDemo({
  initial = null,
  initialSkipped = false,
}: {
  initial?: AnswerValue | null;
  initialSkipped?: boolean;
}) {
  const [value, setValue] = useState<AnswerValue | null>(initial);
  const [skipped, setSkipped] = useState(initialSkipped);
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
