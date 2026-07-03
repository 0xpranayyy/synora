"use client";

import { useEffect, useState } from "react";

const WORDS = ["predict", "research", "analyze", "trade"];

export function AnimatedHeadline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % WORDS.length);
        setVisible(true);
      }, 260);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <h1 className="mt-7 text-[2.35rem] font-semibold tracking-[-0.03em] leading-[1.06] md:text-[3.15rem]">
      What do you want to
      <br />
      <span className="inline-flex min-h-[1.12em] flex-wrap items-baseline justify-center gap-x-2.5">
        <span
          className={`text-shimmer inline-block transition-all duration-350 ease-out ${
            visible
              ? "translate-y-0 opacity-100 blur-0"
              : "translate-y-3 opacity-0 blur-[2px]"
          }`}
        >
          {WORDS[index]}
        </span>
        <span className="text-foreground/95">today?</span>
      </span>
    </h1>
  );
}