"use client";

import { useId, useRef, useState } from "react";

/**
 * "[?]" with a bordered note. Hover opens it after 300ms (CSS), focus or tap
 * at once; it comes in over 120ms. Escape closes it. Before it opens, the note
 * is shifted so it stays inside the viewport.
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const id = useId();
  const note = useRef<HTMLSpanElement>(null);

  /** Keep the note inside the viewport (16px margins). */
  const place = () => {
    const el = note.current;
    const host = el?.parentElement?.getBoundingClientRect();
    if (!el || !host) return;
    const vw = document.documentElement.clientWidth;
    const width = Math.min(288, vw - 32);
    const shift = Math.max(16 - host.left, Math.min(0, vw - 16 - width - host.left));
    el.style.left = `${shift}px`;
  };

  return (
    <span
      className="tip-host relative inline-flex align-middle"
      data-open={open || undefined}
      data-dismissed={dismissed || undefined}
      onMouseEnter={place}
      onMouseLeave={() => {
        setOpen(false);
        setDismissed(false);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        onFocus={place}
        onClick={() => {
          place();
          setDismissed(false);
          setOpen((o) => !o);
        }}
        onBlur={() => {
          setOpen(false);
          setDismissed(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setDismissed(true);
          }
        }}
        className="label min-h-11 min-w-11 px-1"
      >
        <span aria-hidden="true">{"[?]"}</span>
      </button>
      <span ref={note} role="tooltip" id={id} className="tip">
        {children}
      </span>
    </span>
  );
}
