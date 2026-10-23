import { getTranslations } from "next-intl/server";
import { halftoneRadius } from "@/components/charts/patterns";
import { Section } from "./Section";

const STEPS = ["answer", "see", "explore"] as const;

/** Small 1-bit diagrams, 160×88, drawn in currentColor. */
function Diagram({ step }: { step: (typeof STEPS)[number] }) {
  if (step === "answer")
    return (
      <svg
        viewBox="0 0 160 88"
        aria-hidden="true"
        className="h-auto w-40"
        fill="none"
        stroke="currentColor"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={4 + i * 31}
            y={30}
            width="26"
            height="26"
            strokeWidth="1.5"
            fill={i === 3 ? "currentColor" : "none"}
          />
        ))}
        <path d="M104 37l12 12M116 37l-12 12" stroke="var(--paper)" strokeWidth="2" />
      </svg>
    );
  if (step === "see")
    return (
      <svg viewBox="0 0 160 88" aria-hidden="true" className="h-auto w-40" stroke="currentColor">
        {[
          [18, -38],
          [44, 22],
          [70, 52],
        ].map(([y, v]) => (
          <g key={y}>
            <path d={`M4 ${y}H156`} strokeWidth="1" />
            {Array.from({ length: 11 }, (_, k) => (
              <path
                key={k}
                d={`M${4 + k * 15.2} ${(y as number) - (k === 5 ? 6 : 3)}v${k === 5 ? 12 : 6}`}
                strokeWidth="1"
              />
            ))}
            <rect
              x={(v as number) < 0 ? 80 + ((v as number) * 76) / 100 : 80}
              y={(y as number) - 4}
              width={(Math.abs(v as number) * 76) / 100}
              height="8"
              fill="currentColor"
              stroke="none"
            />
          </g>
        ))}
      </svg>
    );
  const dots: { x: number; y: number; r: number }[] = [];
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 15; col++) {
      const x = 8 + col * 10.5;
      const y = 8 + row * 10.5;
      const d = Math.exp(-((x - 60) ** 2 / 900 + (y - 40) ** 2 / 500));
      const r = halftoneRadius(d, 9);
      if (r > 0.6) dots.push({ x, y, r });
    }
  return (
    <svg viewBox="0 0 160 88" aria-hidden="true" className="h-auto w-40">
      <g fill="currentColor">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={Math.round(d.r * 10) / 10} />
        ))}
      </g>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        <circle cx="112" cy="46" r="13" fill="var(--paper)" />
        <path d="M112 25v13M112 54v13M91 46h13M120 46h13" />
      </g>
    </svg>
  );
}

export async function HowItWorks() {
  const t = await getTranslations("home.how");
  return (
    <Section number={1} kicker={t("kicker")} title={t("title")} id="home-how">
      <ol className="grid gap-y-12 md:grid-cols-3 md:gap-x-10">
        {STEPS.map((step, i) => (
          <li key={step} className="border-t-2 border-ink pt-6">
            <p aria-hidden="true" className="font-mono text-numeral font-bold">
              {i + 1}
            </p>
            <div className="mt-8">
              <Diagram step={step} />
            </div>
            <h3 className="label mt-6">{t(`steps.${step}.title`)}</h3>
            <p className="prose-text mt-3">{t(`steps.${step}.body`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
