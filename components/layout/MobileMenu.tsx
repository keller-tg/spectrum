"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Native <details> disclosure (works without JS) that closes after navigation.
 * The panel drops below the whole header, which is its positioning context.
 */
export function MobileMenu({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className={`group flex ${className}`}>
      <summary className="label flex min-h-11 list-none items-center border-l-2 border-ink px-4 group-open:bg-ink group-open:text-paper hover:bg-ink hover:text-paper [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <div className="absolute inset-x-0 top-full z-30 border-b-2 border-ink bg-paper">
        {children}
      </div>
    </details>
  );
}
