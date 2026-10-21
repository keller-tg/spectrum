import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-20 pb-10 sm:px-6 sm:pt-28">
      <p className="display text-7xl text-accent italic" aria-hidden="true">
        404
      </p>
      <h1 className="display mt-4 text-display-lg text-ink">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-2">{t("body")}</p>
      <div className="mt-8">
        <ButtonLink href="/">{t("home")}</ButtonLink>
      </div>
    </div>
  );
}
