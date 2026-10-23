"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * The bar under the current section. It slides (transform only) when the route
 * changes; the first placement is instant. Until it mounts, CSS underlines the
 * current link instead.
 */
export function NavIndicator() {
  const ref = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const bar = ref.current;
    const nav = bar?.closest<HTMLElement>(".nav");
    if (!bar || !nav) return;
    const place = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) {
        bar.style.setProperty("--w", "0");
        return;
      }
      const inset = 16;
      const box = active.getBoundingClientRect();
      const origin = nav.getBoundingClientRect();
      bar.style.setProperty("--x", `${box.left - origin.left + inset}px`);
      bar.style.setProperty("--w", String(Math.max(0, box.width - 2 * inset)));
    };
    if (!placed.current) {
      bar.style.transition = "none";
      place();
      void bar.offsetWidth;
      bar.style.transition = "";
      placed.current = true;
      nav.setAttribute("data-ready", "");
    } else {
      place();
    }
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname]);

  return <span ref={ref} className="nav-ind" aria-hidden="true" />;
}
