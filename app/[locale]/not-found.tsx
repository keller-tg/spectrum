import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16">
      <p aria-hidden="true" className="font-mono text-numeral font-bold">
        404
      </p>
      <h1 className="display mt-6 text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-4">{t("body")}</p>
      <div className="mt-8">
        <ButtonLink href="/">{t("home")}</ButtonLink>
      </div>
    </div>
  );
}
