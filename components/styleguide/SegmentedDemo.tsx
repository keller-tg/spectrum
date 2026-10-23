"use client";

import { useState } from "react";
import { Segmented, type SegmentOption } from "@/components/ui/Segmented";

export function SegmentedDemo({
  label,
  options,
  initial,
}: {
  label: string;
  options: readonly SegmentOption<string>[];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return <Segmented label={label} options={options} value={value} onChange={setValue} />;
}
