import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Schibsted_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";
import "../globals.css";

// Only the latin subset is preloaded (it covers en/de/fr incl. ä ö ü ß é è ç);
// latin-ext still loads on demand via unicode-range for names like "Erdoğan".
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

// The italic only sets a word or two of emphasis, so it is not preloaded.
const displayItalic = Bodoni_Moda({
  subsets: ["latin"],
  style: "italic",
  axes: ["opsz"],
  variable: "--font-bodoni-italic",
  display: "swap",
  preload: false,
});

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

/** Message namespaces that client components need; everything else stays on the server. */
const CLIENT_NAMESPACES = ["locale", "theme", "scale"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ede0" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1c18" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : "en",
    namespace: "meta",
  });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("homeTitle"), template: `%s · ${t("siteName")}` },
    description: t("homeDescription"),
    applicationName: t("siteName"),
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));
  const t = await getTranslations("a11y");

  return (
    <html
      lang={locale}
      className={`${display.variable} ${displayItalic.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          <main id="main" className="relative z-10 flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
