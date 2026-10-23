/**
 * Sections as bordered cells on a strict 12-column grid. The grid draws the top
 * and left rules, each cell its right and bottom, so neighbours share one 2px line.
 */
const SPAN = {
  3: "md:col-span-6 lg:col-span-3",
  4: "md:col-span-6 lg:col-span-4",
  6: "md:col-span-6",
  8: "md:col-span-12 lg:col-span-8",
  12: "",
} as const;

export function CellGrid({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}) {
  return (
    <Tag className={`grid grid-cols-12 border-t-2 border-l-2 border-ink ${className}`}>
      {children}
    </Tag>
  );
}

export function Cell({
  span = 12,
  number,
  title,
  children,
  className = "",
  as: Tag = "div",
}: {
  span?: keyof typeof SPAN;
  /** Shown as "01", "02"… beside the title. */
  number?: number;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  return (
    <Tag className={`col-span-12 border-r-2 border-b-2 border-ink p-4 ${SPAN[span]} ${className}`}>
      {number !== undefined || title ? (
        <p className="label flex gap-3">
          {number !== undefined ? <span>{String(number).padStart(2, "0")}</span> : null}
          {title ? <span>{title}</span> : null}
        </p>
      ) : null}
      {children}
    </Tag>
  );
}
