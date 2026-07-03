import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResearchView } from "@/components/research-view";
import { WatchlistButton } from "@/components/watchlist-button";
import { PriceChart } from "@/components/price-chart";
import { LiveMarketStats } from "@/components/live-market-stats";
import { ResearchSkeleton } from "@/components/skeletons";
import {
  enrichMarketWithClob,
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="reveal flex items-start gap-4">
        {market.image && (
          <Image
            src={market.image}
            alt=""
            width={56}
            height={56}
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

      <LiveMarketStats initialMarket={market} />

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
