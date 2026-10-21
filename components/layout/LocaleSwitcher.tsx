"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { LOCALES } from "@/data/locales";
import { Link, usePathname } from "@/i18n/navigation";
import { translateParams } from "@/i18n/params";

type Href = React.ComponentProps<typeof Link>["href"];

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center rounded-full border border-rule p-0.5 text-xs font-semibold tracking-wide">
        {LOCALES.map((locale) => {
          const active = locale === current;
          // pathname and params always describe the current route, so the pair is valid.
          const href = {
            pathname,
            params: translateParams(params, current, locale),
          } as unknown as Href;
          return (
            <li key={locale}>
              <Link
                href={href}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                aria-label={`${t(`short.${locale}`)} · ${t(`names.${locale}`)}`}
                className={
                  active
                    ? "block rounded-full bg-ink px-2.5 py-1 text-paper"
                    : "block rounded-full px-2.5 py-1 text-ink-2 transition-colors hover:text-ink"
                }
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
