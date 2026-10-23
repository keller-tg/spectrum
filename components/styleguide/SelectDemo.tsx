"use client";

import { useState } from "react";
import { Select, type SelectGroup } from "@/components/ui/Select";

export function SelectDemo({
  id,
  label,
  groups,
  initial,
}: {
  id: string;
  label: string;
  groups: readonly SelectGroup<string>[];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Select
      id={id}
      label={label}
      groups={groups}
      value={value}
      onChange={setValue}
      className="w-full max-w-72"
    />
  );
}
