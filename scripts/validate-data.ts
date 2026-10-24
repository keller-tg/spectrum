/** Build gate: fails (exit 1) on any data error; prints warnings. Run by prebuild and npm run check. */
import { COUNTRIES } from "@/data/countries";
import { FAMILIES } from "@/data/families";
import { FIGURES } from "@/data/figures";
import { PARTIES } from "@/data/parties";
import { REGIMES } from "@/data/regimes";
import { IDEOLOGIES } from "@/data/ideologies";
import { QUESTION_BANK } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";
import {
  validateFamilies,
  validateIdeologies,
  validateQuestions,
  type Issue,
} from "@/lib/validation/validate";
import { validateEntities } from "@/lib/validation/entities";

const fam = validateFamilies(FAMILIES);
const ide = validateIdeologies(IDEOLOGIES, fam.parsed);
const ideologyIds = new Set(ide.parsed.map((e) => e.id));
const others = [
  validateEntities("country", COUNTRIES, ideologyIds),
  validateEntities("regime", REGIMES, ideologyIds),
  validateEntities("figure", FIGURES, ideologyIds),
  validateEntities("party", PARTIES, ideologyIds),
];
const issues: Issue[] = [
  ...validateQuestions(QUESTION_BANK, QUESTION_TEXT_EN),
  ...fam.issues,
  ...ide.issues,
  ...others.flatMap((o) => o.issues),
];

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");
for (const w of warnings) console.warn(`warn  ${w.where}: ${w.message}`);
for (const e of errors) console.error(`ERROR ${e.where}: ${e.message}`);
console.log(
  `\nvalidate-data: ${QUESTION_BANK.length} questions, ${fam.parsed.length} families, ${ide.parsed.length} ideologies, ${others.map((o, i) => `${o.parsed.length} ${["countries", "regimes", "figures", "parties"][i]}`).join(", ")} — ${errors.length} errors, ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
