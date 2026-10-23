"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HatchPattern } from "@/components/charts/patterns";
import { SpectrumShapeG } from "@/components/charts/SpectrumMarker";
import { Table } from "@/components/ui/Table";
import type { Locale } from "@/data/locales";
import type { CatalogEntry } from "@/lib/catalog/client-data";
import {
  CELL,
  densityLevels,
  GRID,
  LABEL_GAP_PX,
  LABEL_HEIGHT_PX,
  labelWidthPx,
  layoutView,
  markerSize,
  nearest,
  PAD,
  placeLabels,
  SIZE,
  stepFrom,
  type Box,
  type Dim,
  type Direction,
  type UserInput,
  type View,
} from "@/lib/compass/geometry";
import { signed, useDimText } from "./dimText";

const KEYS: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

/** Width the labels are fitted to before the figure has been measured. */
const DEFAULT_WIDTH = 640;
const r1 = (v: number) => Math.round(v * 10) / 10;
/** viewBox units → share of the figure's width, for HTML laid over the SVG. */
const cq = (v: number) => `${((v / SIZE) * 100).toFixed(3)}cqw`;

/**
 * One compass figure (PLAN §9, D-086): the catalog as spectrum markers over a
 * halftone density field, the user's likely range as a hatched ellipse, and
 * collision-free labels fitted to the rendered width. A view change glides
 * every mark to its new place by transform only. Pointer and arrow keys move
 * a crosshair with a readout; a live region and a table carry the same
 * information without the picture.
 */
