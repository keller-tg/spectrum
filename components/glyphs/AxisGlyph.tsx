import type { SVGProps } from "react";
import type { AxisId, PoleSide } from "@/data/axes";

/**
 * Twenty-four original pole glyphs on a 24×24 grid, stroked in currentColor.
 * They avoid real-world political or religious symbols on purpose (D-030, D-033).
 */
const GLYPHS: Record<AxisId, Record<PoleSide, React.ReactNode>> = {
  distribution: {
    // Equality: an equals sign.
    neg: <path d="M5 9h14M5 15h14" />,
    // Markets: crossing supply and demand curves.
    pos: (
      <>
        <path d="M4.5 5.5c4.5 1 10.5 7 15 13" />
        <path d="M4.5 18.5c4.5-1 10.5-7 15-13" />
      </>
    ),
  },
  ownership: {
    // Collective: three linked members.
    neg: (
      <>
        <circle cx="12" cy="6" r="2.4" />
        <circle cx="6" cy="17" r="2.4" />
        <circle cx="18" cy="17" r="2.4" />
        <path d="M10.8 8.1 7.2 14.9M13.2 8.1l3.6 6.8M8.4 17h7.2" />
      </>
    ),
    // Private: a keyhole in a frame.
    pos: (
      <>
        <rect x="5.5" y="4.5" width="13" height="15" rx="1.5" />
        <circle cx="12" cy="10.5" r="2" />
        <path d="M12 12.5v3.5" />
      </>
    ),
  },
  trade: {
    // Protectionism: a plain shield.
    neg: <path d="M12 3.5 19 6v5.2c0 4.6-3 7.9-7 9.3-4-1.4-7-4.7-7-9.3V6z" />,
    // Free trade: goods crossing a border in both directions.
    pos: (
      <>
        <path d="M12 4v16" strokeDasharray="2 2.2" />
        <path d="M4 9h14m-3-3 3 3-3 3" />
        <path d="M20 15H6m3-3-3 3 3 3" />
      </>
    ),
  },
  liberty: {
    // Liberty: an open padlock.
    neg: (
      <>
        <rect x="5" y="11" width="14" height="9" rx="1.5" />
        <path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2" />
      </>
    ),
    // Authority: a column under a pediment.
    pos: (
      <>
        <path d="M4.5 7.5 12 3.5l7.5 4z" />
        <path d="M7 10v8M12 10v8M17 10v8M4.5 20.5h15" />
      </>
    ),
  },
  centralization: {
    // Centralized: concentric rings around a core.
    neg: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    // Decentralized: a loose network of nodes.
    pos: (
      <>
        <circle cx="5.5" cy="7" r="1.8" />
        <circle cx="13" cy="4.5" r="1.8" />
        <circle cx="19" cy="10" r="1.8" />
        <circle cx="7" cy="18" r="1.8" />
        <circle cx="16.5" cy="18.5" r="1.8" />
        <path d="M7.2 6.4l4-1.3M14.6 5.6l3 3M7.6 16.6l-1.6-7.8M8.8 18.1l5.9.3M18.3 11.7l-1.3 5" />
      </>
    ),
  },
  participation: {
    // The many: a field of nine.
    neg: (
      <>
        {[6, 12, 18].flatMap((y) =>
          [6, 12, 18].map((x) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" stroke="none" />
          )),
        )}
      </>
    ),
    // The few: two figures on a raised step.
    pos: (
      <>
        <path d="M3.5 20.5h17M7.5 20.5v-6h9v6" />
        <circle cx="10" cy="10" r="1.7" />
        <circle cx="14" cy="10" r="1.7" />
      </>
    ),
  },
  tradition: {
    // Progressive: a forward arrow.
    neg: <path d="M5.5 18.5 18 6M10.5 6H18v7.5" />,
    // Traditional: an arch with its keystone.
    pos: (
      <>
        <path d="M6 20.5V12a6 6 0 0 1 12 0v8.5" />
        <path d="M10.8 3.6h2.4l-.3 2.6h-1.8z" />
        <path d="M4 20.5h16" />
      </>
    ),
  },
  religion: {
    // Secular: a written civil statute.
    neg: (
      <>
        <path d="M7 3.5h7l4 4v13H7z" />
        <path d="M14 3.5v4h4M9.5 11h6M9.5 14.2h6M9.5 17.4h4" />
      </>
    ),
    // Religious: a candle flame, shared across many traditions.
    pos: (
      <>
        <path d="M12 3c2.3 2.6 3.2 4.4 3.2 6a3.2 3.2 0 0 1-6.4 0c0-1.6.9-3.4 3.2-6z" />
        <path d="M9.8 14.5h4.4v6H9.8zM7.5 20.5h9" />
      </>
    ),
  },
  ecology: {
    // Growth: a rising line.
    neg: <path d="M4 18l5-5 4 3 7-8M15 8h5v5" />,
    // Ecological sustainability: a leaf.
    pos: (
      <>
        <path d="M5 19C5 11 10 5 19 5c0 9-5.5 14-14 14z" />
        <path d="M5 19l8.5-8.5" />
      </>
    ),
  },
  nation: {
    // Nationalism: a blank flag on a pole.
    neg: (
      <>
        <path d="M6 21V3" />
        <path d="M6 4.5h11l-2.2 3.5L17 11.5H6" />
      </>
    ),
    // Internationalism: a globe.
    pos: (
      <>
        <circle cx="12" cy="12" r="8" />
        <ellipse cx="12" cy="12" rx="3.4" ry="8" />
        <path d="M4 12h16" />
      </>
    ),
  },
  intervention: {
    // Interventionist: an arrow crossing a boundary.
    neg: (
      <>
        <path d="M13 4v16" />
        <path d="M3.5 12H19m-3.5-3.5L19 12l-3.5 3.5" />
      </>
    ),
    // Restraint: an arrow halting before a boundary.
    pos: (
      <>
        <path d="M18 4v16M20.5 4v16" />
        <path d="M3.5 12h9m-3-3 3 3-3 3" />
      </>
    ),
  },
  borders: {
    // Open: a gate swung open.
    neg: (
      <>
        <path d="M4.5 4.5v16M19.5 4.5v16" />
        <path d="M4.5 8l4 2v7.5l-4-2M19.5 8l-4 2v7.5l4-2" />
      </>
    ),
    // Closed: a shut gate.
    pos: (
      <>
        <path d="M4 4.5v16M20 4.5v16" />
        <path d="M4 9h16M4 15h16M9.3 9v6M14.7 9v6" />
      </>
    ),
  },
};

interface AxisGlyphProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  axis: AxisId;
  /** Omit for the neutral (near-centre) mark. */
  side?: PoleSide | undefined;
  size?: number;
}

export function AxisGlyph({ axis, side, size = 24, ...rest }: AxisGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {side ? (
        GLYPHS[axis][side]
      ) : (
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}
