import type { PricePoint } from "@/lib/types";

/** Full-width animated area chart of YES probability. */
export function PriceChart({ history }: { history: PricePoint[] }) {
  if (history.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-faint">
        Not enough price history yet.
      </p>
    );
  }

  const width = 800;
  const height = 180;
  const pad = { top: 12, right: 8, bottom: 24, left: 42 };

  const values = history.map((h) => h.p * 100);
  const min = Math.max(0, Math.min(...values) - 2);
  const max = Math.min(100, Math.max(...values) + 2);
  const range = max - min || 1;

  const coords = history.map((h, i) => ({
    x: pad.left + (i / (history.length - 1)) * (width - pad.left - pad.right),
    y:
      pad.top +
      (1 - (h.p * 100 - min) / range) * (height - pad.top - pad.bottom),
  }));
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const rising = values[values.length - 1] >= values[0];

  const firstDate = label(history[0].t);
  const lastDate = label(history[history.length - 1].t);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${rising ? "text-mint" : "text-rose"}`}
      role="img"
      aria-label="YES probability history"
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines + axis labels */}
      {[min, (min + max) / 2, max].map((v) => {
        const y =
          pad.top + (1 - (v - min) / range) * (height - pad.top - pad.bottom);
        return (
          <g key={v}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke="var(--grid-line)"
              strokeDasharray="3 5"
            />
            <text
              x={pad.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-[var(--faint)]"
              fontSize="10"
              fontFamily="var(--font-jetbrains-mono)"
            >
              {v.toFixed(0)}%
            </text>
          </g>
        );
      })}

      <polygon
        points={`${coords[0].x},${height - pad.bottom} ${line} ${coords[coords.length - 1].x},${height - pad.bottom}`}
        fill="url(#chart-fill)"
      />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-path"
        style={{ "--line-length": 1200 } as React.CSSProperties}
      />
      {/* Latest point */}
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="3.5"
        fill="currentColor"
      />

      <text x={pad.left} y={height - 6} fontSize="10" className="fill-[var(--faint)]" fontFamily="var(--font-jetbrains-mono)">
        {firstDate}
      </text>
      <text x={width - pad.right} y={height - 6} textAnchor="end" fontSize="10" className="fill-[var(--faint)]" fontFamily="var(--font-jetbrains-mono)">
        {lastDate}
      </text>
    </svg>
  );
}

function label(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
