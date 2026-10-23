"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { NavLink } from "./NavLink";

type Href = React.ComponentProps<typeof NavLink>["href"];

/**
 * Mobile navigation: a full-screen inverted sheet in large display type. It is
 * a native popover, so it opens, closes and traps nothing without any script;
 * the script only closes it after a navigation. Items arrive in 40ms steps.
 */
export function MobileNav({
  labels,
  items,
  children,
  className = "",
}: {
  labels: { menu: string; close: string; primary: string };
  items: readonly { href: Href; label: string }[];
  children?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const sheet = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = sheet.current;
    if (el?.matches(":popover-open")) el.hidePopover();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className={`label min-h-11 border-[1.5px] border-ink px-4 ${className}`}
      >
        {labels.menu}
      </button>
      <div id={id} ref={sheet} popover="auto" data-invert="" className="sheet">
        <div className="flex h-14 items-center justify-end border-b border-ink px-4">
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            className="label min-h-11 border-[1.5px] border-ink px-4"
          >
            {labels.close}
          </button>
        </div>
        <nav aria-label={labels.primary} className="px-4 pt-6">
          <ul>
            {items.map((item, i) => (
              <li
                key={String(item.href)}
                className="sheet-item border-b border-ink"
                style={{ "--i": i } as React.CSSProperties}
              >
                <NavLink
                  href={item.href}
                  className="bracketed display block py-3 text-display-lg no-underline"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {children ? (
          <div
            className="sheet-item flex flex-wrap items-center gap-4 px-4 py-8"
            style={{ "--i": items.length } as React.CSSProperties}
          >
            {children}
          </div>
        ) : null}
      </div>
    </>
  );
}
