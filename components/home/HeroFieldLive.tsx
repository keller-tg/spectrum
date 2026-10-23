"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface FieldPoint {
  id: string;
  name: string;
  code: string;
  /** Position in the figure's viewBox. */
  x: number;
  y: number;
  /** Rounded scores on the map's first two components. */
  pc1: number;
  pc2: number;
}

/** Stepped drift: 10 frames a second, a few viewBox units, deterministic per entry. */
const FPS = 10;
const PERIOD = 90;
const AMPLITUDE = 2.2;

function phaseOf(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** Offset of one entry at a frame; zero at frame 0, which is the server-rendered picture. */
function drift(phase: number, frame: number): [number, number] {
  const tau = 2 * Math.PI;
  const dx = AMPLITUDE * (Math.sin(tau * (frame / PERIOD + phase)) - Math.sin(tau * phase));
  const dy =
    AMPLITUDE *
    (Math.cos(tau * (frame / (PERIOD * 1.3) + phase * 1.7)) - Math.cos(tau * phase * 1.7));
  return [dx, dy];
}

const fmt = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");

/**
 * The live layer over the server-rendered field: drift (static with reduced
 * motion, paused off screen or in a background tab), a crosshair snapping to
 * the nearest ideology with a mono readout, click or tap to jump to its index
 * entry, and arrow keys to step through entries from the keyboard.
 */
export function HeroFieldLive({
  points,
  size,
  labels,
}: {
  points: readonly FieldPoint[];
  size: number;
  labels: { nearest: string; keyboard: string; open: string; pc1: string; pc2: string };
}) {
  const layer = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const activeRef = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [frame, setFrame] = useState(0);
  const [spoken, setSpoken] = useState("");
  const phases = useMemo(() => points.map((p) => phaseOf(p.id)), [points]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Drift: moves the server-rendered markers and labels directly (no re-render).
  useEffect(() => {
    const host = layer.current?.parentElement;
    if (!host) return;
    const markers = [...host.querySelectorAll<SVGElement>("[data-field-marker]")];
    const tags = [...host.querySelectorAll<HTMLElement>("[data-field-label]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;

    const step = () => {
      const f = ++frameRef.current;
      for (const marker of markers) {
        const [dx, dy] = drift(phases[Number(marker.dataset.fieldMarker)] ?? 0, f);
        marker.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      }
      for (const tag of tags) {
        const [dx, dy] = drift(phases[Number(tag.dataset.fieldLabel)] ?? 0, f);
        // 1 viewBox unit = 100/size cqw of the figure.
        tag.style.transform = `translate(${((dx * 100) / size).toFixed(3)}cqw, ${((dy * 100) / size).toFixed(3)}cqw)`;
      }
      if (activeRef.current !== null) setFrame(f);
    };
    const sync = () => {
      const run = visible && !reduce.matches && document.visibilityState === "visible";
      if (run && !timer) timer = setInterval(step, 1000 / FPS);
      if (!run && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(host);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      if (timer) clearInterval(timer);
    };
  }, [phases, size]);

  const at = (i: number, f: number) => {
    const p = points[i] as FieldPoint;
    const [dx, dy] = drift(phases[i] ?? 0, f);
    return [p.x + dx, p.y + dy] as const;
  };

  const select = (i: number | null) => {
    setFrame(frameRef.current);
    setActive(i);
  };

  const nearest = (clientX: number, clientY: number) => {
    const box = layer.current?.getBoundingClientRect();
    if (!box) return null;
    const x = ((clientX - box.left) / box.width) * size;
    const y = ((clientY - box.top) / box.height) * size;
    let best = 0;
    let bestD = Infinity;
    points.forEach((_, i) => {
      const [px, py] = at(i, frameRef.current);
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const open = (i: number) => {
    const p = points[i];
    if (p) window.location.hash = `idx-${p.id}`;
  };

  const readout = (p: FieldPoint) =>
    `${p.code} · ${labels.pc1} ${fmt(p.pc1)} · ${labels.pc2} ${fmt(p.pc2)}`;

  const byAxis = (key: "pc1" | "pc2") =>
    points
      .map((_, i) => i)
      .sort((a, b) => (points[a] as FieldPoint)[key] - (points[b] as FieldPoint)[key]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
      const order = byAxis(horizontal ? "pc1" : "pc2");
      const forward = event.key === "ArrowRight" || event.key === "ArrowUp";
      const pos = active === null ? -1 : order.indexOf(active);
      const next =
        order[(pos + (forward ? 1 : -1) + order.length) % order.length] ?? (order[0] as number);
      select(next);
      const p = points[next] as FieldPoint;
      setSpoken(`${p.name} · ${readout(p)}`);
    } else if (event.key === "Enter" && active !== null) {
      open(active);
    } else if (event.key === "Escape") {
      select(null);
    }
  };

  const point = active !== null ? at(active, frame) : null;
  const current = active !== null ? (points[active] as FieldPoint) : null;

  return (
    <div
      ref={layer}
      tabIndex={0}
      role="group"
      aria-label={labels.keyboard}
      className="absolute inset-0 cursor-crosshair touch-manipulation"
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") select(nearest(e.clientX, e.clientY));
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") select(null);
      }}
      onPointerUp={(e) => {
        const i = nearest(e.clientX, e.clientY);
        if (i === null) return;
        if (e.pointerType === "mouse" || active === i) open(i);
        else select(i);
      }}
      onKeyDown={onKeyDown}
      onBlur={() => select(null)}
    >
      {point ? (
        <svg
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d={`M${point[0]} 0V${size}M0 ${point[1]}H${size}`} />
            <rect x={point[0] - 11} y={point[1] - 11} width="22" height="22" strokeWidth="1.5" />
          </g>
        </svg>
      ) : null}
      {current ? (
        <p
          aria-hidden="true"
          className="annot pointer-events-none absolute top-2 left-2 max-w-[calc(100%-1rem)] border border-ink bg-paper px-2 py-1"
        >
          <span className="block font-bold">
            {labels.nearest}: {current.name}
          </span>
          <span className="block">{readout(current)}</span>
          <span className="block">{labels.open}</span>
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {spoken}
      </p>
    </div>
  );
}
