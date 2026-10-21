/** Writes docs/question-bank.md: the full bank in display order and grouped by axis, for review. */
import { writeFileSync } from "node:fs";
import { AXES, AXIS_IDS } from "@/data/axes";
import { MODES } from "@/data/modes";
import { QUESTION_BANK } from "@/data/questions/bank";
import { QUESTION_TEXT_EN } from "@/data/questions/text.en";

const active = QUESTION_BANK.filter((q) => !q.retired).sort((a, b) => a.order - b.order);
const mode = (order: number) =>
  order <= MODES.quick.count ? "Quick" : order <= MODES.standard.count ? "Standard" : "Deep";
const pole = (axis: (typeof AXIS_IDS)[number], key: 1 | -1) =>
  (key === 1 ? AXES[axis].pos : AXES[axis].neg).label.en;
const text = (id: string) => QUESTION_TEXT_EN[id]?.text ?? "(missing)";
const explainer = (id: string) => QUESTION_TEXT_EN[id]?.explainer ?? "";

const lines: string[] = [
  "# Question bank (English)",
  "",
  `Generated from \`data/questions\` by \`npm run export:questions\`. ${active.length} questions: Quick = 1–${MODES.quick.count}, Standard = 1–${MODES.standard.count}.`,
  'During the test, respondents see only the statement, the scale and the "?" explainer, never the axis or the pole.',
  "",
  "## In the order respondents see them",
  "",
  "| # | Mode | Statement | Axis | Agree → | Mirror of |",
  "|---|---|---|---|---|---|",
  ...active.map(
    (q) =>
      `| ${q.order} | ${mode(q.order)} | ${text(q.id)} | ${AXES[q.axis].index}. ${AXES[q.axis].name.en} | ${pole(q.axis, q.key)} | ${q.mirrorOf ? QUESTION_BANK.find((m) => m.id === q.mirrorOf)?.order : ""} |`,
  ),
  "",
  "## Grouped by axis, with explainers",
  "",
];
for (const axis of AXIS_IDS) {
  const def = AXES[axis];
  lines.push(
    `### ${def.index}. ${def.name.en}: ${def.neg.label.en} ↔ ${def.pos.label.en}`,
    "",
    `*Measures:* ${def.measures.en}`,
    "",
  );
  for (const q of active.filter((x) => x.axis === axis)) {
    lines.push(
      `- **#${q.order}** (${mode(q.order)}, agree → ${pole(axis, q.key)}${q.mirrorOf ? `, mirror of #${QUESTION_BANK.find((m) => m.id === q.mirrorOf)?.order}` : ""}) ${text(q.id)}`,
      `  - ?: ${explainer(q.id)}`,
    );
  }
  lines.push("");
}
writeFileSync("docs/question-bank.md", lines.join("\n"));
console.log(`docs/question-bank.md: ${active.length} questions`);
