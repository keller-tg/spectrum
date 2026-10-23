import { Fragment } from "react";
import { AXES, CATEGORIES, CATEGORY_IDS } from "@/data/axes";
import type { Locale } from "@/data/locales";
import { AxisGlyph } from "@/components/glyphs/AxisGlyph";
import { Cell, CellGrid } from "@/components/ui/Cell";

/** Lets long pole labels such as "Representatives/experts decide" wrap after the slash. */
function breakable(label: string) {
  return label.split("/").map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? (
        <>
          /<wbr />
        </>
      ) : null}
      {part}
    </Fragment>
  ));
}

/**
 * The twelve axes as ruled cells, one domain per row: number, code and name,
 * then each pole with its glyph, its end of the scale and its one-line summary.
 */
export function AxesOverview({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-8">
      {CATEGORY_IDS.map((cat) => (
        <section key={cat} aria-labelledby={`cat-${cat}`}>
          <h3 id={`cat-${cat}`} className="label mb-2">
            {CATEGORIES[cat].name[locale]}
          </h3>
          <CellGrid as="ul">
            {CATEGORIES[cat].axes.map((id) => {
              const axis = AXES[id];
              return (
                <Cell
                  key={id}
                  as="li"
                  span={4}
                  number={axis.index}
                  title={`${axis.code[locale]} · ${axis.name[locale]}`}
                >
                  <dl className="mt-3 space-y-3">
                    {(["neg", "pos"] as const).map((side) => (
                      <div key={side}>
                        <dt className="flex items-center gap-2 font-bold">
                          <span aria-hidden="true" className="tabular-nums">
                            {side === "neg" ? "−100" : "+100"}
                          </span>
                          <AxisGlyph axis={id} side={side} size={20} className="shrink-0" />
                          <span className="min-w-0">{breakable(axis[side].label[locale])}</span>
                        </dt>
                        <dd className="mt-1 font-sans leading-normal">
                          {axis[side].tooltip[locale]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Cell>
              );
            })}
          </CellGrid>
        </section>
      ))}
    </div>
  );
}
