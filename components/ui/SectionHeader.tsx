/** Numbered section heading: "01" in mono, the title in the heavy grotesque, a 2px rule. */
export function SectionHeader({
  number,
  title,
  id,
  as: Heading = "h2",
  children,
}: {
  number: number;
  title: React.ReactNode;
  id?: string;
  as?: "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b-2 border-ink pb-3">
      <div className="flex items-baseline gap-4">
        <span aria-hidden="true" className="label shrink-0">
          {String(number).padStart(2, "0")}
        </span>
        <Heading id={id} className="display text-display-md">
          {title}
        </Heading>
      </div>
      {children ? <div className="prose-text mt-3 pl-10">{children}</div> : null}
    </div>
  );
}
