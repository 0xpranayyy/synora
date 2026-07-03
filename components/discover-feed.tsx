"use client";

import { useCallback } from "react";
import { MarketCard } from "@/components/market-card";
import { LiveSyncBadge } from "@/components/live-sync-badge";
import { useLiveData } from "@/lib/use-live-data";
import type { DiscoverFeed } from "@/lib/discover";
import type { Market } from "@/lib/types";

export function DiscoverFeed({
  initialFeed,
  category,
}: {
  initialFeed: DiscoverFeed;
  category?: string;
}) {
  const fetchFeed = useCallback(async () => {
    const params = new URLSearchParams({ limit: "12" });
    if (category) params.set("category", category);
    else params.set("view", initialFeed.view);

    const res = await fetch(`/api/discover?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Refresh failed");
    return (await res.json()) as DiscoverFeed;
  }, [category, initialFeed.view]);

  const { data: feed, refresh, isRefreshing } = useLiveData(
    initialFeed,
    fetchFeed,
    { intervalMs: 12_000 }
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <LiveSyncBadge fetchedAt={feed.fetchedAt} />
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className="btn-press inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        >
          <RefreshIcon spinning={isRefreshing} />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {feed.markets.length === 0 ? (
        <p className="py-20 text-center text-sm text-faint">
          No open markets here right now.
        </p>
      ) : (
        <MarketGrid markets={feed.markets} />
      )}
    </div>
  );
}

function MarketGrid({ markets }: { markets: Market[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {markets.map((m, i) => (
        <MarketCard key={m.id} market={m} revealDelay={Math.min(i + 1, 6)} />
      ))}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : ""}
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}