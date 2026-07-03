import { BuilderConfig } from "@polymarket/builder-signing-sdk";
import { ClobClient, Chain, type PriceHistoryInterval } from "@polymarket/clob-client";
import type { PricePoint } from "./types";

/**
 * Plain string union mirroring PriceHistoryInterval, plus "1m" (30 days)
 * — supported by the live API but not yet in the SDK's type union.
 */
export type PriceInterval = "1h" | "6h" | "1d" | "1w" | "max" | "1m";

const CLOB_HOST = "https://clob.polymarket.com";

/**
 * Polymarket Builders Program attribution. When builder API credentials
 * are configured, the SDK HMAC-signs eligible requests with
 * POLY_BUILDER_* headers so activity routed through Synora is attributed
 * to its registered builder code (POLYMARKET_BUILDER_CODE). Fails open:
 * without credentials the client stays plain public read-only.
 */
function builderConfig(): BuilderConfig | undefined {
  const key = process.env.POLYMARKET_BUILDER_API_KEY;
  const secret = process.env.POLYMARKET_BUILDER_SECRET;
  const passphrase = process.env.POLYMARKET_BUILDER_PASSPHRASE;
  if (!key || !secret || !passphrase) return undefined;
  return new BuilderConfig({ localBuilderCreds: { key, secret, passphrase } });
}

/**
 * Official Polymarket CLOB SDK client — no signer (Synora never places
 * orders), builder-attributed when credentials are configured. Used for
 * order book, midpoint, spread, last trade price, and price history —
 * all live, uncached reads.
 */
const client = new ClobClient(
  CLOB_HOST,
  Chain.POLYGON,
  undefined, // signer
  undefined, // L2 api creds
  undefined, // signature type
  undefined, // funder address
  undefined, // geo-block token
  undefined, // use server time
  builderConfig()
);

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
