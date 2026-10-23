"use client";

import { useEffect, useRef, useState } from "react";
import { Button, type ButtonStatus, type ButtonVariant } from "@/components/ui/Button";

/** Click to run the real sequence: loading, then success (or error), then back to rest. */
export function ButtonDemo({
  variant,
  outcome,
  label,
  statusLabel,
  loadingLabel,
}: {
  variant: ButtonVariant;
  outcome: "success" | "error";
  label: string;
  statusLabel: string;
  loadingLabel: string;
}) {
  const [status, setStatus] = useState<ButtonStatus | undefined>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <Button
      variant={variant}
      arrow
      status={status}
      statusLabel={statusLabel}
      loadingLabel={loadingLabel}
      onClick={() => {
        if (status === "loading") return;
        setStatus("loading");
        timers.current.push(
          setTimeout(() => setStatus(outcome), 1400),
          setTimeout(() => setStatus(undefined), 3200),
        );
      }}
    >
      {label}
    </Button>
  );
}
