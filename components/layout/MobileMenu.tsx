"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

/** Native <details> disclosure (works without JS) that closes after navigation. */
export function MobileMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="group relative md:hidden">
      <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full text-ink-2 hover:bg-paper-sunk hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="sr-only">{label}</span>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h10" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
        </svg>
      </summary>
      <div className="absolute top-11 right-0 z-30 w-56 rounded-lg border border-rule bg-paper-raised p-2 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]">
        {children}
      </div>
    </details>
  );
}
