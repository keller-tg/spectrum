/**
 * A home section: numbered header ("01 / HOW IT WORKS"), a rotated running head
 * in the left margin on wide screens, generous padding, optionally an inverted
 * full-bleed band.
 */
export function Section({
  number,
  kicker,
  title,
  id,
  lead,
  invert = false,
  children,
}: {
  number: number;
  kicker: string;
  title: string;
  id: string;
  lead?: string;
  invert?: boolean;
  children: React.ReactNode;
}) {
  const nn = String(number).padStart(2, "0");
  return (
    <section aria-labelledby={id} data-invert={invert ? "" : undefined} className="section-pad">
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10 xl:grid xl:grid-cols-[2rem_minmax(0,1fr)] xl:gap-x-10">
        <p aria-hidden="true" className="vertical-label annot hidden self-start font-bold xl:block">
          {nn} / {kicker}
        </p>
        <div className="min-w-0">
          <header className="grid grid-cols-12 gap-x-6 gap-y-4 border-b-2 border-ink pb-8">
            <p className="annot col-span-12 font-bold">
              {nn} / {kicker}
            </p>
            <h2 id={id} className="display col-span-12 text-display-lg lg:col-span-9">
              {title}
            </h2>
            {lead ? <p className="prose-text col-span-12 lg:col-span-7">{lead}</p> : null}
          </header>
          <div className="mt-10 sm:mt-14">{children}</div>
        </div>
      </div>
    </section>
  );
}
