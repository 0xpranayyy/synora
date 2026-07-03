import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getPortfolio } from "@/lib/polymarket-portfolio";

export const dynamic = "force-dynamic";

/** Fetch live Polymarket positions + exposure + review for a wallet. */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    const portfolio = await getPortfolio(address);
    return NextResponse.json(portfolio);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Portfolio fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