export function CompassFigure({
  id,
  entries,
  dims,
  view,
  user,
  explained,
  caption,
}: {
  id: string;
  entries: readonly CatalogEntry[];
  dims: readonly Dim[];
  view: View;
  user: UserInput | null;
  /** Variance share of the map components, for their names. */
  explained: readonly number[];
  caption: string;
}) {
  const t = useTranslations("compass");
  const locale = useLocale() as Locale;
  const dimText = useDimText(locale, explained);
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [active, setActive] = useState<number | null>(null);
  const [spoken, setSpoken] = useState("");

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => layoutView(view, dims, entries, user), [view, dims, entries, user]);
  const levels = useMemo(() => densityLevels(layout.points), [layout]);
  const size = markerSize(entries.length);
  const xt = dimText(view.x);
  const yt = dimText(view.y);
  const unit = SIZE / Math.max(width, 160);

  // Arrows are symbols, not words: the pole names come from the data.
  const poles = {
    up: `↑ ${yt.pos}`,
    down: `↓ ${yt.neg}`,
    left: `← ${xt.neg}`,
    right: `${xt.pos} →`,
  };
  const youText = t("you");
  const youBox = useMemo((): Box | null => {
    const u = layout.user;
    if (!u) return null;
    const w = labelWidthPx(youText) * unit;
    const h = LABEL_HEIGHT_PX * unit;
    return [u.x + 4 * unit, u.y - h - 4 * unit, u.x + 4 * unit + w, u.y - 4 * unit];
  }, [layout.user, youText, unit]);

  const labels = useMemo(
    () =>
      placeLabels(
        layout.points,
        entries.map((e) => e.name),
        entries.map((e) => e.spectrum),
        width,
        size,
        youBox ? [youBox] : [],
      ),
    [layout.points, entries, width, size, youBox],
  );

  // Announce a new view (not the first one).
  const viewKey = `${view.x}|${view.y}`;
  const firstView = useRef(viewKey);
  useEffect(() => {
    if (firstView.current === viewKey) return;
    firstView.current = "";
    const u = layout.user;
    setSpoken(
      t("announceView", { x: xt.name, y: yt.name }) +
        (u ? ` ${t("announceYou", { x: signed(u.vx), y: signed(u.vy) })}` : ""),
    );
    // Only the view itself should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  const describe = (i: number) => {
    const e = entries[i] as CatalogEntry;
    const p = layout.points[i];
    return t("announcePoint", {
      name: e.name,
      code: e.spectrumCode,
      x: `${xt.short} ${signed(p?.vx ?? 0)}`,
      y: `${yt.short} ${signed(p?.vy ?? 0)}`,
    });
  };

  const toViewBox = (clientX: number, clientY: number) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return null;
    return [((clientX - box.left) / box.width) * SIZE, ((clientY - box.top) / box.height) * SIZE];
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const dir = KEYS[event.key];
    if (dir) {
      event.preventDefault();
      const next = stepFrom(layout.points, active, dir);
      setActive(next);
      setSpoken(describe(next));
    } else if (event.key === "Escape" && active !== null) {
      setActive(null);
      setSpoken("");
    }
  };

  const current = active !== null ? layout.points[active] : undefined;
  const currentEntry = active !== null ? entries[active] : undefined;
  const u = layout.user;
  const zeroX = layout.frame.sx(0);
  const zeroY = layout.frame.sy(0);
  const inPlot = (v: number) => v > PAD && v < SIZE - PAD;
  const ticks = Array.from({ length: 11 }, (_, i) => PAD + (i * (SIZE - 2 * PAD)) / 10);
  const descId = `${id}-desc`;

  return (
    <figure aria-labelledby={`${id}-caption`}>
      <p aria-hidden="true" className="annot mb-1 text-center font-bold">
        {poles.up}
      </p>
      <div ref={wrap} className="@container relative overflow-hidden">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-labelledby={`${id}-caption ${descId}`}
          className="block h-auto w-full"
        >
          <desc id={descId}>
            {t("description", { count: entries.length, x: xt.name, y: yt.name })}
            {u ? ` ${t("descriptionYou")}` : ""}
          </desc>
          <defs>
            <HatchPattern id={`${id}-hatch`} gap={4} />
            <clipPath id={`${id}-plot`}>
              <rect x={PAD} y={PAD} width={SIZE - 2 * PAD} height={SIZE - 2 * PAD} />
            </clipPath>
          </defs>
          {/* Crop marks, rulers and the zero lines. */}
          <g stroke="currentColor" strokeWidth="1" fill="none">
            {[
              [PAD, PAD, -1, -1],
              [SIZE - PAD, PAD, 1, -1],
              [PAD, SIZE - PAD, -1, 1],
              [SIZE - PAD, SIZE - PAD, 1, 1],
            ].map(([x, y, sx, sy]) => (
              <path
                key={`${x}-${y}`}
                d={`M${(x as number) + (sx as number) * 6} ${y}h${(sx as number) * 14}M${x} ${(y as number) + (sy as number) * 6}v${(sy as number) * 14}`}
              />
            ))}
            {ticks.map((x, i) => (
              <path key={`b${i}`} d={`M${x} ${SIZE - PAD + 4}v${i % 5 === 0 ? 8 : 4}`} />
            ))}
            {ticks.map((y, i) => (
              <path key={`l${i}`} d={`M${PAD - 4} ${y}h${i % 5 === 0 ? -8 : -4}`} />
            ))}
            {inPlot(zeroX) ? (
              <path d={`M${r1(zeroX)} ${PAD}V${SIZE - PAD}`} strokeDasharray="2 4" />
            ) : null}
            {inPlot(zeroY) ? (
              <path d={`M${PAD} ${r1(zeroY)}H${SIZE - PAD}`} strokeDasharray="2 4" />
            ) : null}
          </g>
          {/* Halftone: fixed lattice, each dot scaled to its density. */}
          <g fill="currentColor">
            {levels.map((level, k) => (
              <circle
                key={k}
                className="cmp-move"
                r={CELL / 2 - 1}
                style={{
                  transform: `translate(${r1(PAD + ((k % GRID) + 0.5) * CELL)}px, ${r1(PAD + (Math.floor(k / GRID) + 0.5) * CELL)}px) scale(${Math.sqrt(level).toFixed(3)})`,
                }}
              />
            ))}
          </g>
          {/* You: paper knock-out, hatch and outline, clipped to the plot. */}
          {u ? (
            <g clipPath={`url(#${id}-plot)`}>
              <g
                className="cmp-move"
                style={{ transform: `translate(${r1(u.x)}px, ${r1(u.y)}px)` }}
              >
                <ellipse rx={r1(u.rx)} ry={r1(u.ry)} fill="var(--paper)" />
                <ellipse
                  rx={r1(u.rx)}
                  ry={r1(u.ry)}
                  fill={`url(#${id}-hatch)`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </g>
            </g>
          ) : null}
          {/* Paper knock-outs first, so no marker cuts into a neighbour. */}
          <g fill="var(--paper)">
            {layout.points.map((p) => (
              <circle
                key={entries[p.i]?.id}
                className="cmp-move"
                r={r1(size * 0.85)}
                style={{ transform: `translate(${r1(p.x)}px, ${r1(p.y)}px)` }}
              />
            ))}
          </g>
          {layout.points.map((p) => {
            const e = entries[p.i] as CatalogEntry;
            return (
              <g
                key={e.id}
                className="cmp-move"
                style={{ transform: `translate(${r1(p.x)}px, ${r1(p.y)}px)` }}
              >
                <SpectrumShapeG id={e.spectrum} x={0} y={0} size={size} hollow="none" />
              </g>
            );
          })}
          {/* Your crosshair on top of everything. */}
          {u ? (
            <g
              className="cmp-move"
              style={{ transform: `translate(${r1(u.x)}px, ${r1(u.y)}px)` }}
              stroke="currentColor"
              fill="none"
            >
              <path d="M-9 0H9M0 -9V9" stroke="var(--paper)" strokeWidth="4" />
              <path d="M-9 0H9M0 -9V9" strokeWidth="1.5" />
              <rect x="-3" y="-3" width="6" height="6" fill="currentColor" stroke="var(--paper)" />
            </g>
          ) : null}
        </svg>

        {/* Labels: HTML over the SVG, so text stays 12px at any size. */}
        {labels.map(({ i, left }) => {
          const p = layout.points[i];
          const e = entries[i];
          if (!p || !e) return null;
          const off = `${cq(size / 2)} + ${LABEL_GAP_PX}px`;
          return (
            <span
              key={e.id}
              aria-hidden="true"
              className="cmp-move annot pointer-events-none absolute top-0 left-0 bg-paper px-1 whitespace-nowrap"
              style={{
                transform: left
                  ? `translate(calc(${cq(p.x)} - ${off} - 100%), calc(${cq(p.y)} - 50%))`
                  : `translate(calc(${cq(p.x)} + ${off}), calc(${cq(p.y)} - 50%))`,
              }}
            >
              {e.name}
            </span>
          );
        })}
        {u && youBox ? (
          <span
            aria-hidden="true"
            className="cmp-move annot pointer-events-none absolute top-0 left-0 bg-ink px-1 font-bold whitespace-nowrap text-paper"
            style={{ transform: `translate(${cq(youBox[0])}, ${cq(youBox[1])})` }}
          >
            {youText}
          </span>
        ) : null}

        {/* Interaction: pointer and keyboard, with crosshair and readout. */}
        <div
          tabIndex={0}
          role="group"
          aria-label={t("keyboard")}
          aria-describedby={descId}
          className="absolute inset-0 cursor-crosshair touch-manipulation"
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const at = toViewBox(e.clientX, e.clientY);
            if (at) setActive(nearest(layout.points, at[0] as number, at[1] as number));
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setActive(null);
          }}
          onPointerUp={(e) => {
            if (e.pointerType === "mouse") return;
            const at = toViewBox(e.clientX, e.clientY);
            if (at) setActive(nearest(layout.points, at[0] as number, at[1] as number));
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          {current ? (
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <g stroke="currentColor" strokeWidth="1" fill="none">
                <path
                  d={`M${r1(current.x)} ${PAD}V${SIZE - PAD}M${PAD} ${r1(current.y)}H${SIZE - PAD}`}
                />
                <rect
                  x={r1(current.x - size)}
                  y={r1(current.y - size)}
                  width={r1(size * 2)}
                  height={r1(size * 2)}
                  strokeWidth="1.5"
                />
              </g>
            </svg>
          ) : null}
          {current && currentEntry ? (
            <p
              aria-hidden="true"
              className="annot pointer-events-none absolute top-2 right-2 max-w-[min(20rem,calc(100%-1rem))] border border-ink bg-paper px-2 py-1"
            >
              <span className="block font-bold">{currentEntry.name}</span>
              <span className="block">
                {currentEntry.spectrumCode} · {currentEntry.familyName}
              </span>
              <span className="block">
                {xt.short} {signed(current.vx)} · {yt.short} {signed(current.vy)}
              </span>
            </p>
          ) : null}
        </div>
      </div>
      <p
        aria-hidden="true"
        className="annot mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 font-bold"
      >
        <span>{poles.left}</span>
        <span>{poles.down}</span>
        <span>{poles.right}</span>
      </p>
      <figcaption
        id={`${id}-caption`}
        className="annot mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-ink pt-2"
      >
        <span className="font-bold">{caption}</span>
        <span>{t("axesLine", { x: xt.name, y: yt.name })}</span>
      </figcaption>
      <p className="sr-only" aria-live="polite">
        {spoken}
      </p>
      <details className="mt-2">
        <summary className="label inline-flex min-h-11 items-center">
          {t("table", { count: entries.length })}
        </summary>
        <Table
          id={`${id}-table`}
          className="mt-3"
          caption={t("tableCaption", { x: xt.name, y: yt.name })}
          columns={[
            { key: "name", header: t("colName") },
            { key: "spectrum", header: t("colSpectrum") },
            { key: "x", header: xt.short, numeric: true },
            { key: "y", header: yt.short, numeric: true },
          ]}
          rows={[
            ...(u ? [[<strong key="you">{youText}</strong>, "—", signed(u.vx), signed(u.vy)]] : []),
            ...[...layout.points]
              .sort((a, b) =>
                (entries[a.i]?.name ?? "").localeCompare(entries[b.i]?.name ?? "", locale),
              )
              .map((p) => {
                const e = entries[p.i] as CatalogEntry;
                return [
                  e.name,
                  `${e.spectrumCode} · ${e.spectrumName}`,
                  signed(p.vx),
                  signed(p.vy),
                ];
              }),
          ]}
        />
      </details>
    </figure>
  );
}
