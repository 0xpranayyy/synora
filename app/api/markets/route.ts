import { NextRequest, NextResponse } from "next/server";
import { getMarketsBySlugs } from "@/lib/polymarket";

/** Resolve a list of market slugs (the watchlist) to live market data. */
export async function GET(request: NextRequest) {
  const slugs = (request.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) return NextResponse.json({ markets: [] });

  const markets = await getMarketsBySlugs(slugs);
  return NextResponse.json({ markets });
}
