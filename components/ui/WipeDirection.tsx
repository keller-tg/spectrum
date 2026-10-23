"use client";

import { useEffect } from "react";

const BLOCKED = '[aria-disabled="true"], [data-status="loading"]';

function hostOf(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>(".wipe-host") : null;
}

function sideOf(host: HTMLElement, x: number) {
  const box = host.getBoundingClientRect();
  return x < box.left + box.width / 2 ? "left" : "right";
}

/**
 * One delegated listener for every wipe on the page (D-083), mounted once in
 * the root layout. A fine pointer entering a host sets [data-wipe-in]; the
 * panel then comes in from the side the pointer entered and, on leaving,
 * goes out towards the side it left. If the panel is still moving, it simply
 * reverses from where it is, so rapid in/out never jumps or sticks.
 */
export function WipeDirection() {
  useEffect(() => {
    const over = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const host = hostOf(event.target);
      if (!host || host.contains(event.relatedTarget as Node | null) || host.matches(BLOCKED))
        return;
      const panel = host.querySelector<HTMLElement>(":scope > .wipe > .wipe-panel");
      const side = sideOf(host, event.clientX);
      if (panel && host.dataset.wipeFrom !== side && panel.getAnimations().length === 0) {
        // At rest off-screen: move it to the entry side without animating.
        panel.style.transition = "none";
        host.dataset.wipeFrom = side;
        void panel.offsetWidth;
        panel.style.transition = "";
      }
      host.setAttribute("data-wipe-in", "");
    };
    const out = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const host = hostOf(event.target);
      if (!host || host.contains(event.relatedTarget as Node | null)) return;
      host.dataset.wipeFrom = sideOf(host, event.clientX);
      host.removeAttribute("data-wipe-in");
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
    };
  }, []);
  return null;
}
