"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { formatScore } from "@/components/charts/AxisBar";
import { Sparkline } from "@/components/charts/Sparkline";
import { SpectrumMarker } from "@/components/charts/SpectrumMarker";
import { SectionHead } from "@/components/results/ResultSections";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { AXES, AXIS_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { MODES, type ModeId } from "@/data/modes";
import { useRouter } from "@/i18n/navigation";
import { modeSlug } from "@/i18n/params";
import type { CatalogData } from "@/lib/catalog/client-data";
import {
  axisSeries,
  compare,
  drift,
  readings,
  suggestion,
  type Basis,
  type Reading,
} from "@/lib/dashboard/history";
import {
  HISTORY_FORMAT,
  HISTORY_VERSION,
  historyFileSchema,
  type HistoryFile,
} from "@/lib/schema/history";
import { openStore, type Store, type StoredResult } from "@/lib/storage/db";

const EXPORT_NAME = "spectrum-history.json";

/**
 * The local-first dashboard (PLAN §10, D-092): every result this browser
 * holds, read either as taken or recomputed with the current engine. Notes,
 * export, import and deletion all stay on this device; nothing is in the URL.
 */
export function DashboardView({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("dashboard");
  const tm = useTranslations("home");
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [results, setResults] = useState<StoredResult[] | undefined>(undefined);
  const [basis, setBasis] = useState<Basis>("recomputed");
  const [pair, setPair] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState("");
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmOne, setConfirmOne] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = async (s: Store) => setResults(await s.allResults());

  useEffect(() => {
    void (async () => {
      const s = await openStore();
      setStore(s);
      await reload(s);
    })();
  }, []);

  const list = useMemo(
    () => (results ? readings(results, basis, catalog) : []),
    [results, basis, catalog],
  );
  const series = useMemo(() => axisSeries(list), [list]);
  const moved = useMemo(() => drift(list), [list]);
  const next = suggestion(list);
  const anyChanged = list.some((r) => r.versionChanged);

  const date = (d: Date) => format.dateTime(d, { dateStyle: "medium" });
  const label = (r: Reading) => `${date(r.date)} · ${tm(`modes.${r.result.mode}.name`)}`;
  const modeName = (m: ModeId) => tm(`modes.${m}.name`);

  const ids = list.map((r) => r.result.id);
  const [aId, bId] = pair ?? [ids[0] ?? 0, ids.at(-1) ?? 0];
  const ra = list.find((r) => r.result.id === aId);
  const rb = list.find((r) => r.result.id === bId);
  const comparison = ra && rb ? compare(ra, rb) : null;

  const continueWith = async (mode: ModeId) => {
    const latest = list.at(-1)?.result;
    if (!latest || !store) return;
    await store.putDraft({
      mode,
      answers: latest.answers,
      startedAt: latest.createdAt,
      updatedAt: new Date().toISOString(),
    });
    router.push({
      pathname: "/test/[mode]/[n]",
      params: { mode: modeSlug(locale, mode), n: String(MODES[latest.mode].count + 1) },
    });
  };

  const saveNote = async (r: StoredResult & { id: number }, note: string) => {
    if (!store || (r.note ?? "") === note) return;
    const { note: _old, ...rest } = r;
    void _old;
    await store.putResult(note.trim() ? { ...rest, note } : rest);
    await reload(store);
    setStatus(t("noteSaved"));
  };

  const exportAll = () => {
    if (!results) return;
    const file: HistoryFile = {
      format: HISTORY_FORMAT,
      version: HISTORY_VERSION,
      exportedAt: new Date().toISOString(),
      results: results.map(({ id: _id, ...rest }) => {
        void _id;
        return rest;
      }),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(historyFileSchema.parse(file), null, 1)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = EXPORT_NAME;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(t("exported", { count: results.length }));
  };

  const importFile = async (file: File) => {
    if (!store) return;
    try {
      const parsed = historyFileSchema.parse(JSON.parse(await file.text()));
      const added = await store.importResults(parsed.results);
      await reload(store);
      setStatus(t("imported", { added, skipped: parsed.results.length - added }));
    } catch {
      setStatus(t("importError"));
    }
  };

  const deleteAll = async () => {
    if (!store) return;
    await store.clearAll();
    await reload(store);
    setConfirmAll(false);
    setStatus(t("deletedAll"));
  };

  const deleteOne = async (id: number) => {
    if (!store) return;
    await store.deleteResult(id);
    await reload(store);
    setConfirmOne(null);
    setPair(null);
    setStatus(t("deletedOne"));
  };

  const dataSection = (number: number) => (
    <section aria-labelledby="dash-data">
      <SectionHead id="dash-data" number={number} title={t("sections.data")} />
      <p className="prose-text mt-6">{t("dataLead")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={exportAll} disabled={!results?.length}>
          {t("export")}
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          {t("import")}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="annot mt-3">{t("exportNote")}</p>
      <div className="mt-8 border-[1.5px] border-dashed border-ink p-5">
        <p className="prose-text">{t("deleteLead")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {confirmAll ? (
            <>
              <p className="label">{t("deleteConfirm")}</p>
              <Button onClick={() => void deleteAll()}>{t("deleteYes")}</Button>
              <Button variant="secondary" onClick={() => setConfirmAll(false)}>
                {t("cancel")}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmAll(true)}>
              {t("deleteAll")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );

  const header = (
    <>
      <h1 className="display text-display-lg">{t("title")}</h1>
      <p className="prose-text mt-4">{t("lead")}</p>
      {store && !store.persistent ? (
        <p role="status" className="annot mt-6 border border-ink px-4 py-2 font-bold">
          {t("notStored")}
        </p>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      {status ? (
        <p aria-hidden="true" className="annot mt-6 border border-ink px-4 py-2 font-bold">
          {status}
        </p>
      ) : null}
    </>
  );

  // Loading and empty keep the header and height, so nothing shifts when the store answers.
  if (results === undefined || list.length === 0)
    return (
      <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        {header}
        <div className="mt-10 min-h-[75svh] space-y-16">
          {results === undefined ? (
            <p className="annot">{t("loading")}</p>
          ) : (
            <>
              <div>
                <p className="prose-text">{t("empty")}</p>
                <div className="mt-8">
                  <ButtonLink href="/test" size="l" arrow>
                    {t("takeTest")}
                  </ButtonLink>
                </div>
              </div>
              {dataSection(1)}
            </>
          )}
        </div>
      </div>
    );

  const latest = list.at(-1) as Reading;

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
      {header}

      {/* Header strip: count, latest, and what to do next. */}
      <div className="mt-8 grid border-2 border-ink md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:divide-x-2 md:divide-ink">
        <dl className="grid grid-cols-2 gap-px p-5">
          <div>
            <dt className="annot font-bold">{t("count")}</dt>
            <dd className="mt-1 font-mono text-4xl font-bold">{list.length}</dd>
          </div>
          <div>
            <dt className="annot font-bold">{t("latest")}</dt>
            <dd className="mt-1">{label(latest)}</dd>
            {latest.closest ? (
              <dd className="mt-1 flex items-center gap-2 font-bold">
                <SpectrumMarker id={latest.closest.entry.spectrum} size={12} />
                {latest.closest.entry.name} · {latest.closest.percent}%
              </dd>
            ) : null}
          </div>
        </dl>
        <div className="border-t-2 border-ink p-5 md:border-t-0">
          <p className="annot font-bold">{t("next")}</p>
          {next.kind === "longer" ? (
            <>
              <p className="prose-text mt-2">
                {t("suggestLonger", { count: next.extra, mode: modeName(next.mode) })}
              </p>
              <div className="mt-4">
                <Button arrow onClick={() => void continueWith(next.mode)}>
                  {t("suggestLongerButton", { count: next.extra })}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="prose-text mt-2">
                {next.kind === "lowQuality"
                  ? t("suggestLowQuality")
                  : next.kind === "stale"
                    ? t("suggestStale", { days: next.days })
                    : t("suggestNone", { days: next.kind === "none" ? next.days : 0 })}
              </p>
              <div className="mt-4">
                <ButtonLink
                  href="/test"
                  arrow
                  variant={next.kind === "none" ? "secondary" : "primary"}
                >
                  {t("retake")}
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Versioning: as taken or recomputed. */}
      <div className="mt-8 grid max-w-2xl gap-3">
        <p className="label">{t("basis")}</p>
        <Segmented<Basis>
          label={t("basis")}
          value={basis}
          onChange={setBasis}
          options={[
            { value: "recomputed", label: t("recomputed") },
            { value: "taken", label: t("asTaken") },
          ]}
        />
        <p className="annot">{anyChanged ? t("basisChanged") : t("basisSame")}</p>
      </div>

      <div className="mt-16 space-y-20">
        <section aria-labelledby="dash-axes">
          <SectionHead id="dash-axes" number={1} title={t("sections.axes")} />
          <p className="prose-text mt-6">{t("axesLead")}</p>
          <ul className="mt-6 border-t-2 border-ink">
            {AXIS_IDS.map((axis) => {
              const s = series[axis];
              const first = s[0];
              const last = s.at(-1);
              const delta = first && last && s.length > 1 ? last.score - first.score : null;
              return (
                <li
                  key={axis}
                  className="grid items-center gap-x-6 gap-y-2 border-b border-ink py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_9rem]"
                >
                  <div>
                    <p className="label">{AXES[axis].name[locale]}</p>
                    <p className="annot mt-1">
                      {t("poles", {
                        neg: AXES[axis].neg.short[locale],
                        pos: AXES[axis].pos.short[locale],
                      })}
                    </p>
                  </div>
                  <Sparkline
                    id={`spark-${axis}`}
                    points={s.map((p) => ({ ...p, t: p.date.getTime() }))}
                    description={t("sparkline", {
                      axis: AXES[axis].name[locale],
                      values: s.map((p) => `${date(p.date)} ${formatScore(p.score)}`).join(", "),
                    })}
                  />
                  <p className="font-mono text-sm sm:text-right">
                    <span className="font-bold">{last ? formatScore(last.score) : ""}</span>
                    {delta !== null ? (
                      <span className="block whitespace-nowrap">
                        {t("delta", { value: formatScore(delta) })}
                      </span>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="dash-timeline">
          <SectionHead id="dash-timeline" number={2} title={t("sections.timeline")} />
          <ol className="mt-8 border-l-2 border-ink">
            {[...list].reverse().map((r) => (
              <li key={r.result.id} className="relative py-3 pl-6">
                <span
                  aria-hidden="true"
                  className="absolute top-5 -left-[7px] h-3 w-3 border-2 border-ink bg-paper"
                />
                <p className="annot">{label(r)}</p>
                {r.closest ? (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 font-bold">
                    <SpectrumMarker id={r.closest.entry.spectrum} size={12} />
                    {r.closest.entry.name}
                    <span className="font-mono font-normal">{r.closest.percent}%</span>
                  </p>
                ) : null}
                <p className="annot mt-1 flex flex-wrap gap-x-3">
                  {r.result.lowQuality ? <span className="font-bold">{t("flagLow")}</span> : null}
                  {r.versionChanged ? <span>{t("flagVersion")}</span> : null}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="dash-drift">
          <SectionHead id="dash-drift" number={3} title={t("sections.drift")} />
          <div className="prose-text mt-6 space-y-3">
            {moved ? (
              <>
                <p>{t("driftSpan", { from: date(moved.from.date), to: date(moved.to.date) })}</p>
                <p>
                  {moved.moved.length
                    ? t("driftMoved", {
                        axes: moved.moved
                          .map((m) => `${AXES[m.axis].name[locale]} (${formatScore(m.delta)})`)
                          .join(", "),
                      })
                    : t("driftNone")}
                </p>
                <p>
                  {moved.closestChanged && moved.from.closest && moved.to.closest
                    ? t("driftClosest", {
                        from: moved.from.closest.entry.name,
                        to: moved.to.closest.entry.name,
                      })
                    : t("driftClosestSame")}
                </p>
                <p className="annot">{t("driftNote")}</p>
              </>
            ) : (
              <p>{t("driftOne")}</p>
            )}
          </div>
        </section>

        <section aria-labelledby="dash-compare">
          <SectionHead id="dash-compare" number={4} title={t("sections.compare")} />
          {list.length < 2 ? (
            <p className="prose-text mt-6">{t("compareOne")}</p>
          ) : (
            <>
              <div className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
                {(["a", "b"] as const).map((side) => (
                  <Select
                    key={side}
                    id={`compare-${side}`}
                    label={t(side === "a" ? "compareA" : "compareB")}
                    value={String(side === "a" ? aId : bId)}
                    groups={[
                      {
                        label: t("sections.timeline"),
                        options: list.map((r) => ({ value: String(r.result.id), label: label(r) })),
                      },
                    ]}
                    onChange={(v) => setPair(side === "a" ? [Number(v), bId] : [aId, Number(v)])}
                  />
                ))}
              </div>
              {comparison ? (
                <div
                  className="mt-6 max-w-full overflow-x-auto"
                  role="region"
                  aria-labelledby="dash-compare-caption"
                  tabIndex={0}
                >
                  <table className="w-full border-collapse border-2 border-ink text-left">
                    <caption id="dash-compare-caption" className="label caption-top pb-2 text-left">
                      {t("compareCaption", { distance: Math.round(comparison.meanDistance) })}
                    </caption>
                    <thead>
                      <tr className="annot border-b-2 border-ink">
                        <th scope="col" className="px-3 py-2">
                          {t("axis")}
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          {t("colA")}
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          {t("colB")}
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          {t("change")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.rows.map((row) => (
                        <tr key={row.axis} className="border-b border-ink">
                          <th scope="row" className="px-3 py-2 font-normal">
                            {AXES[row.axis].name[locale]}
                          </th>
                          <td className="px-3 py-2 text-right font-mono">{formatScore(row.a)}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatScore(row.b)}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold">
                            {formatScore(row.delta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section aria-labelledby="dash-history">
          <SectionHead id="dash-history" number={5} title={t("sections.history")} />
          <p className="prose-text mt-6">{t("notesLead")}</p>
          <ul className="mt-6 border-t-2 border-ink">
            {[...list].reverse().map((r) => (
              <li
                key={r.result.id}
                className="grid gap-4 border-b border-ink py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
              >
                <div>
                  <p className="label">{label(r)}</p>
                  {r.closest ? <p className="mt-1">{r.closest.entry.name}</p> : null}
                  <p className="annot mt-1">
                    {t("confidence", { percent: Math.round(r.result.overallConfidence * 100) })}
                    {r.result.qualityFlags.length
                      ? ` · ${r.result.qualityFlags.map((f) => t(`flags.${f}`)).join(", ")}`
                      : ""}
                  </p>
                  <p className="annot mt-1">
                    {t("versions", { engine: r.result.engineVersion, bank: r.result.bankVersion })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {confirmOne === r.result.id ? (
                      <>
                        <Button size="s" onClick={() => void deleteOne(r.result.id)}>
                          {t("deleteOneYes")}
                        </Button>
                        <Button size="s" variant="secondary" onClick={() => setConfirmOne(null)}>
                          {t("cancel")}
                        </Button>
                      </>
                    ) : (
                      <Button size="s" variant="text" onClick={() => setConfirmOne(r.result.id)}>
                        {t("deleteOne")}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor={`note-${r.result.id}`} className="label block">
                    {t("note")}
                  </label>
                  <textarea
                    id={`note-${r.result.id}`}
                    defaultValue={r.result.note ?? ""}
                    maxLength={5000}
                    rows={3}
                    onBlur={(e) => void saveNote(r.result, e.target.value)}
                    className="field-input mt-2 block w-full border-[1.5px] border-ink bg-paper px-4 py-2 font-sans text-base text-ink"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {dataSection(6)}
      </div>
    </div>
  );
}
