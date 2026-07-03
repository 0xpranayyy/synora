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
        <div className="reveal group relative mx-auto mb-8 inline-block">
          {/* Soft ambient glow, no hard-edged backdrop — blooms on hover */}
          <div className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-br from-accent/30 via-lilac/20 to-transparent opacity-70 blur-3xl transition-all duration-500 ease-out group-hover:scale-125 group-hover:opacity-100" />
          <Image
            src="/brand/synora-wordmark.png"
            alt="Synora"
            width={320}
            height={110}
            className="relative h-auto w-[192px] opacity-[0.97] transition-all duration-500 ease-out md:w-[260px] group-hover:scale-[1.03] group-hover:opacity-100 group-hover:drop-shadow-[0_8px_28px_rgba(124,137,255,0.4)]"
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