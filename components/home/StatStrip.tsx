import { getTranslations } from "next-intl/server";
import { AXIS_IDS } from "@/data/axes";
import { MODE_IDS, MODES } from "@/data/modes";
import { loadIdeologies } from "@/lib/catalog/ideologies";

/** Four ruled cells with huge mono numerals, all counted from the data at build time. */
export async function StatStrip() {
  const t = await getTranslations("home.stats");
  const ideologies = loadIdeologies().filter((e) => !e.tags.includes("online-satirical")).length;
  const stats = [
    { key: "axes", value: String(AXIS_IDS.length), small: false },
    { key: "ideologies", value: String(ideologies), small: false },
    { key: "questions", value: MODE_IDS.map((m) => MODES[m].count).join("/"), small: true },
    { key: "accounts", value: "0", small: false },
  ] as const;
  return (
    <section aria-label={t("label")} className="border-b-2 border-ink">
      <dl className="mx-auto grid max-w-[96rem] grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.key}
            className={`flex flex-col-reverse justify-between gap-6 border-ink px-4 py-8 sm:px-6 lg:px-10 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
          >
            <dt className="annot">{t(s.key)}</dt>
            <dd
              className={`flex h-[clamp(3.5rem,9vw,8.5rem)] items-end font-mono leading-[0.8] font-bold tracking-[-0.04em] ${s.small ? "text-[clamp(1.25rem,3.3vw,3.5rem)]" : "text-[clamp(3.5rem,9vw,8.5rem)]"}`}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
