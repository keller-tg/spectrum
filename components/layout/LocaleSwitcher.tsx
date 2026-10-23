"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { LOCALES } from "@/data/locales";
import { Link, usePathname } from "@/i18n/navigation";
import { translateParams } from "@/i18n/params";

type Href = React.ComponentProps<typeof Link>["href"];

/** EN | DE | FR as ruled cells; the current language is the inverted one. */
export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <nav aria-label={t("label")} className="flex">
      <ul className="label flex">
        {LOCALES.map((locale) => {
          // pathname and params always describe the current route, so the pair is valid.
          const href = {
            pathname,
            params: translateParams(params, current, locale),
          } as unknown as Href;
          return (
            <li key={locale} className="flex border-ink not-first:border-l-2">
              <Link
                href={href}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === current ? "true" : undefined}
                aria-label={`${t(`short.${locale}`)} · ${t(`names.${locale}`)}`}
                className="flex min-h-11 min-w-11 items-center justify-center px-2 no-underline hover:bg-ink hover:text-paper aria-[current=true]:bg-ink aria-[current=true]:text-paper"
              >
                {t(`short.${locale}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
