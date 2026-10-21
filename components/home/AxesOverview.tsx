import { AXES, CATEGORIES, CATEGORY_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { AxisGlyph } from "@/components/glyphs/AxisGlyph";

export function AxesOverview({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-x-12 gap-y-14 lg:grid-cols-2">
      {CATEGORY_IDS.map((cat) => (
        <section key={cat} aria-labelledby={`cat-${cat}`}>
          <h3
            id={`cat-${cat}`}
            className="display border-b border-rule-strong pb-2 text-2xl text-ink"
          >
            {CATEGORIES[cat].name[locale]}
          </h3>
          <ul className="divide-y divide-rule">
            {CATEGORIES[cat].axes.map((id) => {
              const axis = AXES[id];
              return (
                <li key={id} className="py-5">
                  <p className="kicker tabular">
                    <span className="text-ink-3">{String(axis.index).padStart(2, "0")}</span>
                    <span className="ml-2">{axis.name[locale]}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-ink">
                        <AxisGlyph axis={id} side="neg" size={20} className="shrink-0 text-ink-2" />
                        {axis.neg.label[locale]}
                      </p>
                      <p className="mt-1 text-[0.82rem] leading-snug text-ink-2">
                        {axis.neg.tooltip[locale]}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-2.5 block h-px w-6 bg-rule-strong sm:w-10"
                    />
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-2 font-semibold text-ink">
                        {axis.pos.label[locale]}
                        <AxisGlyph axis={id} side="pos" size={20} className="shrink-0 text-ink-2" />
                      </p>
                      <p className="mt-1 text-[0.82rem] leading-snug text-ink-2">
                        {axis.pos.tooltip[locale]}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
