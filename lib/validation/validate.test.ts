import { describe, expect, it } from "vitest";
import { FAMILIES } from "@/data/families";
import { IDEOLOGIES } from "@/data/ideologies";
import { QUESTION_BANK } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import { validateFamilies, validateIdeologies, validateQuestions } from "./validate";

const errors = (issues: { level: string; where: string; message: string }[]) =>
  issues.filter((i) => i.level === "error").map((i) => `${i.where}: ${i.message}`);

describe("data validation (the same checks as prebuild)", () => {
  it("question bank has no errors", () => {
    expect(errors(validateQuestions(QUESTION_BANK, QUESTION_TEXT_EN))).toEqual([]);
  });

  it("families and ideologies have no errors", () => {
    const fam = validateFamilies(FAMILIES);
    const ide = validateIdeologies(IDEOLOGIES, fam.parsed);
    expect(errors([...fam.issues, ...ide.issues])).toEqual([]);
  });

  it("catches broken keying, mirrors and wording", () => {
    const bank = QUESTION_BANK.map((q) => (q.id === "q-dist-02" ? { ...q, key: -1 as const } : q));
    const texts = {
      ...QUESTION_TEXT_EN,
      "q-own-01": { text: "Everyone should always own everything.", explainer: "x" },
    };
    const found = errors(validateQuestions(bank, texts)).join("\n");
    expect(found).toMatch(/mirror pair must have opposite keys/);
    expect(found).toMatch(/absolute wording/);
  });
});
