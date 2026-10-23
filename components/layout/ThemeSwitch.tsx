"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Segmented } from "@/components/ui/Segmented";
import { PALETTE, type ThemeName } from "@/lib/design/tokens";
import { THEME_STORAGE_KEY } from "./ThemeScript";

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
 * LIGHT / DARK as a segmented radiogroup. The indicator position comes from
 * the data-theme attribute in CSS, so it is right before hydration. Hidden
 * when no script ran (the system theme applies then).
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
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

  return (
    <Segmented<ThemeName>
      label={t("label")}
      seg="theme"
      value={theme}
      onChange={choose}
      options={[
        { value: "light", label: t("light") },
        { value: "dark", label: t("dark") },
      ]}
      className={`[:root:not([data-theme])_&]:hidden ${className}`}
    />
  );
}
