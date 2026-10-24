import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AxisBar, formatScore } from "@/components/charts/AxisBar";
import { halftoneRadius, HatchPattern } from "@/components/charts/patterns";
import { Radar } from "@/components/charts/Radar";
import { Sparkline } from "@/components/charts/Sparkline";
import { RangeSlider } from "@/components/charts/RangeSlider";
import { SpectrumTag } from "@/components/charts/SpectrumMarker";
import { EntryGlyph } from "@/components/glyphs/EntryGlyph";
import { IconStrip } from "@/components/glyphs/IconStrip";
import { ModeRows } from "@/components/home/ModeRows";
import { ThemeSwitch } from "@/components/layout/ThemeSwitch";
import { ButtonDemo } from "@/components/styleguide/ButtonDemo";
import { CompassDemo } from "@/components/styleguide/CompassDemo";
import { ControlsSwitch } from "@/components/styleguide/ControlsSwitch";
import { SegmentedDemo } from "@/components/styleguide/SegmentedDemo";
import { SelectDemo } from "@/components/styleguide/SelectDemo";
import { ToggleDemo } from "@/components/styleguide/ToggleDemo";
import { WebGraphDemo } from "@/components/styleguide/WebGraphDemo";
import { AnswerRowsDemo } from "@/components/test/AnswerRows";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Cell, CellGrid } from "@/components/ui/Cell";
import { Checkbox, TextField } from "@/components/ui/Field";
import { FigureImage } from "@/components/ui/FigureImage";
import { Legend, SpectrumLegend } from "@/components/ui/Legend";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Table } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { ExternalLink, TextLink } from "@/components/ui/TextLink";
import { Tooltip } from "@/components/ui/Tooltip";
import { AXES, type AxisId } from "@/data/axes";
import { IMAGE_BY_ID } from "@/data/images";
import type { Locale } from "@/data/locales";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { PALETTE } from "@/lib/design/tokens";
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

const MOTION = [
  ["--ease-out", "cubic-bezier(0.22, 1, 0.36, 1)"],
  ["--ease-spring", "linear(…), ≤ 3% overshoot"],
  ["--dur-fast", "120ms"],
  ["--dur", "220ms"],
  ["--dur-slow", "360ms"],
  ["--radius-control", "0 · 999px"],
] as const;

const GLYPH_IDS = [
  "social-democracy",
  "fascism",
  "libertarianism",
  "green-politics",
  "juche",
  "kemalism",
];
const SECTIONS = [
  "type",
  "buttons",
  "links",
  "inputs",
  "segmented",
  "modes",
  "answers",
  "nav",
  "sliders",
  "overlays",
  "cells",
  "legend",
  "strip",
  "radar",
  "sparkline",
  "compass",
  "web",
  "images",
] as const;
type SectionKey = (typeof SECTIONS)[number];

