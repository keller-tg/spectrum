import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxisBar, formatScore } from "@/components/charts/AxisBar";
import { halftoneRadius, HatchPattern } from "@/components/charts/patterns";
import { Radar } from "@/components/charts/Radar";
import { RangeSlider } from "@/components/charts/RangeSlider";
import { SpectrumTag } from "@/components/charts/SpectrumMarker";
import { EntryGlyph } from "@/components/glyphs/EntryGlyph";
import { IconStrip } from "@/components/glyphs/IconStrip";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CompassDemo } from "@/components/styleguide/CompassDemo";
import { ToggleDemo } from "@/components/styleguide/ToggleDemo";
import { WebGraphDemo } from "@/components/styleguide/WebGraphDemo";
import { AnswerScaleDemo } from "@/components/test/AnswerScaleDemo";
import { buttonClass, type ButtonVariant } from "@/components/ui/Button";
import { Cell, CellGrid } from "@/components/ui/Cell";
import { Checkbox, TextField } from "@/components/ui/Field";
import { FigureImage } from "@/components/ui/FigureImage";
import { Legend, SpectrumLegend } from "@/components/ui/Legend";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Table } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { AXES, type AxisId } from "@/data/axes";
import { IMAGE_BY_ID } from "@/data/images";
import type { Locale } from "@/data/locales";
import { PALETTE } from "@/lib/design/tokens";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/styleguide">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "styleguide" });
  return pageMetadata({
    locale,
    title: t("title"),
    description: t("lead"),
    hrefFor: () => "/styleguide",
    noindex: true,
  });
}

type Mode = "light" | "dark";
const MODES: readonly Mode[] = ["light", "dark"];

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

const BAR_AXES: readonly { axis: AxisId; value: number; interval: readonly [number, number] }[] = [
  { axis: "distribution", value: -42, interval: [-58, -26] },
  { axis: "liberty", value: 8, interval: [-12, 28] },
  { axis: "borders", value: 71, interval: [55, 87] },
];

const GLYPH_IDS = [
  "social-democracy",
  "fascism",
  "libertarianism",
  "green-politics",
  "juche",
  "kemalism",
];

