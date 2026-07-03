import { NextRequest, NextResponse } from "next/server";
import { enrichMarketWithClob, getMarketsBySlugs } from "@/lib/polymarket";

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

  const markets = await getMarketsBySlugs(slugs);

  if (request.nextUrl.searchParams.get("enrich") === "1") {
    const enriched = await Promise.all(markets.map(enrichMarketWithClob));
    return NextResponse.json({ markets: enriched });
  }

  return NextResponse.json({ markets });
}
