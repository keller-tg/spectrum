/** The Spectrum glyph: a framed field with one solid square, a position on a grid. */
export function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="4" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

/** Glyph plus the name in plain mono capitals; below 360px only the glyph (the link carries the name). */
export function Wordmark({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-mono font-bold tracking-[0.12em] uppercase">
      <Mark size={size} />
      <span className="max-[359px]:hidden">{name}</span>
    </span>
  );
}
