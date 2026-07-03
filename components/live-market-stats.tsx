"use client";

import { useCallback } from "react";
import { CountUp } from "@/components/count-up";
import { useLiveData } from "@/lib/use-live-data";
import { formatUsd } from "@/lib/polymarket";
import type { Market } from "@/lib/types";

async function fetchMarket(slug: string): Promise<Market | null> {
  const res = await fetch(
    `/api/markets?slugs=${encodeURIComponent(slug)}&enrich=1`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data?.markets) ? (data.markets[0] ?? null) : null;
}

/** Probability, volume, liquidity, and order-book stats — live-polled. */
export function LiveMarketStats({
  initialMarket,
}: {
  initialMarket: Market;
}) {
  const fetcher = useCallback(
    () => fetchMarket(initialMarket.slug).then((m) => m ?? initialMarket),
    [initialMarket]
  );
  const { data: market } = useLiveData(initialMarket, fetcher, {
    intervalMs: 8_000,
  });

  const rising = market.change24h >= 0;

  return (
    <>
      <div className="reveal d-1 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Probability">
          <span className="font-mono text-[26px] font-semibold tracking-tight tabular-nums">
            <CountUp value={market.probability} />
            <span className="text-sm text-faint">%</span>
          </span>
          <span
            className={`ml-2 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${
              rising ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
            }`}
          >
            {rising ? "↑" : "↓"} {Math.abs(market.change24h).toFixed(1)}
          </span>
        </Stat>
        <Stat label="Volume">
          <span className="font-mono text-[22px]">
            {formatUsd(market.volumeUsd)}
          </span>
        </Stat>
        <Stat label="Liquidity">
          <span className="font-mono text-[22px]">
            {formatUsd(market.liquidityUsd)}
          </span>
        </Stat>
        <Stat label="Resolves">
          <span className="font-mono text-[15px]">
            {market.endDate
              ? new Date(market.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "TBD"}
          </span>
        </Stat>
      </div>

      <div className="reveal d-2 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Best bid">
          <span className="font-mono text-[22px]">
            {percentOrDash(market.bestBid)}
          </span>
        </Stat>
        <Stat label="Best ask">
          <span className="font-mono text-[22px]">
            {percentOrDash(market.bestAsk)}
          </span>
        </Stat>
        <Stat label="Midpoint">
          <span className="font-mono text-[22px]">
            {percentOrDash(market.midpoint)}
          </span>
        </Stat>
        <Stat label="Spread">
          <span className="font-mono text-[22px]">
            {percentOrDash(market.spread)}
          </span>
        </Stat>
      </div>
    </>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p className="text-xs text-muted mb-2">{label}</p>
      <div className="flex items-baseline">{children}</div>
    </div>
  );
}

function percentOrDash(value: number | undefined): string {
  return value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;
}
