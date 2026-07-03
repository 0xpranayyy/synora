import type { Market } from "./types";
import {
  categoryMarkets,
  endingSoonMarkets,
  featuredMarkets,
  hotMoversMarkets,
  trendingMarkets,
} from "./polymarket";

/** Discover collections aligned with Polymarket Gamma API sorts. */
export const discoverViews = [
  {
    slug: "trending",
    label: "Trending",
    hint: "Events ranked by 24h volume (Gamma API: order=volume24hr)",
  },
  {
    slug: "hot",
    label: "Hot movers",
    hint: "Markets with largest 24h probability moves (order=oneDayPriceChange)",
  },
  {
    slug: "featured",
    label: "Featured",
    hint: "Polymarket featured events by 24h volume",
  },
  {
    slug: "ending-soon",
    label: "Ending soon",
    hint: "Open markets resolving soonest with real liquidity",
  },
] as const;

export type DiscoverView = (typeof discoverViews)[number]["slug"];

export type DiscoverFeed = {
  view: DiscoverView;
  markets: Market[];
  fetchedAt: string;
  source: "gamma-api.polymarket.com";
};

export function isDiscoverView(value: string): value is DiscoverView {
  return discoverViews.some((view) => view.slug === value);
}

export async function fetchDiscoverFeed(
  view: DiscoverView,
  limit = 12
): Promise<DiscoverFeed> {
  let markets: Market[];

  switch (view) {
    case "trending":
      markets = await trendingMarkets(limit);
      break;
    case "hot":
      markets = await hotMoversMarkets(limit);
      break;
    case "featured":
      markets = await featuredMarkets(limit);
      break;
    case "ending-soon":
      markets = await endingSoonMarkets(limit);
      break;
  }

  return {
    view,
    markets,
    fetchedAt: new Date().toISOString(),
    source: "gamma-api.polymarket.com",
  };
}

export async function fetchCategoryFeed(
  tagSlug: string,
  limit = 12
): Promise<DiscoverFeed> {
  return {
    view: "trending",
    markets: await categoryMarkets(tagSlug, limit),
    fetchedAt: new Date().toISOString(),
    source: "gamma-api.polymarket.com",
  };
}