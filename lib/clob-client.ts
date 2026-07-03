import { ClobClient, Chain, type PriceHistoryInterval } from "@polymarket/clob-client";
import type { PricePoint } from "./types";

/**
 * Plain string union mirroring PriceHistoryInterval, plus "1m" (30 days)
 * — supported by the live API but not yet in the SDK's type union.
 */
export type PriceInterval = "1h" | "6h" | "1d" | "1w" | "max" | "1m";

const CLOB_HOST = "https://clob.polymarket.com";

/**
 * Official Polymarket CLOB SDK client, public read-only mode (no signer/
 * API credentials). Used for order book, midpoint, spread, last trade
 * price, and price history — all live, uncached reads.
 */
const client = new ClobClient(CLOB_HOST, Chain.POLYGON);

export interface Microstructure {
  bestBid?: number;
  bestAsk?: number;
  midpoint?: number;
  spread?: number;
  lastTradePrice?: number;
  orderBookHash?: string;
}

function decimal(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Live top-of-book, midpoint, spread, and last trade price for a YES token. */
export async function getMicrostructure(
  tokenId: string | null
): Promise<Microstructure> {
  if (!tokenId) return {};

  const [book, midpoint, spread, lastTrade] = await Promise.all([
    client.getOrderBook(tokenId).catch(() => null),
    client.getMidpoint(tokenId).catch(() => null),
    client.getSpread(tokenId).catch(() => null),
    client.getLastTradePrice(tokenId).catch(() => null),
  ]);

  return {
    bestBid: decimal(book?.bids?.[0]?.price),
    bestAsk: decimal(book?.asks?.[0]?.price),
    midpoint: decimal(midpoint?.mid),
    spread: decimal(spread?.spread),
    lastTradePrice: decimal(lastTrade?.price),
    orderBookHash: book ? await client.getOrderBookHash(book) : undefined,
  };
}

/** Live YES-price history. */
export async function getPriceHistory(
  tokenId: string,
  interval: PriceInterval = "1m",
  fidelity = 180
): Promise<PricePoint[]> {
  try {
    const result = await client.getPricesHistory({
      market: tokenId,
      interval: interval as PriceHistoryInterval,
      fidelity,
    });
    const history = (result as { history?: PricePoint[] })?.history;
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}
