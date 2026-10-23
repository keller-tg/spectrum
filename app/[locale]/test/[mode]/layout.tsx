import { notFound } from "next/navigation";
import { TestProvider } from "@/components/test/TestProvider";
import type { Locale } from "@/data/locales";
import { modeFromSlug } from "@/i18n/params";
import { loadDerived } from "@/lib/catalog/derived";

/** Keeps the test in progress alive while the route moves from question to question. */
export default async function TestLayout({
  children,
  params,
}: LayoutProps<"/[locale]/test/[mode]">) {
  const { locale, mode: slug } = await params;
  const mode = modeFromSlug(locale as Locale, slug);
  if (!mode) notFound();
  return (
    <TestProvider mode={mode} bankVersion={loadDerived().questionBankVersion}>
      {children}
    </TestProvider>
  );
}
