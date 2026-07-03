import type { PricePoint } from "@/lib/types";

/** Animated area sparkline. Values are probabilities 0–1 or 0–100. */
export function Sparkline({
  data,
  width = 110,
  height = 36,
  animate = true,
  id,
}: {
  data: number[];
  width?: number;
  height?: number;
  animate?: boolean;
  id: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;

  const coords = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const rising = data[data.length - 1] >= data[0];
  const gradientId = `spark-${id}`;

  // Rough path length for the draw animation
  const approxLength = width * 1.4;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={rising ? "text-mint" : "text-rose"}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pad},${height - pad} ${line} ${(width - pad).toFixed(1)},${height - pad}`}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "sparkline-path" : undefined}
        style={
          animate
            ? ({ "--line-length": approxLength } as React.CSSProperties)
            : undefined
        }
      />
    </svg>
  );
}

export function historyToSeries(history: PricePoint[], points = 40): number[] {
  if (history.length === 0) return [];
  if (history.length <= points) return history.map((h) => h.p);
  const step = (history.length - 1) / (points - 1);
  return Array.from(
    { length: points },
    (_, i) => history[Math.round(i * step)].p
  );
}
