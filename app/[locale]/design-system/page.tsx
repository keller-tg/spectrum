import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxisGlyph } from "@/components/glyphs/AxisGlyph";
import { IconStrip } from "@/components/glyphs/IconStrip";
import { AnswerScaleDemo } from "@/components/test/AnswerScaleDemo";
import { buttonClass } from "@/components/ui/ButtonLink";
import { SpectrumChip } from "@/components/ui/SpectrumChip";
import { AXIS_LIST, type AxisId } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { SPECTRUM_IDS } from "@/data/spectrums";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/design-system">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.designSystem" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/design-system",
    noindex: true,
  });
}

const TOKENS = [
  "paper",
  "paper-raised",
  "paper-sunk",
  "ink",
  "ink-2",
  "ink-3",
  "forest",
  "accent",
] as const;

const EXAMPLE_A: Record<AxisId, number> = {
  distribution: -70,
  ownership: -55,
  trade: -20,
  liberty: -60,
  centralization: 45,
  participation: -65,
  tradition: -75,
  religion: -80,
  ecology: 70,
  nation: 50,
  intervention: 55,
  borders: -60,
};
const EXAMPLE_B: Record<AxisId, number> = {
  distribution: 65,
  ownership: 70,
  trade: 80,
  liberty: 20,
  centralization: 10,
  participation: 35,
  tradition: 55,
  religion: 30,
  ecology: -45,
  nation: -40,
  intervention: -30,
  borders: 35,
};

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rule-top mt-14 grid gap-6 pt-6 lg:grid-cols-[14rem_1fr]">
      <div>
        <h2 className="display text-2xl text-ink">{title}</h2>
        {note ? <p className="mt-2 text-sm leading-relaxed text-ink-2">{note}</p> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default async function DesignSystemPage({ params }: PageProps<"/[locale]/design-system">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("ds");
  const tp = await getTranslations("pages.designSystem");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
      <p className="kicker">{t("kicker")}</p>
      <h1 className="display mt-3 text-display-lg text-ink">{tp("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">{tp("lead")}</p>

      <Section title={t("type")}>
        <p className="kicker">{t("typeDisplay")}</p>
        <p className="display mt-2 text-display-xl text-ink">{t("sampleHeadline")}</p>
        <p className="display mt-4 text-display-md text-ink-2 italic">{t("sampleHeadline")}</p>
        <p className="kicker mt-8">{t("typeText")}</p>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink">{t("sampleBody")}</p>
        <p className="tabular mt-3 text-sm text-ink-2">0123456789 · −100 · +100 · 75%</p>
      </Section>

      <Section title={t("colour")} note={t("colourNote")}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOKENS.map((token) => (
            <li key={token} className="overflow-hidden rounded-lg border border-rule">
              <div className="h-16" style={{ backgroundColor: `var(--${token})` }} />
              <p className="px-3 py-2 font-mono text-xs text-ink-2">--{token}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("spectra")} note={t("spectraNote")}>
        <ul className="flex flex-wrap gap-2">
          {SPECTRUM_IDS.map((id) => (
            <li key={id}>
              <SpectrumChip id={id} locale={locale} />
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="mt-5 flex h-3 overflow-hidden rounded-full">
          {SPECTRUM_IDS.map((id) => (
            <span key={id} className="flex-1" style={{ backgroundColor: `var(--sp-${id})` }} />
          ))}
        </div>
      </Section>

      <Section title={t("glyphs")} note={t("glyphsNote")}>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {AXIS_LIST.map((axis) => (
            <li key={axis.id} className="flex items-center gap-3 text-sm">
              <AxisGlyph axis={axis.id} side="neg" className="text-ink" />
              <span className="w-28 text-ink-2">{axis.neg.short[locale]}</span>
              <AxisGlyph axis={axis.id} side="pos" className="text-ink" />
              <span className="text-ink-2">{axis.pos.short[locale]}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("strip")} note={t("stripNote")}>
        <dl className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <dt className="w-40 text-sm text-ink-2">{t("stripExampleA")}</dt>
            <dd className="text-ink">
              <IconStrip coords={EXAMPLE_A} locale={locale} />
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <dt className="w-40 text-sm text-ink-2">{t("stripExampleB")}</dt>
            <dd className="text-ink">
              <IconStrip coords={EXAMPLE_B} locale={locale} />
            </dd>
          </div>
        </dl>
      </Section>

      <Section title={t("controls")} note={t("scaleNote")}>
        <AnswerScaleDemo />
        <h3 className="kicker mt-10">{t("buttons")}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={buttonClass("primary")}>
            {t("primary")}
          </button>
          <button type="button" className={buttonClass("secondary")}>
            {t("secondary")}
          </button>
          <button type="button" className={buttonClass("quiet")}>
            {t("quiet")}
          </button>
        </div>
      </Section>
    </div>
  );
}
