import { getTranslations } from "next-intl/server";
import { halftoneRadius } from "@/components/charts/patterns";
import { SpectrumShapeG } from "@/components/charts/SpectrumMarker";
import type { Locale } from "@/data/locales";
import { SPECTRUMS } from "@/data/spectrums";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { catalogMap, mapPosition } from "@/lib/catalog/map";
import { HeroFieldLive, type FieldPoint } from "./HeroFieldLive";

/** viewBox size; the plot sits inside the crop marks. */
const W = 400;
const PAD = 30;
const GRID = 28;
const CELL = (W - 2 * PAD) / GRID;
/** Densities below this share of the maximum print no dot. */
const FLOOR = 0.14;
/** Major labels must fit a phone-sized figure; minor ones show only on wide figures. */
const MAJOR = { count: 5, fitPx: 340 } as const;
const MINOR = { count: 9, fitPx: 672 } as const;

export const anchorId = (id: string) => `idx-${id}`;

interface Placed extends FieldPoint {
  spectrum: keyof typeof SPECTRUMS;
}

/**
 * Greedy, collision-free labels: one per spectrum first (the outermost entry),
 * then the rest. Majors are fitted at phone width, minors at a wide figure,
 * each against everything already placed (the label font stays 12px while
 * the figure scales, so a narrower figure means relatively wider labels).
 */
function chooseLabels(points: readonly Placed[]) {
  const centre = W / 2;
  const reach = (p: Placed) => Math.hypot(p.x - centre, p.y - centre);
  const order = points.map((p, i) => ({ p, i })).sort((a, b) => reach(b.p) - reach(a.p));
  const seen = new Set<string>();
  const firstPass = order.filter(({ p }) => !seen.has(p.spectrum) && seen.add(p.spectrum));
  const candidates = [...firstPass, ...order.filter((o) => !firstPass.includes(o))];
  const boxes: [number, number, number, number][] = [];
  const chosen: { i: number; left: boolean; major: boolean }[] = [];
  const markerBoxes = points.map((p) => [p.x - 8, p.y - 8, p.x + 8, p.y + 8] as const);

  const place = (fitPx: number, count: number, major: boolean) => {
    const unit = W / fitPx;
    let placed = 0;
    for (const { p, i } of candidates) {
      if (placed >= count) break;
      if (chosen.some((c) => c.i === i)) continue;
      const width = (p.name.length * 7.3 + 10) * unit;
      const height = 18 * unit;
      const left = p.x > W * 0.6;
      const x0 = left ? p.x - 12 * unit - width : p.x + 12 * unit;
      const box: [number, number, number, number] = [
        x0,
        p.y - height / 2,
        x0 + width,
        p.y + height / 2,
      ];
      const overlaps = (b: readonly number[]) =>
        (b[0] as number) < box[2] &&
        box[0] < (b[2] as number) &&
        (b[1] as number) < box[3] &&
        box[1] < (b[3] as number);
      if (box[0] < PAD || box[2] > W - PAD || box[1] < PAD || box[3] > W - PAD) continue;
      if (boxes.some(overlaps) || markerBoxes.some((b, k) => k !== i && overlaps(b))) continue;
      boxes.push(box);
      chosen.push({ i, left, major });
      placed++;
    }
  };
  place(MAJOR.fitPx, MAJOR.count, true);
  place(MINOR.fitPx, MINOR.count, false);
  return chosen;
}

/**
 * FIG. 01: the real catalog on the overall map (the same PCA as Map mode).
 * Server-rendered as a complete SVG, so it works without JavaScript; the
 * client layer adds a slow stepped drift, a crosshair with a readout of the
 * nearest ideology, and keyboard stepping. Marker size, kernel width and label
 * count scale with the number of entries (53 today, 300+ at launch).
 */
