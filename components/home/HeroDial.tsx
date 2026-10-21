import { AXIS_IDS } from "@/data/axes";
import { AxisGlyph } from "@/components/glyphs/AxisGlyph";

/** A decorative example profile: shows the idea of twelve independent axes at a glance. */
const EXAMPLE = [-40, -20, 30, -60, 40, -30, -50, -70, 50, 20, 40, -40];

const C = 200;
const R = 148;

function point(i: number, value: number) {
  const angle = (i * 30 - 90) * (Math.PI / 180);
  const r = (R * (value + 100)) / 200;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}

export function HeroDial() {
  const polygon = EXAMPLE.map((v, i) => point(i, v).join(",")).join(" ");
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-auto w-full max-w-[26rem]"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="dial-field" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--paper-raised)" />
          <stop offset="100%" stopColor="var(--paper)" stopOpacity="0" />
        </radialGradient>
        <filter id="dial-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <circle cx={C} cy={C} r={190} fill="url(#dial-field)" />
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle
          key={f}
          cx={C}
          cy={C}
          r={R * f}
          fill="none"
          stroke="var(--rule)"
          strokeDasharray={f === 0.5 ? "0" : "2 5"}
        />
      ))}
      <g
        className="origin-center animate-[spin_120s_linear_infinite]"
        style={{ transformBox: "fill-box" }}
      >
        <circle
          cx={C}
          cy={C}
          r={R + 12}
          fill="none"
          stroke="var(--rule-strong)"
          strokeDasharray="1 9"
        />
      </g>

      {AXIS_IDS.map((id, i) => {
        const [x, y] = point(i, 100);
        const [gx, gy] = point(i, 129);
        return (
          <g key={id}>
            <line x1={C} y1={C} x2={x} y2={y} stroke="var(--rule-strong)" strokeWidth="0.8" />
            <AxisGlyph
              axis={id}
              side="pos"
              size={20}
              x={gx - 10}
              y={gy - 10}
              className="text-ink-2"
            />
          </g>
        );
      })}

      {/* The uncertainty halo, then the profile itself. */}
      <polygon points={polygon} fill="var(--accent)" opacity="0.16" filter="url(#dial-blur)" />
      <polygon
        points={polygon}
        fill="var(--accent)"
        fillOpacity="0.1"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {EXAMPLE.map((v, i) => {
        const [x, y] = point(i, v);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="var(--paper)"
            stroke="var(--accent)"
            strokeWidth="1.6"
          />
        );
      })}
      <circle cx={C} cy={C} r="2.5" fill="var(--ink)" />
    </svg>
  );
}
