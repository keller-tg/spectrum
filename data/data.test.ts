import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { commonsImageSchema } from "@/lib/schema/entries";
import { AXES, AXIS_IDS, CATEGORIES, CATEGORY_IDS } from "./axes";
import { IMAGES } from "./images";
import { LOCALES } from "./locales";
import { MODE_IDS, MODES } from "./modes";
import { SPECTRUM_IDS, SPECTRUM_SHAPES, SPECTRUMS } from "./spectrums";

describe("axes", () => {
  it("has twelve axes, indexed 1–12 in order", () => {
    expect(AXIS_IDS).toHaveLength(12);
    AXIS_IDS.forEach((id, i) => expect(AXES[id].index).toBe(i + 1));
  });

  it("puts every axis in exactly one category of three", () => {
    const placed = CATEGORY_IDS.flatMap((c) => CATEGORIES[c].axes);
    expect([...placed].sort()).toEqual([...AXIS_IDS].sort());
    for (const c of CATEGORY_IDS) {
      expect(CATEGORIES[c].axes).toHaveLength(3);
      for (const id of CATEGORIES[c].axes) expect(AXES[id].category).toBe(c);
    }
  });

  it("has a unique two-letter code per axis in every locale (D-077)", () => {
    for (const l of LOCALES) {
      const codes = AXIS_IDS.map((id) => AXES[id].code[l]);
      for (const code of codes) expect(code, l).toMatch(/^\p{Lu}{2}$/u);
      expect(new Set(codes).size, l).toBe(12);
    }
  });

  it("localizes every name, label and one-line tooltip", () => {
    for (const id of AXIS_IDS) {
      const axis = AXES[id];
      for (const locale of LOCALES) {
        for (const text of [
          axis.name,
          axis.measures,
          axis.neg.label,
          axis.neg.short,
          axis.neg.tooltip,
          axis.pos.label,
          axis.pos.short,
          axis.pos.tooltip,
        ]) {
          expect(text[locale].trim().length, `${id}/${locale}`).toBeGreaterThan(0);
        }
        // Tooltips are one line: a single sentence, no line breaks.
        expect(axis.neg.tooltip[locale]).not.toMatch(/\n/);
        expect(axis.pos.tooltip[locale]).not.toMatch(/\n/);
      }
    }
  });
});

describe("modes", () => {
  it("are nested prefixes with the stated per-axis counts", () => {
    for (const id of MODE_IDS) expect(MODES[id].count).toBe(MODES[id].perAxis * 12);
    expect(MODES.quick.count).toBeLessThan(MODES.standard.count);
    expect(MODES.standard.count).toBeLessThan(MODES.deep.count);
  });
});

describe("spectrums", () => {
  it("has the nine spectra with names in every locale", () => {
    expect(SPECTRUM_IDS).toHaveLength(9);
    for (const id of SPECTRUM_IDS)
      for (const l of LOCALES) expect(SPECTRUMS[id].name[l].length).toBeGreaterThan(0);
  });

  it("tells the nine spectra apart by shape and by code, never by colour (D-077)", () => {
    expect(new Set(SPECTRUM_IDS.map((id) => SPECTRUMS[id].shape)).size).toBe(9);
    expect([...SPECTRUM_IDS.map((id) => SPECTRUMS[id].shape)].sort()).toEqual(
      [...SPECTRUM_SHAPES].sort(),
    );
    for (const l of LOCALES) {
      const codes = SPECTRUM_IDS.map((id) => SPECTRUMS[id].code[l]);
      for (const code of codes) expect(code, l).toMatch(/^\p{Lu}{1,3}$/u);
      expect(new Set(codes).size, l).toBe(9);
    }
  });
});

describe("images", () => {
  it("have a source file, Commons licence data and alt text in every locale (D-078)", () => {
    for (const image of IMAGES) {
      expect(commonsImageSchema.safeParse(image).success, image.id).toBe(true);
      expect(existsSync(`data/images/${image.file}`), image.file).toBe(true);
      for (const l of LOCALES) expect(image.alt[l].length, `${image.id} ${l}`).toBeGreaterThan(10);
    }
  });
});
