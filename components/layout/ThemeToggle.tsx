"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { THEME_STORAGE_KEY } from "./ThemeScript";

function readStored(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const t = useTranslations("theme");

  // Follow the system theme live until the user makes an explicit choice.
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStored()) return;
      document.documentElement.setAttribute("data-theme", media.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page only.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggle")}
      title={t("toggle")}
      className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-sunk hover:text-ink"
    >
      {/* Moon in light mode, sun in dark mode; CSS decides, so SSR never mismatches. */}
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
        className="dark:hidden"
      >
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
        className="hidden dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
