export interface Column {
  key: string;
  header: React.ReactNode;
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  className?: string;
}

/**
 * A ruled table: 2px frame and header rule, 1px hairlines between rows. On
 * narrow screens the table scrolls inside its own focusable region, never the page.
 */
export function Table({
  id,
  caption,
  columns,
  rows,
  className = "",
}: {
  /** Unique per page; labels the scroll region by the caption. */
  id: string;
  caption: React.ReactNode;
  columns: readonly Column[];
  rows: readonly (readonly React.ReactNode[])[];
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-labelledby={`${id}-caption`}
      tabIndex={0}
      className={`max-w-full overflow-x-auto ${className}`}
    >
      <table className="w-full border-collapse border-2 border-ink text-left">
        <caption id={`${id}-caption`} className="label caption-top pb-2 text-left">
          {caption}
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`label px-3 py-2 align-bottom ${col.numeric ? "text-right" : ""} ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-ink last:border-b-0">
              {row.map((cell, c) => {
                const col = columns[c];
                const Tag = c === 0 ? "th" : "td";
                return (
                  <Tag
                    key={col?.key ?? c}
                    scope={c === 0 ? "row" : undefined}
                    className={`px-3 py-2 align-top ${c === 0 ? "font-bold" : ""} ${col?.numeric ? "text-right tabular-nums" : ""} ${col?.className ?? ""}`}
                  >
                    {cell}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