export async function HeroField({ locale, id }: { locale: Locale; id: string }) {
  const t = await getTranslations("home.field");
  const { map } = catalogMap();
  const entries = loadIdeologies().filter((e) => !e.tags.includes("online-satirical"));
  const n = entries.length;
  const raw = entries.map((e) => mapPosition(e.coords, map));

  // One scale for both components, centred, so distances stay honest.
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const inner = W - 2 * PAD - 36;
  const scale = inner / span;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;

  const points: Placed[] = entries.map((e, i) => {
    const [pc1, pc2] = raw[i] as [number, number];
    return {
      id: e.id,
      name: e.names[locale] ?? e.names.en,
      code: SPECTRUMS[e.spectrum].code[locale],
      spectrum: e.spectrum,
      x: W / 2 + (pc1 - cx) * scale,
      y: W / 2 - (pc2 - cy) * scale,
      pc1: Math.round(pc1),
      pc2: Math.round(pc2),
    };
  });

  // Halftone: Gaussian kernel density on a grid; dot area follows density.
  const bandwidth = Math.min(28, Math.max(14, 26 * Math.sqrt(53 / n)));
  const dots: { x: number; y: number; r: number }[] = [];
  const density: number[] = [];
  for (let row = 0; row < GRID; row++)
    for (let col = 0; col < GRID; col++) {
      const x = PAD + (col + 0.5) * CELL;
      const y = PAD + (row + 0.5) * CELL;
      let d = 0;
      for (const p of points)
        d += Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / (2 * bandwidth ** 2));
      density.push(d);
    }
  const max = Math.max(...density);
  density.forEach((d, k) => {
    const level = Math.max(0, (d / max - FLOOR) / (1 - FLOOR)) ** 1.15;
    const r = halftoneRadius(level, CELL - 3);
    if (r >= 0.5)
      dots.push({
        x: PAD + ((k % GRID) + 0.5) * CELL,
        y: PAD + (Math.floor(k / GRID) + 0.5) * CELL,
        r,
      });
  });

  const markerSize = Math.min(12, Math.max(7, 12 * Math.sqrt(53 / n)));
  const labels = chooseLabels(points);
  const explained = Math.round(((map.explained[0] ?? 0) + (map.explained[1] ?? 0)) * 100);
  const ticks = Array.from({ length: 11 }, (_, i) => PAD + (i * (W - 2 * PAD)) / 10);
  const fmt = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
  const r1 = (v: number) => Math.round(v * 10) / 10;

  return (
    <figure aria-labelledby={`${id}-caption`}>
      <div className="@container relative" data-field={id}>
        <svg
          viewBox={`0 0 ${W} ${W}`}
          role="img"
          aria-labelledby={`${id}-caption ${id}-desc`}
          className="block h-auto w-full"
        >
          <desc id={`${id}-desc`}>{t("description", { count: n })}</desc>
          {/* Crop marks and rulers. */}
          <g stroke="currentColor" strokeWidth="1" fill="none">
            {[
              [PAD, PAD, -1, -1],
              [W - PAD, PAD, 1, -1],
              [PAD, W - PAD, -1, 1],
              [W - PAD, W - PAD, 1, 1],
            ].map(([x, y, sx, sy]) => (
              <path
                key={`${x}-${y}`}
                d={`M${(x as number) + (sx as number) * 6} ${y}h${(sx as number) * 14}M${x} ${(y as number) + (sy as number) * 6}v${(sy as number) * 14}`}
              />
            ))}
            {ticks.map((x, i) => (
              <path key={`b${i}`} d={`M${x} ${W - PAD + 4}v${i % 5 === 0 ? 8 : 4}`} />
            ))}
            {ticks.map((y, i) => (
              <path key={`l${i}`} d={`M${PAD - 4} ${y}h${i % 5 === 0 ? -8 : -4}`} />
            ))}
            <path
              d={`M${W / 2} ${PAD}V${W - PAD}M${PAD} ${W / 2}H${W - PAD}`}
              strokeDasharray="2 4"
            />
          </g>
          <g fill="currentColor">
            {dots.map((d, k) => (
              <circle key={k} cx={r1(d.x)} cy={r1(d.y)} r={r1(d.r)} />
            ))}
          </g>
          {/* Paper knock-outs first, so no marker cuts into a neighbour. */}
          <g fill="var(--paper)">
            {points.map((p, i) => (
              <circle
                key={p.id}
                data-field-marker={i}
                cx={r1(p.x)}
                cy={r1(p.y)}
                r={r1(markerSize * 0.85)}
              />
            ))}
          </g>
          <g>
            {points.map((p, i) => (
              <g key={p.id} data-field-marker={i}>
                <SpectrumShapeG
                  id={p.spectrum}
                  x={r1(p.x)}
                  y={r1(p.y)}
                  size={markerSize}
                  hollow="none"
                />
              </g>
            ))}
          </g>
        </svg>
        {labels.map(({ i, left, major }) => {
          const p = points[i] as Placed;
          return (
            <span
              key={p.id}
              aria-hidden="true"
              data-field-label={i}
              className={`annot pointer-events-none absolute bg-paper px-1 whitespace-nowrap ${major ? "" : "@max-2xl:hidden"}`}
              style={{
                left: `${(p.x / W) * 100}%`,
                top: `${(p.y / W) * 100}%`,
                translate: left ? "calc(-100% - 10px) -50%" : "10px -50%",
              }}
            >
              {p.name}
            </span>
          );
        })}
        <HeroFieldLive
          points={points.map(({ id: pid, name, code, x, y, pc1, pc2 }) => ({
            id: pid,
            name,
            code,
            x: r1(x),
            y: r1(y),
            pc1,
            pc2,
          }))}
          size={W}
          labels={{
            nearest: t("nearest"),
            keyboard: t("keyboard"),
            open: t("open"),
            pc1: t("pc1"),
            pc2: t("pc2"),
          }}
        />
      </div>
      <figcaption
        id={`${id}-caption`}
        className="annot mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-ink pt-2"
      >
        <span className="font-bold">{t("caption", { count: n })}</span>
        <span>{t("axes", { share: explained })}</span>
      </figcaption>
      <details className="mt-2">
        <summary className="label inline-flex min-h-11 items-center">
          {t("list", { count: n })}
        </summary>
        <ol className="mt-2 columns-1 gap-6 sm:columns-2">
          {[...points]
            .sort((a, b) => a.name.localeCompare(b.name, locale))
            .map((p) => (
              <li key={p.id} className="break-inside-avoid">
                <a
                  href={`#${anchorId(p.id)}`}
                  className="link-host flex min-h-11 items-center gap-2"
                >
                  <span className="link">{p.name}</span>
                  <span className="annot">
                    {p.code} · {t("pc1")} {fmt(p.pc1)} · {t("pc2")} {fmt(p.pc2)}
                  </span>
                </a>
              </li>
            ))}
        </ol>
      </details>
    </figure>
  );
}
