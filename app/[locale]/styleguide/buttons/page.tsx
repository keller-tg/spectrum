import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThemeSwitch } from "@/components/layout/ThemeSwitch";
import { ControlsSwitch } from "@/components/styleguide/ControlsSwitch";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/styleguide/buttons">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "styleguide.matrix" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/styleguide/buttons",
    noindex: true,
  });
}

const VARIANTS: readonly ButtonVariant[] = ["primary", "secondary", "text"];
const SIZES: readonly ButtonSize[] = ["s", "m", "l"];
const STATES = [
  "rest",
  "hover",
  "focus",
  "active",
  "loading",
  "success",
  "error",
  "disabled",
] as const;

/** Every button variant × size × state, pinned so no pointer is needed (D-080). */
export default async function ButtonMatrixPage() {
  const t = await getTranslations("styleguide");

  const cell = (variant: ButtonVariant, size: ButtonSize, state: (typeof STATES)[number]) => {
    const common = {
      variant,
      size,
      arrow: variant !== "text",
      keycap: size === "l" && variant === "primary" ? "1" : undefined,
      tabIndex: state === "rest" ? undefined : -1,
    };
    const text = t(`buttons.${variant}Text`);
    switch (state) {
      case "hover":
        return (
          <Button {...common} state="hover">
            {text}
          </Button>
        );
      case "focus":
        return (
          <Button {...common} className="outline-2 outline-offset-3 outline-ink">
            {text}
          </Button>
        );
      case "active":
        return (
          <Button {...common} state="active">
            {text}
          </Button>
        );
      case "loading":
        return (
          <Button {...common} status="loading" loadingLabel={t("matrix.loadingLabel")}>
            {text}
          </Button>
        );
      case "success":
        return (
          <Button {...common} status="success" statusLabel={t("matrix.successLabel")}>
            {text}
          </Button>
        );
      case "error":
        return (
          <Button {...common} status="error" statusLabel={t("matrix.errorLabel")}>
            {text}
          </Button>
        );
      case "disabled":
        return (
          <Button {...common} disabled>
            {text}
          </Button>
        );
      default:
        return <Button {...common}>{text}</Button>;
    }
  };

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-16 sm:px-6 lg:px-10">
      <p className="annot font-bold">{t("matrix.kicker")}</p>
      <h1 className="display mt-4 text-display-lg">{t("matrix.title")}</h1>
      <p className="prose-text mt-5">{t("matrix.lead")}</p>
      <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-ink py-4">
        <ControlsSwitch
          labels={{
            label: t("controls.label"),
            sharp: t("controls.sharp"),
            pill: t("controls.pill"),
            offset: t("controls.offset"),
          }}
        />
        <ThemeSwitch />
      </div>
      {VARIANTS.map((variant) => (
        <section key={variant} aria-labelledby={`matrix-${variant}`} className="mt-14">
          <h2 id={`matrix-${variant}`} className="annot border-b-2 border-ink pb-2 font-bold">
            {t(`buttons.${variant}`)}
          </h2>
          <div
            role="region"
            aria-labelledby={`matrix-${variant}`}
            tabIndex={0}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse text-left [&_.btn-label]:whitespace-nowrap">
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="annot py-3 pr-4 font-bold">
                    {t("matrix.size")}
                  </th>
                  {STATES.map((s) => (
                    <th key={s} scope="col" className="annot px-4 py-3 font-bold whitespace-nowrap">
                      {t(`matrix.states.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((size) => (
                  <tr key={size} className="border-b border-ink">
                    <th scope="row" className="annot py-6 pr-4 font-bold whitespace-nowrap">
                      {t(`matrix.sizes.${size}`)}
                    </th>
                    {STATES.map((s) => (
                      <td key={s} className="px-4 py-6">
                        {cell(variant, size, s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
