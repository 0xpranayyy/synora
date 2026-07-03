"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a number from ~60% of its value to the target with an
 *  ease-out curve. Respects prefers-reduced-motion. */
export function CountUp({
  value,
  decimals = 1,
  duration = 800,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(() => value * 0.6);
  const frame = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const from = value * 0.6;
    const start = performance.now();

    function tick(now: number) {
      const t = reduce ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  const fixed = display.toFixed(decimals);
  // Drop a trailing ".0" once settled so 62% doesn't render as 62.0%
  const settled = display === value;
  return <>{settled && fixed.endsWith(".0") ? value.toFixed(0) : fixed}</>;
}
