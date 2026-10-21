import type { Metadata } from "next";
import { LOCALES } from "@/data/locales";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import { ThemeScript } from "@/components/layout/ThemeScript";
import "./globals.css";

const MESSAGES = { en, de, fr } as const;

export const metadata: Metadata = {
  title: en.notFound.title,
  robots: { index: false },
};

/** Paths outside any locale (rare: the proxy redirects most). Offers all three languages. */
export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="grid min-h-dvh place-items-center px-6">
        <main className="max-w-md">
          {LOCALES.map((locale) => (
            <section key={locale} lang={locale} className="mb-8">
              <h1 className="text-2xl font-semibold text-ink">{MESSAGES[locale].notFound.title}</h1>
              <p className="mt-2 text-ink-2">{MESSAGES[locale].notFound.body}</p>
              <a
                href={`/${locale}`}
                className="link-ink mt-2 inline-block font-semibold text-accent"
              >
                {MESSAGES[locale].notFound.home}
              </a>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
