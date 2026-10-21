import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./ButtonLink";

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
    <div className="mx-auto max-w-3xl px-4 pt-16 pb-8 sm:px-6 sm:pt-24">
      <h1 className="display rise text-display-lg text-ink">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{lead}</p>
      {children}
      <p className="mt-10 border-l-2 border-accent pl-4 text-sm text-ink-2">
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
