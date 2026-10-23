"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HatchPattern } from "@/components/charts/patterns";
import { ButtonLink } from "@/components/ui/Button";
import { Legend, SpectrumLegend } from "@/components/ui/Legend";
import { Segmented } from "@/components/ui/Segmented";
import { Select, type SelectGroup } from "@/components/ui/Select";
import { AXIS_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { modeQuestions } from "@/data/questions/bank";
import type { CatalogData } from "@/lib/catalog/client-data";
import {
  dimensions,
  MAP_VIEW,
  type DimId,
  type UserInput,
  type View,
} from "@/lib/compass/geometry";
import { scoreTest } from "@/lib/engine/score";
import { userInput } from "@/lib/compass/user";
import { openStore } from "@/lib/storage/db";
import { CompassFigure } from "./CompassFigure";
import { useDimText } from "./dimText";

/** The two-axes view starts on the economic and the liberty axis. */
const AXES_VIEW: View = { x: `axis:${AXIS_IDS[0]}`, y: `axis:${AXIS_IDS[3]}` };

/** The latest stored result as a compass mark, or null. Nothing leaves the browser. */
export function useLatestUser(): UserInput | null | undefined {
  const [user, setUser] = useState<UserInput | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const store = await openStore();
      const result = await store.latestResult();
      if (!alive) return;
      if (!result) return setUser(null);
      const scored = scoreTest(modeQuestions(result.mode), result.answers);
      setUser(userInput(scored.scores, scored.confidences));
    })();
    return () => {
      alive = false;
    };
  }, []);
  return user;
}

/**
 * The compass page (PLAN §9): Map or any two dimensions, the catalog on a
 * halftone field, and the latest result from this browser as a hatched
 * ellipse. Static: no zoom, trail or filters yet (D-086).
 */
export function CompassExplorer({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("compass");
  const locale = useLocale() as Locale;
  const dims = useMemo(() => dimensions(catalog), [catalog]);
  const dimText = useDimText(locale, catalog.map.explained);
  const user = useLatestUser();
  const [mode, setMode] = useState<"map" | "axes">("map");
  const [pair, setPair] = useState<View>(AXES_VIEW);
  const view = mode === "map" ? MAP_VIEW : pair;

  const groups: SelectGroup<DimId>[] = [
    {
      label: t("groupAxes"),
      options: dims
        .filter((d) => d.id.startsWith("axis:"))
        .map((d) => ({ value: d.id, label: dimText(d.id).name })),
    },
    {
      label: t("groupIndices"),
      options: dims
        .filter((d) => d.id.startsWith("index:"))
        .map((d) => ({ value: d.id, label: dimText(d.id).name })),
    },
  ];

  const choose = (axis: "x" | "y", value: DimId) =>
    setPair((p) => {
      const other = axis === "x" ? p.y : p.x;
      // Picking the other axis's dimension swaps the two.
      if (value === other) return { x: p.y, y: p.x };
      return { ...p, [axis]: value };
    });

  const share = Math.round(
    ((catalog.map.explained[0] ?? 0) + (catalog.map.explained[1] ?? 0)) * 100,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-14">
      <section
        aria-label={t("controls")}
        className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start"
      >
        <Segmented
          label={t("view")}
          options={[
            { value: "map", label: t("map") },
            { value: "axes", label: t("axes") },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === "map" ? (
          <p className="prose-text text-base">{t("mapNote", { share })}</p>
        ) : (
          <div className="flex flex-col gap-5">
            <Select
              id="compass-x"
              label={t("xAxis")}
              value={pair.x}
              groups={groups}
              onChange={(v) => choose("x", v)}
            />
            <Select
              id="compass-y"
              label={t("yAxis")}
              value={pair.y}
              groups={groups}
              onChange={(v) => choose("y", v)}
            />
            <p className="annot">{t("swapNote")}</p>
          </div>
        )}
        {user === null ? (
          <div className="border-[1.5px] border-dashed border-ink p-4">
            <p className="prose-text text-base">{t("noResult")}</p>
            <div className="mt-4">
              <ButtonLink href="/test" arrow>
                {t("takeTest")}
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </section>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <CompassFigure
          id="compass"
          entries={catalog.entries}
          dims={dims}
          view={view}
          user={user ?? null}
          explained={catalog.map.explained}
          caption={t("caption", { count: catalog.entries.length })}
        />
      </div>
      <div className="grid min-w-0 gap-8 lg:col-start-1">
        <Legend
          title={t("key")}
          items={[
            {
              key: "density",
              swatch: (
                <svg viewBox="0 0 48 12" className="h-3 w-12" fill="currentColor">
                  {[1, 2, 3, 4.5, 6].map((r, i) => (
                    <circle key={r} cx={4 + i * 9.5} cy="6" r={r * 0.9} />
                  ))}
                </svg>
              ),
              label: t("density"),
            },
            {
              key: "you",
              swatch: (
                <svg viewBox="0 0 48 24" className="h-6 w-12">
                  <defs>
                    <HatchPattern id="compass-legend-hatch" gap={4} />
                  </defs>
                  <ellipse
                    cx="24"
                    cy="12"
                    rx="20"
                    ry="9"
                    fill="url(#compass-legend-hatch)"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              ),
              label: t("youRange"),
            },
          ]}
        />
        <SpectrumLegend locale={locale} title={t("spectra")} />
      </div>
    </div>
  );
}
