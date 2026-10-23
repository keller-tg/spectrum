"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { SegmentIndicator } from "@/components/ui/Segmented";
import { LOCALES } from "@/data/locales";
import { Link, usePathname } from "@/i18n/navigation";
import { translateParams } from "@/i18n/params";

type Href = React.ComponentProps<typeof Link>["href"];

/** EN / DE / FR as a segmented control of links; the current language is inverted. */
export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const index = Math.max(0, LOCALES.indexOf(current as (typeof LOCALES)[number]));

  return (
    <nav aria-label={t("label")}>
      <div
        className="seg"
        style={{ "--seg-i": index, "--seg-n": LOCALES.length } as React.CSSProperties}
      >
        {LOCALES.map((locale) => {
          // pathname and params always describe the current route, so the pair is valid.
          const href = {
            pathname,
            params: translateParams(params, current, locale),
          } as unknown as Href;
          return (
            <Link
              key={locale}
              href={href}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              aria-label={`${t(`short.${locale}`)} · ${t(`names.${locale}`)}`}
              className="seg-opt"
            >
              {t(`short.${locale}`)}
            </Link>
          );
        })}
        <SegmentIndicator labels={LOCALES.map((l) => t(`short.${l}`))} />
      </div>
    </nav>
  );
}
