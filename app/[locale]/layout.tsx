import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PreferenceSync } from "@/components/layout/PreferenceSync";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { WipeDirection } from "@/components/ui/WipeDirection";
import { routing } from "@/i18n/routing";
import { PALETTE } from "@/lib/design/tokens";
import { SITE_URL } from "@/lib/seo/site";
import { fontVariables } from "../fonts";
import "../globals.css";

/** Message namespaces that client components need; everything else stays on the server. */
const CLIENT_NAMESPACES = [
  "locale",
  "theme",
  "scale",
  "test",
  "results",
  "anchors",
  "home",
  "pilot",
  "compass",
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PALETTE.light.paper },
    { media: "(prefers-color-scheme: dark)", color: PALETTE.dark.paper },
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
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="label sr-only z-50 border-2 border-ink bg-ink px-4 py-3 text-paper no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("skipToContent")}
        </a>
        <PreferenceSync />
        <WipeDirection />
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
