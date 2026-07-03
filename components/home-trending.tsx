"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LiveSyncBadge } from "@/components/live-sync-badge";
import { TrendingMarketCard } from "@/components/trending-market-card";
import { useLiveData } from "@/lib/use-live-data";
import type { DiscoverView } from "@/lib/discover";
import type { Market } from "@/lib/types";

type Tab = "trending" | "hot" | "featured";

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: "trending",
    label: "Trending",
    hint: "Highest 24h volume on Polymarket",
  },
  {
    id: "hot",
    label: "Hot movers",
    hint: "Biggest 24h probability swings",
  },
  {
    id: "featured",
    label: "Featured",
    hint: "Polymarket editorial picks",
  },
];

async function fetchView(view: DiscoverView): Promise<Market[]> {
  const res = await fetch(`/api/discover?view=${view}&limit=6`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  return Array.isArray(data?.markets) ? data.markets : [];
}

/** Live, auto-refreshing collection for a single home tab. */
function useTabMarkets(view: DiscoverView, initial: Market[], active: boolean) {
  const fetcher = useCallback(() => fetchView(view), [view]);
  return useLiveData(initial, fetcher, { intervalMs: 15_000, enabled: active });
}

export function HomeTrending({
  trending,
  hot,
  featured,
}: {
  trending: Market[];
  hot: Market[];
  featured: Market[];
}) {
  const [tab, setTab] = useState<Tab>("trending");

  const trendingLive = useTabMarkets("trending", trending, tab === "trending");
  const hotLive = useTabMarkets("hot", hot, tab === "hot");
  const featuredLive = useTabMarkets("featured", featured, tab === "featured");

  const byTab: Record<Tab, ReturnType<typeof useLiveData<Market[]>>> = {
    trending: trendingLive,
    hot: hotLive,
    featured: featuredLive,
  };

  const active = byTab[tab];
  const markets = active.data;
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <section className="relative mt-28 md:mt-32">
      <div className="home-section-divider reveal d-4" />

      <div className="reveal d-4 mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-faint">
            Live from Polymarket
          </p>
          <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.02em] md:text-[1.85rem]">
            Markets moving now
          </h2>
          <p className="mt-1.5 text-sm text-muted">{activeTab.hint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LiveSyncBadge fetchedAt={active.lastUpdated.toISOString()} />
          <Link
            href={`/discover?view=${tab}`}
            className="glass-pill inline-flex w-fit items-center gap-1.5 px-4 py-2 text-sm font-medium text-accent-ink hover:brightness-105"
          >
            Discover all
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="reveal d-5 mt-6 inline-flex gap-1.5 overflow-x-auto rounded-full border border-border bg-card/50 p-1.5 backdrop-blur-md scrollbar-none">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`btn-press shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 ${
              tab === item.id
                ? "bg-accent text-white shadow-[var(--shadow-glow)]"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div key={tab} className="mt-6 grid gap-4 sm:grid-cols-2 home-tab-enter">
        {markets.map((market, i) => (
          <TrendingMarketCard
            key={market.id}
            market={market}
            rank={i + 1}
            badge={
              tab === "hot" ? "hot" : tab === "featured" ? "featured" : "trending"
            }
            revealDelay={Math.min(i + 1, 6)}
          />
        ))}
      </div>
    </section>
  );
}
