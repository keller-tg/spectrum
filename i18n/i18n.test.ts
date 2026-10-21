import { describe, expect, it } from "vitest";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { LOCALES } from "@/data/locales";
import { MODE_IDS, MODES } from "@/data/modes";
import { modeFromSlug, translateParams } from "./params";
import { routing } from "./routing";

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else for (const [k, v] of leaves(value, path)) out.set(k, v);
  }
  return out;
}

const placeholders = (s: string) =>
  [...s.matchAll(/\{(\w+)\}|<(\w+)>/g)].map((m) => m[1] ?? m[2]).sort();

describe("messages", () => {
  const base = leaves(en as Tree);

  for (const [name, messages] of [
    ["de", de],
    ["fr", fr],
  ] as const) {
    const other = leaves(messages as Tree);

    it(`${name} has exactly the English keys`, () => {
      expect([...other.keys()].sort()).toEqual([...base.keys()].sort());
    });

    it(`${name} keeps every placeholder and tag`, () => {
      for (const [key, value] of base)
        expect(placeholders(other.get(key) ?? ""), key).toEqual(placeholders(value));
    });

    it(`${name} has no empty strings`, () => {
      for (const [key, value] of other) expect(value.trim(), key).not.toBe("");
    });
  }

  it("French uses non-breaking spaces before ; : ! ?", () => {
    for (const [key, value] of leaves(fr as Tree)) {
      expect(value, key).not.toMatch(/ [;!?]/);
      expect(value, key).not.toMatch(/ :(?=\s)/);
    }
  });

  it("German uses ß (standard German, D-053)", () => {
    const all = [...leaves(de as Tree).values()].join(" ");
    expect(all).toMatch(/ß/);
  });
});

describe("routing", () => {
  it("localized static segments are ASCII and unique per locale", () => {
    for (const locale of LOCALES) {
      const seen = new Set<string>();
      for (const value of Object.values(routing.pathnames)) {
        const path = typeof value === "string" ? value : value[locale];
        expect(path).toMatch(/^\/[a-z0-9\-/[\]]*$/);
        expect(seen.has(path), `${locale} ${path}`).toBe(false);
        seen.add(path);
      }
    }
  });

  it("mode slugs round-trip in every locale and switch language correctly", () => {
    for (const locale of LOCALES) {
      for (const id of MODE_IDS) {
        expect(modeFromSlug(locale, MODES[id].slugs[locale])).toBe(id);
      }
    }
    expect(translateParams({ locale: "de", mode: "schnell", n: "4" }, "de", "fr")).toEqual({
      mode: "rapide",
      n: "4",
    });
  });
});
