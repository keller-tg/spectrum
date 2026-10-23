import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@/data/locales";

/**
 * Every static route segment is localized here. Dynamic values (mode names,
 * entry slugs) are localized from /data via i18n/params.ts.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // The only cookie the app may set is the optional profile cookie (D-025).
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/test": "/test",
    "/test/[mode]/[n]": "/test/[mode]/[n]",
    "/results": { en: "/results", de: "/ergebnisse", fr: "/resultats" },
    "/results/[code]": { en: "/results/[code]", de: "/ergebnisse/[code]", fr: "/resultats/[code]" },
    "/compare/[code]": { en: "/compare/[code]", de: "/vergleich/[code]", fr: "/comparer/[code]" },
    "/dashboard": { en: "/dashboard", de: "/verlauf", fr: "/tableau-de-bord" },
    "/compass": { en: "/compass", de: "/kompass", fr: "/boussole" },
    "/web": { en: "/web", de: "/netz", fr: "/reseau" },
    "/sandbox": { en: "/sandbox", de: "/sandkasten", fr: "/bac-a-sable" },
    "/ideologies": { en: "/ideologies", de: "/ideologien", fr: "/ideologies" },
    "/ideologies/[slug]": {
      en: "/ideologies/[slug]",
      de: "/ideologien/[slug]",
      fr: "/ideologies/[slug]",
    },
    "/countries": { en: "/countries", de: "/laender", fr: "/pays" },
    "/countries/[slug]": { en: "/countries/[slug]", de: "/laender/[slug]", fr: "/pays/[slug]" },
    "/figures": { en: "/figures", de: "/persoenlichkeiten", fr: "/personnalites" },
    "/figures/[slug]": {
      en: "/figures/[slug]",
      de: "/persoenlichkeiten/[slug]",
      fr: "/personnalites/[slug]",
    },
    "/parties": { en: "/parties", de: "/parteien", fr: "/partis" },
    "/parties/[slug]": { en: "/parties/[slug]", de: "/parteien/[slug]", fr: "/partis/[slug]" },
    "/method": { en: "/method", de: "/methode", fr: "/methode" },
    "/privacy": { en: "/privacy", de: "/datenschutz", fr: "/confidentialite" },
    "/imprint": { en: "/imprint", de: "/impressum", fr: "/mentions-legales" },
    "/pilot": "/pilot",
    "/styleguide": { en: "/styleguide", de: "/styleguide", fr: "/guide-de-style" },
    "/styleguide/buttons": {
      en: "/styleguide/buttons",
      de: "/styleguide/buttons",
      fr: "/guide-de-style/boutons",
    },
    "/styleguide/screens": {
      en: "/styleguide/screens",
      de: "/styleguide/screens",
      fr: "/guide-de-style/ecrans",
    },
    "/styleguide/home-a": {
      en: "/styleguide/home-a",
      de: "/styleguide/home-a",
      fr: "/guide-de-style/accueil-a",
    },
    "/styleguide/home-b": {
      en: "/styleguide/home-b",
      de: "/styleguide/home-b",
      fr: "/guide-de-style/accueil-b",
    },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
