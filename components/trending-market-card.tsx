/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { formatUsd } from "@/lib/polymarket";
import type { Market } from "@/lib/types";

type TrendingMarketCardProps = {
  market: Market;
  rank: number;
  badge?: "trending" | "hot" | "featured";
  revealDelay?: number;
};

export function TrendingMarketCard({
  market,
  rank,
  badge = "trending",
  revealDelay,
}: TrendingMarketCardProps) {
  const rising = market.change24h >= 0;
  const showEvent =
    market.eventTitle && market.eventTitle !== market.question;

  return (
    <Link
      href={`/market/${market.slug}`}
      className={`premium-card group relative block overflow-hidden ${
        revealDelay !== undefined ? `reveal d-${Math.min(revealDelay, 6)}` : ""
      }`}
    >
      <div className="premium-card-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4 p-5">
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <span className="rank-badge font-mono text-[11px] font-bold">
            {rank}
          </span>
          {market.image ? (
            <img
              src={market.image}
              alt=""
              className="h-12 w-12 rounded-[14px] border border-border/80 object-cover shadow-[var(--shadow-card)] transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-border bg-accent-soft text-sm font-semibold text-accent-ink">
              {market.question.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge kind={badge} />
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-faint">
              {showEvent ? market.eventTitle : "Market"}
            </span>
          </div>
          <h3 className="mt-2 font-medium leading-snug tracking-[-0.01em] text-[15px] line-clamp-2 transition-colors duration-300 group-hover:text-accent-ink">
            {market.question}
          </h3>
          <p className="mt-2.5 font-mono text-[11px] text-muted">
            24h {formatUsd(market.volume24hUsd)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-mono text-[26px] font-semibold leading-none tracking-tight">
            <CountUp value={market.probability} />
            <span className="ml-0.5 text-sm text-faint">%</span>
          </div>
          <div
            className={`mt-2.5 inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${
              rising ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
            }`}
          >
            {rising ? "↑" : "↓"} {Math.abs(market.change24h).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="h-[5px] overflow-hidden rounded-full bg-accent-soft/80">
          <div
            className="prob-bar h-full rounded-full bg-gradient-to-r from-accent via-accent-ink to-lilac"
            style={{ width: `${market.probability}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function Badge({ kind }: { kind: "trending" | "hot" | "featured" }) {
  const styles = {
    trending: "badge-trending",
    hot: "badge-hot",
    featured: "badge-featured",
  };
  const labels = {
    trending: "Trending",
    hot: "Hot",
    featured: "Featured",
  };

  return (
    <span className={`market-badge ${styles[kind]}`}>{labels[kind]}</span>
  );
}