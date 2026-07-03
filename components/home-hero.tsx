"use client";

import Image from "next/image";
import { AnimatedHeadline } from "@/components/animated-headline";
import { HomeSearch } from "@/components/home-search";
import { formatUsd } from "@/lib/polymarket";

export function HomeHero({
  suggestions,
  totalVolume24h,
}: {
  suggestions: string[];
  totalVolume24h: number;
}) {
  return (
    <section className="relative pt-4 md:pt-8">
      <div className="relative text-center">
        {/* Fixed dark tile regardless of theme — the wordmark's chrome
            palette needs a dark backdrop; it's unreadable directly on the
            light theme's near-white page background. */}
        <div className="reveal mx-auto mb-8 inline-block rounded-3xl bg-[#14161f] px-8 py-5 shadow-[0_14px_32px_-8px_rgba(11,13,19,0.35)] dark:shadow-[0_16px_36px_-8px_rgba(124,137,255,0.18)]">
          <Image
            src="/brand/synora-wordmark.png"
            alt="Synora"
            width={320}
            height={110}
            className="h-auto w-[192px] opacity-[0.97] md:w-[260px]"
            priority
          />
        </div>

        <div className="reveal d-1 mx-auto flex w-fit flex-wrap items-center justify-center gap-2.5">
          <span className="glass-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-accent-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint shadow-[0_0_8px_rgba(65,214,165,0.55)]" />
            </span>
            Live Polymarket data
          </span>
          {totalVolume24h > 0 && (
            <span className="glass-pill px-4 py-2 font-mono text-xs text-muted">
              <span className="text-faint">24h vol </span>
              <span className="text-foreground/90">{formatUsd(totalVolume24h)}</span>
            </span>
          )}
        </div>

        <div className="reveal d-2">
          <AnimatedHeadline />
        </div>

        <p className="reveal d-3 mx-auto mt-5 max-w-lg text-[16px] leading-[1.65] text-muted">
          Ask a question. Get probabilities, evidence, and AI insight
          <span className="text-shimmer-soft"> before you trade</span>.
        </p>
      </div>

      <div className="reveal d-4 relative mx-auto mt-12 max-w-2xl">
        <HomeSearch suggestions={suggestions} />
      </div>
    </section>
  );
}