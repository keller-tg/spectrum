import type { DitheredImage } from "@/data/images";
import type { Locale } from "@/data/locales";

/**
 * A photo as a 1-bit ordered-dither image (made at build time by
 * scripts/build-images.ts), framed, with author, licence and source always
 * visible underneath (D-032, D-078).
 */
export function FigureImage({
  image,
  locale,
  sourceLabel,
  className = "",
}: {
  image: DitheredImage;
  locale: Locale;
  sourceLabel: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      {/* A plain img on purpose: the file is already 1-bit and sized; resampling would add greys. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${image.id}.png`}
        width={image.width}
        height={image.height}
        alt={image.alt[locale]}
        loading="lazy"
        decoding="async"
        className="dithered block h-auto w-full border-2 border-ink"
      />
      <figcaption className="label mt-2 leading-normal">
        {image.author} · {image.license} ·{" "}
        <a href={image.sourceUrl} className="link" rel="noreferrer">
          {sourceLabel}
        </a>
      </figcaption>
    </figure>
  );
}
