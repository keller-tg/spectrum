/**
 * Progress as one tick per question (36, 72 or 144): answered or skipped
 * questions are tall ticks, the current one is a solid block, open ones short.
 */
export function TickProgress({
  total,
  current,
  done,
  label,
}: {
  total: number;
  /** 1-based number of the question on screen. */
  current: number;
  /** Which questions already have an answer or a skip; defaults to all before `current`. */
  done?: readonly boolean[];
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
      {Array.from({ length: total }, (_, i) => {
        const isDone = done ? Boolean(done[i]) : i + 1 < current;
        return (
          <span
            key={i}
            className={`mx-auto block bg-ink ${i + 1 === current ? "h-6 w-[3px]" : isDone ? "h-4 w-px" : "h-2 w-px"}`}
          />
        );
      })}
    </div>
  );
}
