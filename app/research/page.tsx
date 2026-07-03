import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SearchBar } from "@/components/search-bar";
import { ResearchView } from "@/components/research-view";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { CountUp } from "@/components/count-up";
import { ResearchSkeleton } from "@/components/skeletons";
import { WatchlistButton } from "@/components/watchlist-button";
import { enrichMarketWithClob, priceHistory, searchMarkets } from "@/lib/polymarket";
import { runResearch } from "@/lib/research";

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();
  if (!query) redirect("/");

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-background/80 backdrop-blur-xl">
        <SearchBar initialQuery={query} />
      </div>

      <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-faint px-1">
        Research
      </p>
      <h1 className="mt-1.5 text-2xl md:text-[28px] font-semibold tracking-tight px-1">
        {query}
      </h1>

      <div className="mt-6">
        <Suspense key={query} fallback={<ResearchSkeleton />}>
          <ResearchResult query={query} />
        </Suspense>
      </div>
    </div>
  );
}

async function ResearchResult({ query }: { query: string }) {
  const results = await searchMarkets(query);

  if (results.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-12 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted">
          No open markets on Polymarket match that question yet.
        </p>
        <Link
          href="/discover"
          className="btn-press mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-ink"
        >
          Browse markets instead
        </Link>
      </div>
    );
  }

  const market = await enrichMarketWithClob(results[0]);
  const alternatives = results.slice(1, 4);
  const history = market.yesTokenId
    ? await priceHistory(market.yesTokenId, "1m")
    : [];
  const research = await runResearch(market, history, query);

  return (
    <div className="space-y-5">
      <section className="reveal rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
              Matched market
            </p>
            <Link
              href={`/market/${market.slug}`}
              className="mt-1.5 block text-lg font-medium leading-snug hover:text-accent-ink transition-colors"
            >
              {market.question}
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <ConfidenceBadge level={research.confidence} />
              <WatchlistButton slug={market.slug} />
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl md:text-5xl font-semibold tracking-tight tabular-nums">
              <CountUp value={market.probability} />
              <span className="text-xl text-faint">%</span>
            </div>
            <p className="mt-1 text-xs text-muted">chance of YES</p>
          </div>
        </div>
      </section>

      <ResearchView research={research} relatedMarkets={alternatives} />
    </div>
  );
}
