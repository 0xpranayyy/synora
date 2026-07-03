"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketCard } from "@/components/market-card";
import { CardGridSkeleton } from "@/components/skeletons";
import { useWatchlist } from "@/lib/use-watchlist";
import type { Market } from "@/lib/types";

export default function WatchlistPage() {
  const { ids: slugs, loaded } = useWatchlist();
  const [markets, setMarkets] = useState<Market[] | null>(null);

  useEffect(() => {
    if (!loaded || slugs.length === 0) return;
    let cancelled = false;
    fetch(`/api/markets?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMarkets(data.markets ?? []);
      })
      .catch(() => {
        if (!cancelled) setMarkets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [loaded, slugs]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="reveal">
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
        <p className="mt-1 text-sm text-muted">
          Markets you&apos;re tracking, with live prices.
        </p>
      </div>

      <div className="mt-8">
        {!loaded || (slugs.length > 0 && markets === null) ? (
          <CardGridSkeleton count={4} />
        ) : markets && markets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {markets.map((m, i) => (
              <MarketCard
                key={m.id}
                market={m}
                revealDelay={Math.min(i + 1, 6)}
              />
            ))}
          </div>
        ) : (
          <div className="reveal rounded-[20px] border border-border bg-card p-12 text-center shadow-[var(--shadow-card)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9z" />
              </svg>
            </span>
            <p className="mt-4 text-sm text-muted">
              Nothing here yet. Open a market and hit{" "}
              <span className="text-foreground font-medium">Watch</span> to
              track it.
            </p>
            <Link
              href="/discover"
              className="btn-press mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] hover:bg-accent-ink"
            >
              Discover markets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
