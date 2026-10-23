/**
 * The shared wipe (D-083). Put it as the last child of an element with the
 * `wipe-host` class: an aria-hidden panel slides over the host and inverts it
 * with a difference blend, so no content is duplicated and fill and label
 * always flip together. Direction, timing and states live in app/controls.css
 * and <WipeDirection />; components never animate a wipe themselves.
 */
export function Wipe() {
  return (
    <span className="wipe" aria-hidden="true">
      <span className="wipe-panel" />
    </span>
  );
}
