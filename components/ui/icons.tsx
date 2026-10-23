/** 1.5px-stroke glyphs drawn in currentColor. Decorative: always aria-hidden. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M1.5 7h10M8 3.5 11.5 7 8 10.5" />
    </svg>
  );
}

/** The arrow and its copy for the roll on hover (see .roll in controls.css). */
export function RollingArrow() {
  return (
    <span className="roll" aria-hidden="true">
      <ArrowGlyph />
      <ArrowGlyph />
    </span>
  );
}

export function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M2 7.5 5.5 11 12 3.5" />
    </svg>
  );
}

/** Small up-right arrow for links that leave the site. */
export function ExternalGlyph({ className = "link-ext" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" />
    </svg>
  );
}
