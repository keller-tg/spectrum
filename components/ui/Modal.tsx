"use client";

import { useId, useRef } from "react";
import { Button } from "./Button";

/**
 * Native modal <dialog>: focus moves in and back, Escape closes, the page
 * behind is inert. The backdrop is a halftone screen (globals.css).
 */
export function Modal({
  triggerLabel,
  title,
  closeLabel,
  children,
  triggerRef,
}: {
  triggerLabel: string;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  /** Lets a keyboard shortcut open the dialog through its trigger. */
  triggerRef?: React.Ref<HTMLButtonElement>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <Button ref={triggerRef} variant="secondary" arrow onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="modal m-auto w-[min(36rem,calc(100vw-2rem))] border-2 border-ink bg-paper p-0 text-ink"
      >
        <div className="flex items-stretch justify-between border-b-2 border-ink">
          <h2 id={titleId} className="label flex items-center px-4 py-2">
            {title}
          </h2>
          <form method="dialog" className="flex items-center p-1">
            <Button type="submit" variant="text" size="s">
              {closeLabel}
            </Button>
          </form>
        </div>
        <div className="prose-text p-4">{children}</div>
      </dialog>
    </>
  );
}
