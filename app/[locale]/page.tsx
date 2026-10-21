import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxesOverview } from "@/components/home/AxesOverview";
import { HeroDial } from "@/components/home/HeroDial";
import { ModeCards } from "@/components/home/ModeCards";
import type { Locale } from "@/data/locales";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...pageMetadata({
      locale,
      title: t("homeTitle"),
      description: t("homeDescription"),
      hrefFor: () => "/",
    }),
    title: { absolute: t("homeTitle") },
  };
}

const HOW = ["answer", "see", "explore"] as const;
const PROMISES = ["local", "tracking", "honest", "neutral"] as const;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("home");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-20%] size-[46rem] rounded-full opacity-[0.22] blur-3xl sm:right-[-8%]"
          style={{
            background:
              "radial-gradient(closest-side at 35% 40%, var(--sp-right), transparent), radial-gradient(closest-side at 70% 35%, var(--sp-left), transparent), radial-gradient(closest-side at 55% 75%, var(--sp-third-position), transparent), radial-gradient(closest-side at 25% 75%, var(--sp-centre), transparent)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
          <div className="rise">
            <p className="kicker flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              {t("kicker")}
            </p>
            <h1 className="display mt-6 text-display-xl text-ink">
              {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
              {t("lead")}
            </p>
          </div>
          <div className="mx-auto w-full max-w-[15rem] sm:max-w-sm lg:max-w-none">
            <HeroDial />
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <ModeCards locale={locale} />
        </div>
      </section>

      {/* Axes */}
      <section aria-labelledby="axes-title" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="rule-top grid gap-6 pt-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="kicker">{t("axesKicker")}</p>
            <h2 id="axes-title" className="display mt-3 text-display-lg text-ink">
              {t("axesTitle")}
            </h2>
          </div>
          <p className="max-w-2xl self-end text-lg leading-relaxed text-ink-2">{t("axesLead")}</p>
        </div>
        <div className="mt-12">
          <AxesOverview locale={locale} />
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="rule-top pt-8">
          <p className="kicker">{t("howKicker")}</p>
          <h2 id="how-title" className="display mt-3 text-display-lg text-ink">
            {t("howTitle")}
          </h2>
        </div>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {HOW.map((key, i) => (
            <li key={key} className="relative pl-14">
              <span
                aria-hidden="true"
                className="display absolute top-[-0.35rem] left-0 text-5xl text-accent italic"
              >
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-ink">{t(`how.${key}.title`)}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{t(`how.${key}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Promises, on a forest-green band */}
      <section aria-labelledby="promises-title" className="mt-24 bg-forest text-on-forest">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="kicker text-on-forest/75">{t("promisesKicker")}</p>
          <h2 id="promises-title" className="display mt-3 text-display-lg">
            {t("promisesTitle")}
          </h2>
          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {PROMISES.map((key) => (
              <li key={key} className="border-t border-on-forest/25 pt-5">
                <h3 className="text-lg font-semibold">{t(`promises.${key}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-on-forest/85">
                  {t(`promises.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
