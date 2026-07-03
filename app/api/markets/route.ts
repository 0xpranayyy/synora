import { NextRequest, NextResponse } from "next/server";
import { enrichMarketWithClob, getMarketsBySlugs } from "@/lib/polymarket";

/** Real usage is always a single market (watchlist entries poll one at
 *  a time; the market page polls its own slug). Capping here bounds the
 *  CLOB fan-out (4 live requests per market) to a small, fixed cost
 *  regardless of how many slugs a request tries to enrich. */
const MAX_ENRICHED_MARKETS = 5;

/**
 * Resolve a list of market slugs to live market data (watchlist, market
 * page auto-refresh). Pass `enrich=1` to also attach live CLOB
 * microstructure (bid/ask/midpoint/spread) — opt-in since it costs a
 * few extra live requests per market.
 */
export async function GET(request: NextRequest) {
  const slugs = (request.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) return NextResponse.json({ markets: [] });

  try {
    const markets = await getMarketsBySlugs(slugs);

    if (request.nextUrl.searchParams.get("enrich") === "1") {
      const enriched = await Promise.all(
        markets.slice(0, MAX_ENRICHED_MARKETS).map(enrichMarketWithClob)
      );
      return NextResponse.json({ markets: enriched });
    }

    return NextResponse.json({ markets });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Polymarket fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
