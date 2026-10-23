import { getTranslations } from "next-intl/server";
import type { Locale } from "@/data/locales";
import { HeroField } from "./HeroField";
import { ModeRows } from "./ModeRows";

/**
 * Two hero compositions for review (D-081). Both keep the order headline,
 * field, modes on phones.
 * - "specimen": the field dominates (7 of 12 columns, two rows tall).
 * - "typographic": a huge headline across the grid, the field a smaller figure.
 */
export async function HomeHero({
  locale,
  variant,
}: {
  locale: Locale;
  variant: "specimen" | "typographic";
}) {
  const t = await getTranslations("home");
  const field = <HeroField locale={locale} id={`field-${variant}`} />;

  if (variant === "specimen")
    return (
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-[96rem] grid-cols-12 gap-x-6 gap-y-10 px-4 pt-8 pb-14 sm:px-6 lg:gap-x-12 lg:px-10 lg:pt-14 lg:pb-20">
          <div className="col-span-12 lg:col-span-5">
            <p className="annot font-bold">{t("kicker")}</p>
            <h1 className="display mt-6 text-display-specimen">{t("sentence")}</h1>
            <p className="prose-text mt-6">{t("subline")}</p>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:row-span-2">{field}</div>
          <div className="col-span-12 lg:col-span-5 lg:self-end">
            <ModeRows locale={locale} />
          </div>
        </div>
      </section>
    );

  return (
    <section className="border-b-2 border-ink">
      <div className="mx-auto grid max-w-[96rem] grid-cols-12 gap-x-6 gap-y-10 px-4 pt-8 pb-14 sm:px-6 lg:gap-x-12 lg:px-10 lg:pt-14 lg:pb-20">
        <div className="col-span-12">
          <p className="annot font-bold">{t("kicker")}</p>
          <h1 className="display mt-6 text-display-hero">{t("sentence")}</h1>
          <p className="prose-text mt-8 lg:max-w-[48ch]">{t("subline")}</p>
        </div>
        <div className="order-2 col-span-12 sm:col-span-8 sm:col-start-3 lg:order-3 lg:col-span-5 lg:col-start-auto">
          {field}
        </div>
        <div className="order-3 col-span-12 lg:order-2 lg:col-span-7">
          <ModeRows locale={locale} />
        </div>
      </div>
    </section>
  );
}