/** Renders its content twice: in a light frame and in a dark frame. */
function ModePair({
  labels,
  children,
}: {
  labels: Record<Mode, string>;
  children: (mode: Mode) => React.ReactNode;
}) {
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {MODES.map((mode) => (
        <div
          key={mode}
          data-theme={mode}
          className="min-w-0 border-2 border-ink bg-paper p-3 text-ink sm:p-4"
        >
          <p className="label mb-5 border-b-2 border-ink pb-2">{labels[mode]}</p>
          {children(mode)}
        </div>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-ink py-3 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-center">
      <p className="label">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default async function StyleguidePage({ params }: PageProps<"/[locale]/styleguide">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("styleguide");
  const tn = await getTranslations("nav");
  const modeLabels = { light: t("light"), dark: t("dark") };
  const ideologies = loadIdeologies();
  const mill = IMAGE_BY_ID.get("john-stuart-mill");

  const states = (variant: ButtonVariant, text: string, key: string) => {
    return (
      <Row label={t(`buttons.${variant}`)} key={key}>
        <button type="button" className={buttonClass(variant)}>
          {text}
        </button>
        <button type="button" className={buttonClass(variant, true)} tabIndex={-1}>
          {text}
        </button>
        <button
          type="button"
          className={`${buttonClass(variant)} outline-3 outline-offset-3 outline-ink`}
          tabIndex={-1}
        >
          {text}
        </button>
        <button type="button" className={buttonClass(variant)} disabled>
          {text}
        </button>
      </Row>
    );
  };

  const tableRows = ideologies
    .slice(0, 6)
    .map((e) => [
      e.names[locale] ?? e.names.en,
      <SpectrumTag key="s" id={e.spectrum} locale={locale} withName={false} />,
      formatScore(e.coords.distribution),
      formatScore(e.coords.liberty),
    ]);

  const line = (dash?: string) => (
    <svg width="56" height="10" viewBox="0 0 56 10">
      <line
        x1="0"
        y1="5"
        x2="56"
        y2="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={dash}
      />
    </svg>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:pt-16">
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-5">{t("lead")}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4 border-2 border-ink p-3">
        <p className="label">{t("modeSwitch")}</p>
        <ThemeToggle />
      </div>

      {/* 01 Palette and type */}
      <section aria-labelledby="sg-type" className="mt-14">
        <SectionHeader number={1} id="sg-type" title={t("sections.type")}>
          {t("palette.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <>
              <div className="grid grid-cols-2 border-t-2 border-l-2 border-ink">
                {(["ink", "paper"] as const).map((token) => (
                  <div key={token} className="border-r-2 border-b-2 border-ink">
                    <div
                      className={`h-16 border-b-2 border-ink ${token === "ink" ? "bg-ink" : "bg-paper"}`}
                    />
                    <p className="label px-3 py-2">
                      --{token} · {PALETTE[mode][token]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="label mt-6">{t("type.display")}</p>
              <p className="display mt-2 text-display-lg">{t("type.sampleHeadline")}</p>
              <p className="label mt-6">{t("type.prose")}</p>
              <p className="prose-text mt-2">{t("type.sampleBody")}</p>
              <p className="label mt-6">{t("type.mono")}</p>
              <p className="mt-2">0123456789 · −100 · +100 · 72 / 144</p>
              <p className="label mt-6">{t("type.numeral")}</p>
              <p className="mt-2 flex items-baseline gap-3">
                <span className="text-numeral font-bold">87</span>
                <span className="text-4xl font-bold">%</span>
              </p>
            </>
          )}
        </ModePair>
      </section>

      {/* 02 Buttons */}
      <section aria-labelledby="sg-buttons" className="mt-14">
        <SectionHeader number={2} id="sg-buttons" title={t("sections.buttons")}>
          {t("buttons.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="label">{t("buttons.order")}</p>
              {states("primary", t("buttons.primaryText"), "p")}
              {states("secondary", t("buttons.secondaryText"), "s")}
              {states("text", t("buttons.textText"), "t")}
              <Row label={t("buttons.link")}>
                <p className="prose-text">
                  {t.rich("buttons.linkSentence", {
                    link: (chunks) => (
                      <a href="#sg-buttons" className="link">
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
              </Row>
            </>
          )}
        </ModePair>
      </section>

      {/* 03 Inputs */}
      <section aria-labelledby="sg-inputs" className="mt-14">
        <SectionHeader number={3} id="sg-inputs" title={t("sections.inputs")}>
          {t("inputs.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                id={`${mode}-search`}
                label={t("inputs.search")}
                hint={t("inputs.searchHint")}
                placeholder={t("inputs.placeholder")}
              />
              <TextField
                id={`${mode}-search-error`}
                label={t("inputs.search")}
                defaultValue="x"
                error={t("inputs.error")}
              />
              <TextField id={`${mode}-search-off`} label={t("inputs.disabled")} disabled />
              <div>
                <Checkbox id={`${mode}-consent`}>{t("inputs.consent")}</Checkbox>
                <Checkbox id={`${mode}-consent-on`} defaultChecked>
                  {t("inputs.checked")}
                </Checkbox>
                <Checkbox id={`${mode}-consent-off`} disabled>
                  {t("inputs.disabled")}
                </Checkbox>
              </div>
            </div>
          )}
        </ModePair>
      </section>

      {/* 04 Answer options */}
      <section aria-labelledby="sg-answer" className="mt-14">
        <SectionHeader number={4} id="sg-answer" title={t("sections.answer")}>
          {t("answer.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="label mb-2">{t("answer.selected")}</p>
              <AnswerScaleDemo initial={1} />
              <p className="label mt-6 mb-2">{t("answer.skipped")}</p>
              <AnswerScaleDemo initialSkipped />
            </>
          )}
        </ModePair>
      </section>

      {/* 05 Cells and section headers */}
      <section aria-labelledby="sg-cells" className="mt-14">
        <SectionHeader number={5} id="sg-cells" title={t("sections.cells")}>
          {t("cells.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <SectionHeader number={7} title={t("cells.sampleTitle")} as="h3" />
              <CellGrid className="mt-4">
                {[1, 2, 3].map((n) => (
                  <Cell key={n} span={4} number={n} title={t("cells.cellTitle")}>
                    <p className="prose-text mt-2">{t("cells.cellBody")}</p>
                  </Cell>
                ))}
              </CellGrid>
            </>
          )}
        </ModePair>
      </section>

      {/* 06 Ruled table */}
      <section aria-labelledby="sg-table" className="mt-14">
        <SectionHeader number={6} id="sg-table" title={t("sections.table")}>
          {t("table.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="space-y-6">
              <Table
                id={`${mode}-table-ideologies`}
                caption={t("table.caption")}
                columns={[
                  { key: "name", header: t("table.name") },
                  { key: "spectrum", header: t("table.spectrum") },
                  { key: "x", header: AXES.distribution.code[locale], numeric: true },
                  { key: "y", header: AXES.liberty.code[locale], numeric: true },
                ]}
                rows={tableRows}
              />
              <Table
                id={`${mode}-table-iso`}
                caption={t("table.isoCaption")}
                columns={[
                  { key: "code", header: t("table.iso") },
                  { key: "name", header: t("table.country") },
                ]}
                rows={[
                  ["CH", t("table.ch")],
                  ["DE", t("table.de")],
                  ["FR", t("table.fr")],
                ]}
              />
            </div>
          )}
        </ModePair>
      </section>

      {/* 07 Navigation and tabs */}
      <section aria-labelledby="sg-nav" className="mt-14">
        <SectionHeader number={7} id="sg-nav" title={t("sections.nav")}>
          {t("nav.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="label mb-2">{t("nav.header")}</p>
              <ul aria-hidden="true" className="label flex flex-wrap border-2 border-ink">
                {(["test", "compass", "ideologies", "dashboard"] as const).map((key, i) => (
                  <li key={key} className="flex border-ink not-first:border-l-2">
                    <span
                      aria-current={i === 1 ? "page" : undefined}
                      className="bracketed flex min-h-11 items-center px-4 aria-[current=page]:bg-ink aria-[current=page]:text-paper"
                    >
                      {tn(key)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="label mt-6 mb-2">{t("nav.tabs")}</p>
              <Tabs
                label={t("nav.tabsLabel")}
                tabs={[
                  {
                    id: "axes",
                    label: t("nav.tabAxes"),
                    content: <p className="prose-text">{t("nav.panelAxes")}</p>,
                  },
                  {
                    id: "radar",
                    label: t("nav.tabRadar"),
                    content: <p className="prose-text">{t("nav.panelRadar")}</p>,
                  },
                  {
                    id: "map",
                    label: t("nav.tabMap"),
                    content: <p className="prose-text">{t("nav.panelMap")}</p>,
                  },
                ]}
              />
            </>
          )}
        </ModePair>
      </section>

      {/* 08 Toggles */}
      <section aria-labelledby="sg-toggle" className="mt-14">
        <SectionHeader number={8} id="sg-toggle" title={t("sections.toggle")}>
          {t("toggle.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <div className="flex flex-col items-start gap-3">
              <ToggleDemo
                label={t("toggle.advance")}
                onText={t("toggle.on")}
                offText={t("toggle.off")}
                initial
              />
              <ToggleDemo
                label={t("toggle.labels")}
                onText={t("toggle.on")}
                offText={t("toggle.off")}
              />
              <ToggleDemo
                label={t("toggle.disabled")}
                onText={t("toggle.on")}
                offText={t("toggle.off")}
                disabled
              />
            </div>
          )}
        </ModePair>
      </section>

      {/* 09 Sliders and axis bars */}
      <section aria-labelledby="sg-sliders" className="mt-14">
        <SectionHeader number={9} id="sg-sliders" title={t("sections.sliders")}>
          {t("sliders.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <div className="space-y-8">
              {BAR_AXES.map(({ axis, value, interval }) => (
                <AxisBar
                  key={axis}
                  axis={axis}
                  value={value}
                  interval={interval}
                  locale={locale}
                  description={t("sliders.bar", {
                    axis: AXES[axis].name[locale],
                    score: formatScore(value),
                    pole: (value < 0 ? AXES[axis].neg : AXES[axis].pos).label[locale],
                    low: formatScore(interval[0]),
                    high: formatScore(interval[1]),
                  })}
                />
              ))}
              <RangeSlider
                label={`${AXES.ecology.code[locale]} · ${AXES.ecology.name[locale]}`}
                negLabel={AXES.ecology.neg.short[locale]}
                posLabel={AXES.ecology.pos.short[locale]}
                initial={30}
              />
              <RangeSlider
                label={t("sliders.disabled")}
                negLabel={AXES.trade.neg.short[locale]}
                posLabel={AXES.trade.pos.short[locale]}
                disabled
              />
            </div>
          )}
        </ModePair>
      </section>

      {/* 10 Tooltip and modal */}
      <section aria-labelledby="sg-overlays" className="mt-14">
        <SectionHeader number={10} id="sg-overlays" title={t("sections.overlays")}>
          {t("overlays.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <div className="flex flex-wrap items-center gap-6">
              <p className="flex items-center gap-1">
                <span>{AXES.participation.name[locale]}</span>
                <Tooltip label={t("overlays.tooltipLabel")}>
                  {AXES.participation.measures[locale]}
                </Tooltip>
              </p>
              <Modal
                triggerLabel={t("overlays.open")}
                title={t("overlays.modalTitle")}
                closeLabel={t("overlays.close")}
              >
                {t("overlays.modalBody")}
              </Modal>
            </div>
          )}
        </ModePair>
      </section>

      {/* 11 Legend */}
      <section aria-labelledby="sg-legend" className="mt-14">
        <SectionHeader number={11} id="sg-legend" title={t("sections.legend")}>
          {t("legend.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="space-y-6">
              <SpectrumLegend locale={locale} title={t("legend.spectra")} />
              <Legend
                title={t("legend.charts")}
                items={[
                  { key: "solid", swatch: line(), label: t("legend.solid") },
                  { key: "dashed", swatch: line("7 4"), label: t("legend.dashed") },
                  { key: "dotted", swatch: line("1 5"), label: t("legend.dotted") },
                  {
                    key: "hatch",
                    swatch: (
                      <svg width="40" height="24" viewBox="0 0 40 24">
                        <defs>
                          <HatchPattern id={`${mode}-legend-hatch`} />
                        </defs>
                        <rect
                          x="1"
                          y="1"
                          width="38"
                          height="22"
                          fill={`url(#${mode}-legend-hatch)`}
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                    label: t("legend.hatch"),
                  },
                  {
                    key: "empty",
                    swatch: (
                      <svg width="40" height="24" viewBox="0 0 40 24">
                        <rect
                          x="1"
                          y="1"
                          width="38"
                          height="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="7 4"
                        />
                      </svg>
                    ),
                    label: t("legend.empty"),
                  },
                  {
                    key: "halftone",
                    swatch: (
                      <svg width="64" height="16" viewBox="0 0 64 16" fill="currentColor">
                        {[0.1, 0.3, 0.55, 0.8, 1].map((d, i) => (
                          <circle key={d} cx={6 + i * 13} cy="8" r={halftoneRadius(d, 12)} />
                        ))}
                      </svg>
                    ),
                    label: t("legend.halftone"),
                  },
                  {
                    key: "you",
                    swatch: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="20" cy="20" r="11" />
                        <path d="M2 20h14M24 20h14M20 2v14M20 24v14" />
                      </svg>
                    ),
                    label: t("legend.you"),
                  },
                  {
                    key: "ghost",
                    swatch: (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="20" cy="20" r="13" strokeDasharray="5 4" />
                        <rect x="16" y="16" width="8" height="8" strokeWidth="1.5" />
                      </svg>
                    ),
                    label: t("legend.ghost"),
                  },
                  {
                    key: "selected",
                    swatch: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect width="24" height="24" fill="currentColor" />
                        <path
                          d="M12 5 19 12 12 19 5 12z"
                          fill="var(--ink)"
                          stroke="var(--paper)"
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                    label: t("legend.selected"),
                  },
                ]}
              />
            </div>
          )}
        </ModePair>
      </section>

      {/* 12 Twelve-axis strip */}
      <section aria-labelledby="sg-strip" className="mt-14">
        <SectionHeader number={12} id="sg-strip" title={t("sections.strip")}>
          {t("strip.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <dl className="space-y-5">
              <div>
                <dt className="label mb-2">{t("strip.exampleA")}</dt>
                <dd>
                  <IconStrip coords={EXAMPLE_A} locale={locale} />
                </dd>
              </div>
              <div>
                <dt className="label mb-2">{t("strip.exampleB")}</dt>
                <dd>
                  <IconStrip coords={EXAMPLE_B} locale={locale} />
                </dd>
              </div>
              <div>
                <dt className="label mb-2">{t("strip.howTitle")}</dt>
                <dd className="prose-text">{t("strip.how")}</dd>
              </div>
            </dl>
          )}
        </ModePair>
      </section>

      {/* 13 Radar */}
      <section aria-labelledby="sg-radar" className="mt-14">
        <SectionHeader number={13} id="sg-radar" title={t("sections.radar")}>
          {t("radar.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <Radar
              id={`${mode}-radar`}
              series={[
                { label: t("radar.you"), values: EXAMPLE_A },
                { label: t("radar.friend"), values: EXAMPLE_B },
              ]}
              locale={locale}
              title={t("radar.title")}
              dataLabel={t("dataTable")}
              axisHeader={t("radar.axis")}
            />
          )}
        </ModePair>
      </section>

      {/* 14 Compass encodings */}
      <section aria-labelledby="sg-compass" className="mt-14">
        <SectionHeader number={14} id="sg-compass" title={t("sections.compass")}>
          {t("compass.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <CompassDemo
              locale={locale}
              idPrefix={mode}
              labels={{
                title: t("compass.title"),
                summary: t("compass.summary"),
                you: t("compass.you"),
                ghost: t("compass.ghost"),
                data: t("dataTable"),
                point: t("compass.point"),
              }}
            />
          )}
        </ModePair>
      </section>

      {/* 15 Web view */}
      <section aria-labelledby="sg-web" className="mt-14">
        <SectionHeader number={15} id="sg-web" title={t("sections.web")}>
          {t("web.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <WebGraphDemo
              locale={locale}
              idPrefix={mode}
              labels={{
                title: t("web.title"),
                data: t("dataTable"),
                node: t("web.node"),
                spectrum: t("table.spectrum"),
                neighbours: t("web.neighbours"),
              }}
            />
          )}
        </ModePair>
      </section>

      {/* 16 Images and glyphs */}
      <section aria-labelledby="sg-images" className="mt-14">
        <SectionHeader number={16} id="sg-images" title={t("sections.images")}>
          {t("images.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <div className="grid gap-6 md:grid-cols-2">
              {mill ? (
                <FigureImage
                  image={mill}
                  locale={locale}
                  sourceLabel={t("images.source")}
                  className="max-w-80"
                />
              ) : null}
              <div>
                <p className="label">{t("images.glyphs")}</p>
                <ul className="mt-3 flex flex-wrap gap-4">
                  {GLYPH_IDS.map((id) => (
                    <li key={id}>
                      <EntryGlyph id={id} size={48} />
                    </li>
                  ))}
                </ul>
                <p className="prose-text mt-3">{t("images.glyphsNote")}</p>
                <p className="label mt-6">{t("images.flags")}</p>
                <p className="prose-text mt-2">{t("images.flagsNote")}</p>
              </div>
            </div>
          )}
        </ModePair>
      </section>
    </div>
  );
}
