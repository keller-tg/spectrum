import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./Button";

/** Placeholder layout for routes whose feature arrives in a later phase. */
export async function PageStub({
  title,
  lead,
  phase,
  children,
}: {
  title: string;
  lead: string;
  phase: number;
  children?: React.ReactNode;
}) {
  const t = await getTranslations("stub");
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16">
      <h1 className="display text-display-lg">{title}</h1>
      <p className="prose-text mt-5">{lead}</p>
      {children}
      <p className="label mt-10 inline-block border-2 border-dashed border-ink px-3 py-2">
        {t("phaseNote", { phase })}
      </p>
      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          {t("backHome")}
        </ButtonLink>
      </div>
    </div>
  );
}
