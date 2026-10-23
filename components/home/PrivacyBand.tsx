import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

/** Inverted full-bleed band: the privacy promise in display type. */
export async function PrivacyBand() {
  const t = await getTranslations("home.privacy");
  return (
    <section aria-labelledby="home-privacy" data-invert="" className="section-pad">
      <div className="mx-auto grid max-w-[96rem] grid-cols-12 gap-x-6 gap-y-8 px-4 sm:px-6 lg:px-10">
        <p className="annot col-span-12 font-bold">{t("kicker")}</p>
        <h2 id="home-privacy" className="display col-span-12 text-display-xl lg:col-span-10">
          {t("statement")}
        </h2>
        <p className="prose-text col-span-12 lg:col-span-6">{t("body")}</p>
        <div className="col-span-12">
          <ButtonLink href="/privacy" variant="secondary" size="l" arrow>
            {t("link")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
