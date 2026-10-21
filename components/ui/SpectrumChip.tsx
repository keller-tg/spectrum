import type { Locale } from "@/data/locales";
import { SPECTRUMS, type SpectrumId } from "@/data/spectrums";

/** Spectrum label with its tint; colour always travels with the written name. Text stays ink for contrast. */
export function SpectrumChip({ id, locale }: { id: SpectrumId; locale: Locale }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-ink"
      style={{
        borderColor: `color-mix(in srgb, var(--sp-${id}) 45%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(--sp-${id}) 9%, transparent)`,
      }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: `var(--sp-${id})` }}
      />
      {SPECTRUMS[id].name[locale]}
    </span>
  );
}