/** Renders its content twice: in a light frame and in a dark frame. */
function ModePair({
  labels,
  children,
}: {
  labels: Record<Mode, string>;
  children: (mode: Mode) => React.ReactNode;
}) {
  return (
    <div className="mt-8 grid gap-4 xl:grid-cols-2">
      {MODES.map((mode) => (
        <div
          key={mode}
          data-theme={mode}
          className="min-w-0 border border-ink bg-paper p-4 text-ink sm:p-6"
        >
          <p className="annot mb-6 border-b border-ink pb-2 font-bold">{labels[mode]}</p>
          {children(mode)}
        </div>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-ink py-4 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:items-center">
      <p className="annot font-bold">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default async function StyleguidePage({ params }: PageProps<"/[locale]/styleguide">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations("styleguide");
  const tn = await getTranslations("nav");
  const th = await getTranslations("home");
  const modeLabels = { light: t("light"), dark: t("dark") };
  const ideologies = loadIdeologies();
  const mill = IMAGE_BY_ID.get("john-stuart-mill");
  const n = (key: SectionKey) => SECTIONS.indexOf(key) + 1;

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

  const buttonRow = (variant: ButtonVariant) => (
    <Row key={variant} label={t(`buttons.${variant}`)}>
      <Button variant={variant} arrow={variant !== "text"}>
        {t(`buttons.${variant}Text`)}
      </Button>
      <Button variant={variant} arrow={variant !== "text"} state="hover" tabIndex={-1}>
        {t(`buttons.${variant}Text`)}
      </Button>
      <Button variant={variant} arrow={variant !== "text"} disabled>
        {t(`buttons.${variant}Text`)}
      </Button>
    </Row>
  );

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-16 sm:px-6 lg:px-10">
      <p className="annot font-bold">{t("kicker")}</p>
      <h1 className="display mt-4 text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-5">{t("lead")}</p>
      <div className="mt-8 grid gap-4 border-y border-ink py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {(["buttons", "screens", "home-a", "home-b"] as const).map((page) => (
            <li key={page}>
              <TextLink href={`/styleguide/${page}`} className="inline-flex min-h-11 items-center">
                {t(`pages.${page}`)}
              </TextLink>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
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
      </div>
      <p className="prose-text mt-4">{t("controls.note")}</p>

      <section aria-labelledby="sg-type" className="mt-16">
        <SectionHeader number={n("type")} id="sg-type" title={t("sections.type")}>
          {t("palette.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <>
              <div className="grid grid-cols-2 border-t border-l border-ink">
                {(["ink", "paper"] as const).map((token) => (
                  <div key={token} className="border-r border-b border-ink">
                    <div
                      className={`h-16 border-b border-ink ${token === "ink" ? "bg-ink" : "bg-paper"}`}
                    />
                    <p className="annot px-3 py-2 font-bold">
                      --{token} · {PALETTE[mode][token]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="annot mt-8 font-bold">{t("type.display")}</p>
              <p className="display mt-2 text-display-lg">{t("type.sampleHeadline")}</p>
              <p className="annot mt-8 font-bold">{t("type.prose")}</p>
              <p className="prose-text mt-2">{t("type.sampleBody")}</p>
              <p className="annot mt-8 font-bold">{t("type.mono")}</p>
              <p className="mt-2">0123456789 · −100 · +100 · 36 / 72 / 144</p>
              <p className="annot mt-8 font-bold">{t("type.numeral")}</p>
              <p className="mt-2 font-mono leading-none font-bold">
                <span className="text-numeral">87</span>
                <span className="text-4xl">%</span>
              </p>
              <p className="annot mt-8 font-bold">{t("type.motion")}</p>
              <dl className="mt-2 border-t border-ink">
                {MOTION.map(([token, value]) => (
                  <div key={token} className="flex justify-between gap-4 border-b border-ink py-2">
                    <dt className="annot font-bold">{token}</dt>
                    <dd className="annot text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-buttons" className="mt-20">
        <SectionHeader number={n("buttons")} id="sg-buttons" title={t("sections.buttons")}>
          {t("buttons.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="annot font-bold">{t("buttons.order")}</p>
              {(["primary", "secondary", "text"] as const).map(buttonRow)}
              <Row label={t("buttons.sizes")}>
                <Button size="s" variant="secondary">
                  {t("matrix.sizes.s")}
                </Button>
                <Button size="m" variant="secondary">
                  {t("matrix.sizes.m")}
                </Button>
                <Button size="l" variant="secondary" keycap="1" arrow>
                  {t("matrix.sizes.l")}
                </Button>
              </Row>
              <Row label={t("buttons.live")}>
                <ButtonDemo
                  variant="primary"
                  outcome="success"
                  label={t("buttons.save")}
                  statusLabel={t("matrix.successLabel")}
                  loadingLabel={t("matrix.loadingLabel")}
                />
                <ButtonDemo
                  variant="secondary"
                  outcome="error"
                  label={t("buttons.sync")}
                  statusLabel={t("matrix.errorLabel")}
                  loadingLabel={t("matrix.loadingLabel")}
                />
              </Row>
            </>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-links" className="mt-20">
        <SectionHeader number={n("links")} id="sg-links" title={t("sections.links")}>
          {t("links.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="prose-text">
                {t.rich("links.sentence", {
                  link: (chunks) => (
                    <a href="#sg-links" className="link">
                      {chunks}
                    </a>
                  ),
                })}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6">
                <li>
                  <TextLink href="/method" className="inline-flex min-h-11 items-center">
                    {t("links.internal")}
                  </TextLink>
                </li>
                <li>
                  <ExternalLink
                    href="https://github.com/keller-tg/spectrum"
                    className="inline-flex min-h-11 items-center"
                  >
                    {t("links.external")}
                  </ExternalLink>
                </li>
              </ul>
            </>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-inputs" className="mt-20">
        <SectionHeader number={n("inputs")} id="sg-inputs" title={t("sections.inputs")}>
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

      <section aria-labelledby="sg-segmented" className="mt-20">
        <SectionHeader number={n("segmented")} id="sg-segmented" title={t("sections.segmented")}>
          {t("segmented.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <>
              <Row label={t("segmented.mode")}>
                <SegmentedDemo
                  label={t("segmented.mode")}
                  options={(["quick", "standard", "deep"] as const).map((m) => ({
                    value: m,
                    label: th(`modes.${m}.name`),
                  }))}
                  initial="standard"
                />
              </Row>
              <Row label={t("segmented.axis")}>
                <SegmentedDemo
                  label={t("segmented.axis")}
                  options={[
                    { value: "map", label: t("segmented.map") },
                    ...(["distribution", "liberty", "borders"] as const).map((a) => ({
                      value: a,
                      label: AXES[a].code[locale],
                    })),
                  ]}
                  initial="map"
                />
              </Row>
              <Row label={t("segmented.select")}>
                <SelectDemo
                  id={`sg-select-${mode}`}
                  label={t("segmented.select")}
                  groups={[
                    {
                      label: t("segmented.axis"),
                      options: (["distribution", "liberty", "borders"] as const).map((a) => ({
                        value: a,
                        label: AXES[a].name[locale],
                      })),
                    },
                  ]}
                  initial="liberty"
                />
              </Row>
              <Row label={t("segmented.switch")}>
                <ToggleDemo
                  label={t("toggle.advance")}
                  onText={t("toggle.on")}
                  offText={t("toggle.off")}
                  initial
                />
                <ToggleDemo
                  label={t("toggle.disabled")}
                  onText={t("toggle.on")}
                  offText={t("toggle.off")}
                  disabled
                />
              </Row>
            </>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-modes" className="mt-20">
        <SectionHeader number={n("modes")} id="sg-modes" title={t("sections.modes")}>
          {t("modes.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <ModeRows locale={locale} pinnedHover={mode === "light" ? "quick" : undefined} />
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-answers" className="mt-20">
        <SectionHeader number={n("answers")} id="sg-answers" title={t("sections.answers")}>
          {t("answer.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="annot mb-3 font-bold">{t("answer.selected")}</p>
              <AnswerRowsDemo initial={1} pinnedHover={-1} />
              <p className="annot mt-8 mb-3 font-bold">{t("answer.skipped")}</p>
              <AnswerRowsDemo initialSkipped />
            </>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-nav" className="mt-20">
        <SectionHeader number={n("nav")} id="sg-nav" title={t("sections.nav")}>
          {t("nav.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <>
              <p className="annot mb-2 font-bold">{t("nav.header")}</p>
              <ul aria-hidden="true" className="nav relative flex flex-wrap border-y border-ink">
                {(["test", "compass", "ideologies", "dashboard"] as const).map((key, i) => (
                  <li key={key} className="flex">
                    <span
                      aria-current={i === 1 ? "page" : undefined}
                      className="nav-link bracketed label flex min-h-14 items-center px-4"
                    >
                      {tn(key)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="prose-text mt-4">{t("nav.sheet")}</p>
              <p className="annot mt-8 mb-2 font-bold">{t("nav.tabs")}</p>
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

      <section aria-labelledby="sg-sliders" className="mt-20">
        <SectionHeader number={n("sliders")} id="sg-sliders" title={t("sections.sliders")}>
          {t("sliders.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <div className="space-y-10">
              {BAR_AXES.map(({ axis, value, interval }, i) => (
                <AxisBar
                  key={axis}
                  axis={axis}
                  value={value}
                  interval={interval}
                  band={i === 2 ? "hatch" : "bracket"}
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
                label={`${t("sliders.snap")} · ${AXES.trade.name[locale]}`}
                negLabel={AXES.trade.neg.short[locale]}
                posLabel={AXES.trade.pos.short[locale]}
                initial={-40}
                snap
              />
              <RangeSlider
                label={t("sliders.disabled")}
                negLabel={AXES.nation.neg.short[locale]}
                posLabel={AXES.nation.pos.short[locale]}
                disabled
              />
            </div>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-overlays" className="mt-20">
        <SectionHeader number={n("overlays")} id="sg-overlays" title={t("sections.overlays")}>
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

      <section aria-labelledby="sg-cells" className="mt-20">
        <SectionHeader number={n("cells")} id="sg-cells" title={t("sections.cells")}>
          {t("cells.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="space-y-10">
              <SectionHeader number={7} title={t("cells.sampleTitle")} as="h3" />
              <CellGrid>
                {[1, 2, 3].map((k) => (
                  <Cell key={k} span={4} number={k} title={t("cells.cellTitle")}>
                    <p className="prose-text mt-2">{t("cells.cellBody")}</p>
                  </Cell>
                ))}
              </CellGrid>
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

      <section aria-labelledby="sg-legend" className="mt-20">
        <SectionHeader number={n("legend")} id="sg-legend" title={t("sections.legend")}>
          {t("legend.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="space-y-8">
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
                    key: "dither",
                    swatch: <span className="dither-fade block h-2 w-14" />,
                    label: t("legend.dither"),
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

      <section aria-labelledby="sg-strip" className="mt-20">
        <SectionHeader number={n("strip")} id="sg-strip" title={t("sections.strip")}>
          {t("strip.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {() => (
            <dl className="space-y-6">
              <div>
                <dt className="annot mb-2 font-bold">{t("strip.exampleA")}</dt>
                <dd>
                  <IconStrip coords={EXAMPLE_A} locale={locale} />
                </dd>
              </div>
              <div>
                <dt className="annot mb-2 font-bold">{t("strip.exampleB")}</dt>
                <dd>
                  <IconStrip coords={EXAMPLE_B} locale={locale} />
                </dd>
              </div>
              <div>
                <dt className="annot mb-2 font-bold">{t("strip.howTitle")}</dt>
                <dd className="prose-text">{t("strip.how")}</dd>
              </div>
            </dl>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-radar" className="mt-20">
        <SectionHeader number={n("radar")} id="sg-radar" title={t("sections.radar")}>
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

      <section aria-labelledby="sg-sparkline" className="mt-20">
        <SectionHeader number={n("sparkline")} id="sg-sparkline" title={t("sections.sparkline")}>
          {t("sparkline.note")}
        </SectionHeader>
        <ModePair labels={modeLabels}>
          {(mode) => (
            <div className="grid gap-6">
              <Sparkline
                id={`${mode}-spark-many`}
                description={t("sparkline.many")}
                points={[
                  { t: Date.UTC(2026, 0, 10), score: -40, low: -75, high: -5 },
                  { t: Date.UTC(2026, 3, 2), score: -25, low: -45, high: -5 },
                  { t: Date.UTC(2026, 7, 20), score: 10, low: -2, high: 22 },
                ]}
              />
              <Sparkline
                id={`${mode}-spark-one`}
                description={t("sparkline.one")}
                points={[{ t: Date.UTC(2026, 0, 10), score: 30, low: 5, high: 55 }]}
              />
            </div>
          )}
        </ModePair>
      </section>

      <section aria-labelledby="sg-compass" className="mt-20">
        <SectionHeader number={n("compass")} id="sg-compass" title={t("sections.compass")}>
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

      <section aria-labelledby="sg-web" className="mt-20">
        <SectionHeader number={n("web")} id="sg-web" title={t("sections.web")}>
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

      <section aria-labelledby="sg-images" className="mt-20">
        <SectionHeader number={n("images")} id="sg-images" title={t("sections.images")}>
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
                <p className="annot font-bold">{t("images.glyphs")}</p>
                <ul className="mt-3 flex flex-wrap gap-4">
                  {GLYPH_IDS.map((id) => (
                    <li key={id}>
                      <EntryGlyph id={id} size={48} />
                    </li>
                  ))}
                </ul>
                <p className="prose-text mt-3">{t("images.glyphsNote")}</p>
                <p className="annot mt-6 font-bold">{t("images.flags")}</p>
                <p className="prose-text mt-2">{t("images.flagsNote")}</p>
              </div>
            </div>
          )}
        </ModePair>
      </section>
    </div>
  );
}
