import type { Locale } from "@/data/locales";
import { AxesTable } from "./AxesTable";
import { HomeHero } from "./HomeHero";
import { HowItWorks } from "./HowItWorks";
import { IdeologyIndex } from "./IdeologyIndex";
import { PrivacyBand } from "./PrivacyBand";
import { StatStrip } from "./StatStrip";

/**
 * The full home page (header and footer come from the layout): hero, stat
 * strip, 01 how it works, 02 the twelve axes (inverted band), 03 index of
 * ideologies, the privacy band. Only the hero differs between the variants.
 */
export function HomeComposition({
  locale,
  variant,
}: {
  locale: Locale;
  variant: "specimen" | "typographic";
}) {
  return (
    <>
      <HomeHero locale={locale} variant={variant} />
      <StatStrip />
      <HowItWorks />
      <AxesTable locale={locale} />
      <IdeologyIndex locale={locale} />
      <PrivacyBand />
    </>
  );
}
