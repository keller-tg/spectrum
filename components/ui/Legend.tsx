import type { Locale } from "@/data/locales";
import { SPECTRUM_LIST } from "@/data/spectrums";
import { SpectrumMarker } from "@/components/charts/SpectrumMarker";

/** The nine spectra: shape, code and name, always together. */
export function SpectrumLegend({ locale, title }: { locale: Locale; title: string }) {
  return (
    <figure>
      <figcaption className="label mb-2">{title}</figcaption>
      <ul className="grid grid-cols-1 border-t-2 border-l-2 border-ink sm:grid-cols-3">
        {SPECTRUM_LIST.map((s) => (
          <li
            key={s.id}
            className="flex min-h-11 items-center gap-3 border-r-2 border-b-2 border-ink px-3 py-2"
          >
            <SpectrumMarker id={s.id} size={18} />
            <span className="label w-7 shrink-0">{s.code[locale]}</span>
            <span>{s.name[locale]}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface LegendItem {
  key: string;
  swatch: React.ReactNode;
  label: React.ReactNode;
}

/** Any other key: a small drawn sample next to its meaning. */
export function Legend({ title, items }: { title: string; items: readonly LegendItem[] }) {
  return (
    <figure>
      <figcaption className="label mb-2">{title}</figcaption>
      <ul className="border-t-2 border-l-2 border-ink">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex min-h-11 items-center gap-4 border-r-2 border-b-2 border-ink px-3 py-2"
          >
            <span aria-hidden="true" className="flex w-16 shrink-0 justify-center">
              {item.swatch}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
