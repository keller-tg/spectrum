"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

export function ToggleDemo(props: {
  label: string;
  onText: string;
  offText: string;
  initial?: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(props.initial ?? false);
  return (
    <Toggle
      label={props.label}
      onText={props.onText}
      offText={props.offText}
      checked={checked}
      onChange={setChecked}
      disabled={props.disabled}
    />
  );
}
