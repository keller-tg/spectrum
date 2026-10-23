import type { Metadata } from "next";
import { LOCALES } from "@/data/locales";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { fontVariables } from "./fonts";
import "./globals.css";

const MESSAGES = { en, de, fr } as const;

export const metadata: Metadata = {
  title: en.notFound.title,
  robots: { index: false },
};

/** Paths outside any locale (rare: the proxy redirects most). Offers all three languages. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="grid min-h-dvh place-items-center px-4">
        <main className="w-full max-w-md border-2 border-ink">
          {LOCALES.map((locale) => (
            <section key={locale} lang={locale} className="border-ink p-4 not-first:border-t-2">
              <h1 className="display text-2xl">{MESSAGES[locale].notFound.title}</h1>
              <p className="prose-text mt-2">{MESSAGES[locale].notFound.body}</p>
              <a href={`/${locale}`} className="link label mt-2 inline-flex min-h-11 items-center">
                {MESSAGES[locale].notFound.home}
              </a>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
