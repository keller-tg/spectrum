import { getTranslations } from "next-intl/server";
import { SpectrumMarker } from "@/components/charts/SpectrumMarker";
import type { Locale } from "@/data/locales";
import { SPECTRUM_LIST, SPECTRUMS } from "@/data/spectrums";
import { loadIdeologies } from "@/lib/catalog/ideologies";
import { anchorId } from "./HeroField";
import { Section } from "./Section";

/**
 * A book-style index: entries A–Z under letter heads, dotted leaders, the
 * spectrum shape and code on the right; counts per spectrum on top. Entries
 * are not links until their pages exist (Phase 5), so they have no hover.
 */
export async function IdeologyIndex({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.index");
  const entries = loadIdeologies()
    .filter((e) => !e.tags.includes("online-satirical"))
    .map((e) => ({ id: e.id, name: e.names[locale] ?? e.names.en, spectrum: e.spectrum }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  const groups = new Map<string, typeof entries>();
  for (const e of entries) {
    const letter = e.name.charAt(0).toLocaleUpperCase(locale);
    groups.set(letter, [...(groups.get(letter) ?? []), e]);
  }

  return (
    <Section
      number={3}
      kicker={t("kicker")}
      title={t("title")}
      lead={t("lead", { count: entries.length })}
      id="home-index"
    >
      <h3 className="annot font-bold">{t("counts")}</h3>
      <ul className="mt-3 grid grid-cols-1 border-t border-l border-ink sm:grid-cols-3 lg:grid-cols-9">
        {SPECTRUM_LIST.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-2 border-r border-b border-ink px-3 py-3 lg:flex-col lg:items-start"
          >
            <span className="flex items-center gap-2">
              <SpectrumMarker id={s.id} size={14} />
              <span className="annot font-bold">{s.code[locale]}</span>
            </span>
            <span className="text-sm lg:min-h-10">{s.name[locale]}</span>
            <span className="ml-auto font-mono text-2xl font-bold lg:ml-0">
              {entries.filter((e) => e.spectrum === s.id).length}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-12 columns-1 gap-12 sm:columns-2 lg:columns-3">
        {[...groups].map(([letter, items]) => (
          <section key={letter} aria-label={letter} className="mb-8 break-inside-avoid">
            <p aria-hidden="true" className="display border-b-2 border-ink pb-1 text-3xl">
              {letter}
            </p>
            <ul>
              {items.map((e) => (
                <li
                  key={e.id}
                  id={anchorId(e.id)}
                  className="flex min-h-10 items-baseline gap-2 border-b border-ink py-2 target:bg-ink target:px-2 target:text-paper"
                >
                  <span>{e.name}</span>
                  <span
                    aria-hidden="true"
                    className="min-w-4 flex-1 border-b border-dotted border-current"
                  />
                  <span className="flex shrink-0 items-center gap-1.5 self-center">
                    <SpectrumMarker id={e.spectrum} size={12} />
                    <span className="annot font-bold">{SPECTRUMS[e.spectrum].code[locale]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
