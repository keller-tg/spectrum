/** The Spectrum mark: a twelve-tick dial, one tick in the accent (you). */
export function Mark({ size = 28 }: { size?: number }) {
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {ticks.map((i) => (
        <line
          key={i}
          x1="16"
          y1="4.5"
          x2="16"
          y2={i === 2 ? 11.5 : 8}
          stroke={i === 2 ? "var(--accent)" : "currentColor"}
          strokeWidth={i === 2 ? 2.2 : 1.4}
          strokeLinecap="round"
          transform={`rotate(${i * 30} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}
