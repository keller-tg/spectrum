"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

/**
 * "[?]" button with a bordered note. Opens on hover, focus or tap, instantly;
 * Escape closes it. The note flips to the left edge if it would leave the screen.
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const id = useId();
  const note = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!open || !note.current) return;
    const rect = note.current.getBoundingClientRect();
    if (rect.right > document.documentElement.clientWidth - 8) setAlignEnd(true);
  }, [open]);

  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="label min-h-11 min-w-11 px-1 hover:bg-ink hover:text-paper"
      >
        <span aria-hidden="true">{"[?]"}</span>
      </button>
      <span
        ref={note}
        role="tooltip"
        id={id}
        hidden={!open}
        className={`absolute top-full z-30 mt-1 w-[min(18rem,calc(100vw-2rem))] border-2 border-ink bg-paper p-3 font-sans text-base leading-normal text-ink ${alignEnd ? "right-0" : "left-0"}`}
      >
        {children}
      </span>
    </span>
  );
}
