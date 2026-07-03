/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResearchView } from "@/components/research-view";
import { WatchlistButton } from "@/components/watchlist-button";
import { PriceChart } from "@/components/price-chart";
import { CountUp } from "@/components/count-up";
import { ResearchSkeleton } from "@/components/skeletons";
import {
  enrichMarketWithClob,
  formatUsd,
  getMarketBySlug,
  priceHistory,
} from "@/lib/polymarket";
import { runResearch } from "@/lib/research";
import type { Market, PricePoint } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseMarket = await getMarketBySlug(slug);
  if (!baseMarket) notFound();
  const market = await enrichMarketWithClob(baseMarket);

  const history = market.yesTokenId
    ? await priceHistory(market.yesTokenId, "1m")
    : [];
  const rising = market.change24h >= 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="reveal flex items-start gap-4">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="h-14 w-14 rounded-2xl object-cover border border-border shadow-[var(--shadow-card)]"
          />
        )}
        <div className="min-w-0 flex-1">
          {market.eventTitle && market.eventTitle !== market.question && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
              {market.eventTitle}
            </span>
          )}
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            {market.question}
          </h1>
        </div>
        <WatchlistButton slug={market.slug} />
      </div>

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

      <div className="reveal d-3 mt-4 rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-faint mb-4">
          Probability history — 30 days
        </h2>
        <PriceChart history={history} />
      </div>

      <div className="mt-6">
        <Suspense fallback={<ResearchSkeleton />}>
          <MarketResearch market={market} history={history} />
        </Suspense>
      </div>
    </div>
  );
}

async function MarketResearch({
  market,
  history,
}: {
  market: Market;
  history: PricePoint[];
}) {
  const research = await runResearch(market, history, market.question);
  return <ResearchView research={research} />;
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
