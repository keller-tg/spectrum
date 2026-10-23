/**
 * Fills that replace colour and opacity: a 45° hatch and a halftone dot.
 * Drawn in currentColor, so they follow ink in both modes and system colours
 * in forced-colours mode.
 */
export function HatchPattern({ id, gap = 5 }: { id: string; gap?: number }) {
  return (
    <pattern
      id={id}
      width={gap}
      height={gap}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <line x1="0" y1="0" x2="0" y2={gap} stroke="currentColor" strokeWidth="1" />
    </pattern>
  );
}

/** Dot radius for a density in 0…1: dot area grows with density, as in print halftone. */
export function halftoneRadius(density: number, cell: number) {
  const max = cell * 0.5;
  return max * Math.sqrt(Math.max(0, Math.min(1, density)));
}
