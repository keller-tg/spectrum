"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { PALETTE, type ThemeName } from "@/lib/design/tokens";
import { THEME_STORAGE_KEY } from "./ThemeScript";

const THEMES: readonly ThemeName[] = ["light", "dark"];

function readStored(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const currentTheme = () => document.documentElement.getAttribute("data-theme") as ThemeName | null;

function choose(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  let meta = document.querySelector<HTMLMetaElement>("meta[data-theme-choice]");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-theme-choice", "");
    document.head.prepend(meta);
  }
  meta.content = PALETTE[theme].paper;
}

/**
 * "[ LIGHT / DARK ]": two text buttons. The pressed look comes from the
 * data-theme attribute in CSS, so it is right before hydration; aria-pressed
 * follows once the client knows the theme. Hidden when no script ran.
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);

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

  const pressed: Record<ThemeName, string> = {
    light: "bg-ink text-paper dark:bg-paper dark:text-ink dark:hover:bg-ink dark:hover:text-paper",
    dark: "hover:bg-ink hover:text-paper dark:bg-ink dark:text-paper",
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="label flex items-stretch [:root:not([data-theme])_&]:hidden"
    >
      <span aria-hidden="true" className="flex items-center pr-1">
        [
      </span>
      {THEMES.map((name, i) => (
        <span key={name} className="flex items-stretch">
          {i > 0 ? (
            <span aria-hidden="true" className="flex items-center px-1">
              /
            </span>
          ) : null}
          <button
            type="button"
            aria-pressed={theme === null ? undefined : theme === name}
            onClick={() => choose(name)}
            className={`min-h-11 min-w-11 px-1.5 uppercase ${pressed[name]}`}
          >
            {t(name)}
          </button>
        </span>
      ))}
      <span aria-hidden="true" className="flex items-center pl-1">
        ]
      </span>
    </div>
  );
}
