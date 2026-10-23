/**
 * Generated entry glyph (D-033): a 5×5 mirror-symmetric pattern of squares
 * derived from the entry id. Original by construction, no symbols, no faces.
 */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function EntryGlyph({ id, size = 40 }: { id: string; size?: number }) {
  const bits = hash(id);
  const cells: [number, number][] = [];
  // 15 bits fill columns 0–2; columns 3–4 mirror 1–0.
  for (let col = 0; col < 3; col++)
    for (let row = 0; row < 5; row++)
      if ((bits >> (col * 5 + row)) & 1) {
        cells.push([col, row]);
        if (col < 2) cells.push([4 - col, row]);
      }
  return (
    <svg
      viewBox="0 0 7 7"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      <rect
        x="0.5"
        y="0.5"
        width="6"
        height="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.35"
      />
      {cells.map(([c, r]) => (
        <rect key={`${c}-${r}`} x={1 + c} y={1 + r} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
