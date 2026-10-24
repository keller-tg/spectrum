/**
 * Build-time photo processing (D-078). Every entry in data/images.ts becomes a
 * 1-bit PNG in public/images/: greyscale, contrast-normalised, resized to its
 * output size, then thresholded against an 8×8 Bayer matrix (ordered dither).
 * Only pure ink and pure paper pixels remain, and the files stay small.
 * Outputs are build artefacts (gitignored); prebuild runs this script.
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";
import { FIGURES } from "../data/figures";
import { IMAGES } from "../data/images";

/** Figure portraits share one size, so every card lines up. */
const PORTRAIT = { width: 240, height: 300 } as const;

const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

export function orderedDither(grey: Uint8Array, width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const threshold = (((BAYER_8[(y % 8) * 8 + (x % 8)] as number) + 0.5) / 64) * 255;
      out[i] = (grey[i] as number) > threshold ? 255 : 0;
    }
  return out;
}

async function main() {
  mkdirSync("public/images", { recursive: true });
  const jobs = [
    ...IMAGES.map((i) => ({
      id: i.id,
      file: i.file,
      width: i.width,
      height: i.height,
      position: "centre",
    })),
    ...FIGURES.flatMap((f) =>
      // Portraits crop to the most salient region (the face), not the geometric centre.
      f.image
        ? [{ id: `figure-${f.id}`, file: f.image.file, ...PORTRAIT, position: "attention" }]
        : [],
    ),
  ];
  for (const image of jobs) {
    const { data, info } = await sharp(`data/images/${image.file}`)
      .greyscale()
      .resize({ width: image.width, height: image.height, fit: "cover", position: image.position })
      .normalise()
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.channels !== 1) throw new Error(`${image.id}: expected one channel`);
    const bits = orderedDither(new Uint8Array(data), info.width, info.height);
    const out = await sharp(Buffer.from(bits), {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
      .png({ palette: true, colours: 2, dither: 0, compressionLevel: 9 })
      .toFile(`public/images/${image.id}.png`);
    console.log(`build-images: ${image.id} ${out.width}×${out.height}, ${out.size} bytes`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
