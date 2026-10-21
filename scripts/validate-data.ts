/** Build gate: fails (exit 1) on any data error; prints warnings. Run by prebuild and npm run check. */
import { FAMILIES } from "@/data/families";
import { IDEOLOGIES } from "@/data/ideologies";
import { QUESTION_BANK } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import {
  validateFamilies,
  validateIdeologies,
  validateQuestions,
  type Issue,
} from "@/lib/validation/validate";

const fam = validateFamilies(FAMILIES);
const ide = validateIdeologies(IDEOLOGIES, fam.parsed);
const issues: Issue[] = [
  ...validateQuestions(QUESTION_BANK, QUESTION_TEXT_EN),
  ...fam.issues,
  ...ide.issues,
];

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");
for (const w of warnings) console.warn(`warn  ${w.where}: ${w.message}`);
for (const e of errors) console.error(`ERROR ${e.where}: ${e.message}`);
console.log(
  `\nvalidate-data: ${QUESTION_BANK.length} questions, ${fam.parsed.length} families, ${ide.parsed.length} ideologies — ${errors.length} errors, ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
