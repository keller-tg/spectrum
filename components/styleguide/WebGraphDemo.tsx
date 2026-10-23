import { AXIS_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { SPECTRUMS } from "@/data/spectrums";
import { SpectrumShapeG } from "@/components/charts/SpectrumMarker";
import { Table } from "@/components/ui/Table";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { pca, project } from "@/lib/engine";

/** A fixed sample across all nine spectra; the first one is shown selected. */
const SAMPLE = [
  "social-democracy",
  "democratic-socialism",
  "marxism-leninism",
  "anarcho-communism",
  "green-politics",
  "social-liberalism",
  "classical-liberalism",
  "christian-democracy",
  "liberal-conservatism",
  "national-conservatism",
  "populist-radical-right",
  "fascism",
  "strasserism",
  "libertarianism",
  "anarcho-capitalism",
  "khomeinism",
  "technocracy",
] as const;

const W = 440;
const H = 300;
const PAD = 28;

/**
 * Static preview of the Phase 10 web view: nodes are spectrum markers placed by
 * the overall map (PCA over all 12 axes), 1px hairline edges join each node to
 * its two nearest neighbours, labels appear on hover, the selected node is inverted.
 */
export function WebGraphDemo({
  locale,
  idPrefix,
  labels,
}: {
  locale: Locale;
  /** Keeps ids unique when the demo appears more than once on a page. */
  idPrefix: string;
  labels: { title: string; data: string; node: string; spectrum: string; neighbours: string };
}) {
  const all = loadIdeologies();
  const vec = (e: (typeof all)[number]) => AXIS_IDS.map((a) => e.coords[a]);
  const map = pca(all.map(vec));
  const nodes = SAMPLE.flatMap((id) => {
    const entry = all.find((e) => e.id === id);
    return entry ? [{ entry, at: project(vec(entry), map, 2) as [number, number] }] : [];
  });

  const xs = nodes.map((n) => n.at[0]);
  const ys = nodes.map((n) => n.at[1]);
  const sx = (v: number) =>
    PAD + ((v - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs))) * (W - 2 * PAD);
  const sy = (v: number) =>
    PAD + ((v - Math.min(...ys)) / (Math.max(...ys) - Math.min(...ys))) * (H - 2 * PAD);

  const dist = (a: number, b: number) => {
    const va = vec((nodes[a] as (typeof nodes)[number]).entry);
    const vb = vec((nodes[b] as (typeof nodes)[number]).entry);
    return Math.hypot(...va.map((x, i) => x - (vb[i] as number)));
  };
  const nearest = nodes.map((_, i) =>
    nodes
      .map((__, j) => j)
      .filter((j) => j !== i)
      .sort((a, b) => dist(i, a) - dist(i, b))
      .slice(0, 2),
  );
  const edges = new Set<string>();
  nearest.forEach((ns, i) => ns.forEach((j) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`)));

  const name = (i: number) => {
    const e = (nodes[i] as (typeof nodes)[number]).entry;
    return e.names[locale] ?? e.names.en;
  };
  const halo = { stroke: "var(--paper)", strokeWidth: 4, paintOrder: "stroke" } as const;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby={`${idPrefix}-web-title`}
        className="h-auto w-full max-w-2xl border-2 border-ink font-mono"
      >
        <title id={`${idPrefix}-web-title`}>{labels.title}</title>
        <g stroke="currentColor" strokeWidth="1">
          {[...edges].map((key) => {
            const [a, b] = key.split("-").map(Number) as [number, number];
            const na = nodes[a] as (typeof nodes)[number];
            const nb = nodes[b] as (typeof nodes)[number];
            return (
              <line
                key={key}
                x1={sx(na.at[0])}
                y1={sy(na.at[1])}
                x2={sx(nb.at[0])}
                y2={sy(nb.at[1])}
              />
            );
          })}
        </g>
        {nodes.map(({ entry, at }, i) => {
          const x = sx(at[0]);
          const y = sy(at[1]);
          const selected = i === 0;
          return (
            <g key={entry.id} className="group">
              <rect x={x - 12} y={y - 12} width="24" height="24" fill="transparent" />
              <SpectrumShapeG id={entry.spectrum} x={x} y={y} size={16} inverted={selected} />
              <text
                x={x + 14}
                y={y - 10}
                fontSize="12"
                fontWeight="700"
                fill="currentColor"
                className={selected ? undefined : "hidden group-hover:inline"}
                {...halo}
              >
                {name(i)}
              </text>
            </g>
          );
        })}
      </svg>
      <details className="mt-3">
        <summary className="label inline-flex min-h-11 items-center hover:bg-ink hover:text-paper">
          {labels.data}
        </summary>
        <Table
          id={`${idPrefix}-web-table`}
          className="mt-2"
          caption={labels.title}
          columns={[
            { key: "node", header: labels.node },
            { key: "spectrum", header: labels.spectrum },
            { key: "neighbours", header: labels.neighbours },
          ]}
          rows={nodes.map(({ entry }, i) => [
            name(i),
            SPECTRUMS[entry.spectrum].code[locale],
            (nearest[i] ?? []).map(name).join(", "),
          ])}
        />
      </details>
    </figure>
  );
}
