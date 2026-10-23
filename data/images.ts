import type { CommonsImage } from "@/lib/schema/entries";
import type { Localized } from "./locales";

/**
 * Photos used on the site. Each source file sits in data/images/ and becomes a
 * 1-bit ordered-dither PNG at build time (scripts/build-images.ts, D-078).
 * Licence data comes from the Commons API, never typed from memory (D-032).
 */
export interface DitheredImage extends CommonsImage {
  id: string;
  /** Output size in pixels; the dither is computed at exactly this size. */
  width: number;
  height: number;
  alt: Localized;
}

export const IMAGES: readonly DitheredImage[] = [
  {
    id: "john-stuart-mill",
    file: "john-stuart-mill.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:John_Stuart_Mill_by_London_Stereoscopic_Company,_c1870.jpg",
    author: "London Stereoscopic Company",
    license: "PD",
    attribution: "London Stereoscopic Company, c. 1870 (Hulton Archive), public domain",
    width: 320,
    height: 402,
    alt: {
      en: "Portrait photograph of John Stuart Mill, about 1870.",
      de: "Porträtfotografie von John Stuart Mill, um 1870.",
      fr: "Portrait photographique de John Stuart Mill, vers 1870.",
    },
  },
];

export const IMAGE_BY_ID = new Map(IMAGES.map((image) => [image.id, image]));
