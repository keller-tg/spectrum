/**
 * Progress as one tick per question (36, 72 or 144): answered ticks are tall,
 * the current one is a solid block, the rest are short.
 */
export function TickProgress({
  total,
  current,
  label,
}: {
  total: number;
  /** 1-based number of the question on screen. */
  current: number;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="grid h-6 items-end"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`mx-auto block bg-ink ${i + 1 < current ? "h-4 w-px" : i + 1 === current ? "h-6 w-[3px]" : "h-2 w-px"}`}
        />
      ))}
    </div>
  );
}
