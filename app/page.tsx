import { HomeBackdrop } from "@/components/home-backdrop";
import { HomeHero } from "@/components/home-hero";
import { HomeTrending } from "@/components/home-trending";
import { fetchDiscoverFeed } from "@/lib/discover";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [trendingFeed, hotFeed, featuredFeed] = await Promise.all([
    fetchDiscoverFeed("trending", 6),
    fetchDiscoverFeed("hot", 6),
    fetchDiscoverFeed("featured", 6),
  ]);

  const suggestions = trendingFeed.markets
    .slice(0, 5)
    .map((market) => market.question);
  const totalVolume24h = trendingFeed.markets.reduce(
    (sum, market) => sum + market.volume24hUsd,
    0
  );

  return (
    <div className="home-scene relative min-h-full">
      <HomeBackdrop />
      <div className="relative z-[1] mx-auto max-w-5xl px-6 pb-24 pt-12 md:pb-28 md:pt-16">
        <HomeHero suggestions={suggestions} totalVolume24h={totalVolume24h} />
        <HomeTrending
          trending={trendingFeed.markets}
          hot={hotFeed.markets}
          featured={featuredFeed.markets}
          fetchedAt={trendingFeed.fetchedAt}
        />
      </div>
    </div>
  );
}