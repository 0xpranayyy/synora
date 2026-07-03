import {
  getMicrostructure,
  getPriceHistory,
  type PriceInterval,
} from "./clob-client";
import type { Market, PricePoint } from "./types";

/** Polymarket Gamma API — events, markets, tags, search. */
export const GAMMA = "https://gamma-api.polymarket.com";

/** Base filters for open, tradable markets per Gamma API conventions. */
const OPEN_MARKET = "closed=false&active=true";
const OPEN_EVENT = "closed=false&active=true";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = Record<string, any>;

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeMarket(raw: Raw, category?: string): Market | null {
  const outcomes = parseJsonArray(raw.outcomes);
  const prices = parseJsonArray(raw.outcomePrices).map(Number);
  const yesIndex = outcomes.findIndex((o) => o.toLowerCase() === "yes");
  if (yesIndex === -1 || !Number.isFinite(prices[yesIndex])) return null;

  const tokenIds = parseJsonArray(raw.clobTokenIds);
  const event = Array.isArray(raw.events) ? raw.events[0] : undefined;

  return {
    id: String(raw.id),
    slug: String(raw.slug ?? raw.id),
    question: String(raw.question ?? raw.title ?? ""),
    eventTitle: String(event?.title ?? raw.question ?? "").trim(),
    category,
    image: typeof raw.image === "string" && raw.image ? raw.image : undefined,
    probability: Math.round(prices[yesIndex] * 1000) / 10,
    change24h:
      Math.round(Number(raw.oneDayPriceChange ?? 0) * 1000) / 10 || 0,
    volumeUsd: Number(raw.volumeNum ?? raw.volume ?? 0),
    volume24hUsd: Number(raw.volume24hr ?? 0),
    liquidityUsd: Number(raw.liquidityNum ?? raw.liquidity ?? 0),
    endDate: raw.endDateIso ?? raw.endDate ?? null,
    description: String(raw.description ?? ""),
    yesTokenId: tokenIds[yesIndex] ?? null,
    url: `https://polymarket.com/market/${raw.slug ?? ""}`,
  };
}

type GammaFetchOptions = {
  /** Seconds to cache, or false for always-fresh (live discover/home). */
  revalidate?: number | false;
};

/**
 * Fetch with a timeout and one retry on transient failures (network
 * errors, 429, 5xx) — the public Gamma API occasionally stalls or
 * hiccups under load, and a single retry avoids surfacing that as a
 * hard page crash.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 1
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      const transientError = !res.ok && (res.status === 429 || res.status >= 500);
      if (transientError && attempt < retries) continue;
      return res;
    } catch (error) {
      if (attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function gamma(
  path: string,
  options: GammaFetchOptions | number = 60
): Promise<Raw> {
  const revalidate =
    typeof options === "number" ? options : (options.revalidate ?? 60);

  const res = await fetchWithRetry(`${GAMMA}${path}`, {
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Polymarket API ${res.status} for ${path}`);
  return res.json();
}

/** Live Gamma reads — no Next.js cache (discover, home trending). */
function gammaLive(path: string): Promise<Raw> {
  return gamma(path, { revalidate: false });
}

/**
 * Live top-of-book, midpoint, spread, and last trade price for a YES
 * token — sourced from the official @polymarket/clob-client SDK.
 */
export async function marketMicrostructure(
  yesTokenId: string | null
): Promise<Partial<Market>> {
  return getMicrostructure(yesTokenId);
}

export async function enrichMarketWithClob(market: Market): Promise<Market> {
  const microstructure = await marketMicrostructure(market.yesTokenId);
  return { ...market, ...microstructure };
}

function isOpenMarket(raw: Raw): boolean {
  return !raw.closed && raw.active !== false;
}

/** Pick the top open market per event by 24h volume. */
function marketsFromEvents(
  events: Raw[],
  limit: number,
  category?: string
): Market[] {
  const markets: Market[] = [];
  for (const event of events) {
    const candidates = (Array.isArray(event.markets) ? event.markets : [])
      .filter(isOpenMarket)
      .map((m: Raw) => normalizeMarket({ ...m, events: [event] }, category))
      .filter((m: Market | null): m is Market => m !== null)
      .sort((a: Market, b: Market) => b.volume24hUsd - a.volume24hUsd);
    if (candidates[0]) markets.push(candidates[0]);
    if (markets.length >= limit) break;
  }
  return markets;
}

function normalizeMarkets(raw: Raw[], category?: string): Market[] {
  return raw
    .map((item) => normalizeMarket(item, category))
    .filter((m): m is Market => m !== null);
}

/**
 * Trending — Gamma GET /events
 * order=volume24hr, ascending=false (Polymarket browse default).
 */
export async function trendingMarkets(limit = 12): Promise<Market[]> {
  const events = (await gammaLive(
    `/events?${OPEN_EVENT}&order=volume24hr&ascending=false&limit=${limit}`
  )) as Raw[];
  return marketsFromEvents(events, limit);
}

/**
 * Featured — Gamma GET /events with featured=true.
 */
export async function featuredMarkets(limit = 12): Promise<Market[]> {
  const events = (await gammaLive(
    `/events?${OPEN_EVENT}&featured=true&order=volume24hr&ascending=false&limit=${limit}`
  )) as Raw[];
  return marketsFromEvents(events, limit);
}

/**
 * Hot movers — Gamma GET /markets
 * order=oneDayPriceChange, ascending=false, volume_num_min for liquidity.
 */
export async function hotMoversMarkets(limit = 12): Promise<Market[]> {
  const raw = (await gammaLive(
    `/markets?${OPEN_MARKET}&order=oneDayPriceChange&ascending=false&volume_num_min=10000&liquidity_num_min=1000&limit=${limit}`
  )) as Raw[];

  return normalizeMarkets(raw).slice(0, limit);
}

/**
 * Ending soon — Gamma GET /markets
 * order=endDate ascending, future resolution only.
 */
export async function endingSoonMarkets(limit = 12): Promise<Market[]> {
  const raw = (await gammaLive(
    `/markets?${OPEN_MARKET}&order=endDate&ascending=true&liquidity_num_min=10000&end_date_min=${encodeURIComponent(new Date().toISOString())}&limit=${limit}`
  )) as Raw[];
  return normalizeMarkets(raw).slice(0, limit);
}

/** Category slugs supported by Polymarket's tag system. */
export const categories = [
  { label: "Politics", slug: "politics" },
  { label: "Crypto", slug: "crypto" },
  { label: "AI", slug: "ai" },
  { label: "Sports", slug: "sports" },
  { label: "Economy", slug: "economy" },
  { label: "World", slug: "geopolitics" },
  { label: "Science", slug: "science" },
  { label: "Tech", slug: "tech" },
] as const;

/**
 * Category browse — Gamma GET /events with tag_slug.
 */
export async function categoryMarkets(
  tagSlug: string,
  limit = 12
): Promise<Market[]> {
  const label = categories.find((c) => c.slug === tagSlug)?.label;
  const events = (await gammaLive(
    `/events?${OPEN_EVENT}&tag_slug=${encodeURIComponent(tagSlug)}&order=volume24hr&ascending=false&limit=${limit}`
  )) as Raw[];

  return marketsFromEvents(events, limit, label);
}

const STOPWORDS = new Set([
  "will", "the", "a", "an", "be", "is", "are", "was", "in", "on", "at", "by",
  "to", "of", "for", "before", "after", "this", "that", "it", "and", "or",
  "what", "who", "when", "which", "how", "does", "do", "did", "has", "have",
  "new", "next", "year", "today", "hit", "reach", "there",
  // Conversational/trading filler that dilutes relevance scoring and,
  // when sent to Polymarket's search endpoint, actively degrades result
  // quality (confirmed empirically — "market"/"markets" especially).
  "show", "explain", "compare", "should", "buy", "sell", "yes", "no", "me",
  "my", "you", "your", "think", "traders", "trader", "missing", "insight",
  "insights", "opportunity", "opportunities", "about", "affected", "vs",
  "market", "markets", "tell", "us", "we", "our", "please", "can", "could",
  "would", "want", "looking", "find", "give", "get",
]);

function queryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function relevance(terms: string[], text: string): number {
  if (terms.length === 0) return 0;
  const haystack = text.toLowerCase();
  const hits = terms.filter((t) => haystack.includes(t)).length;
  return hits / terms.length;
}

/**
 * Full-text search over Polymarket via the public search endpoint,
 * re-ranked by keyword relevance (the API's own ranking is noisy)
 * with 24h volume as the tiebreaker.
 *
 * The query sent to Polymarket is built from extracted keywords, not the
 * raw input — its search endpoint performs far worse on full natural-
 * language sentences than on bare topic keywords. Queries with no
 * extractable keyword (e.g. "What are traders missing?") have no real
 * topic to search for, so we return no results rather than falling back
 * to the raw sentence or to volume-sorted noise.
 */
export async function searchMarkets(query: string, limit = 8): Promise<Market[]> {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const data = await gammaLive(
    `/public-search?q=${encodeURIComponent(terms.join(" "))}&limit_per_type=${limit * 2}&events_status=active`
  );
  const events: Raw[] = Array.isArray(data?.events) ? data.events : [];

  const scored: { market: Market; score: number }[] = [];
  for (const event of events) {
    const candidates = (Array.isArray(event.markets) ? event.markets : [])
      .filter((m: Raw) => !m.closed)
      .map((m: Raw) => normalizeMarket({ ...m, events: [event] }))
      .filter((m: Market | null): m is Market => m !== null);
    if (candidates.length === 0) continue;

    // Score every market in the event individually, not just the
    // highest-volume one — multi-outcome events (e.g. "World Cup Winner"
    // bundling one market per country) otherwise always surface whichever
    // outcome has the most volume, regardless of which one the query
    // actually named (asking about Switzerland returned USA).
    let best: { market: Market; score: number } | null = null;
    for (const market of candidates) {
      const score = Math.max(
        relevance(terms, `${event.title} ${market.question}`),
        relevance(terms, market.question)
      );
      if (
        !best ||
        score > best.score ||
        (score === best.score && market.volume24hUsd > best.market.volume24hUsd)
      ) {
        best = { market, score };
      }
    }
    if (best && best.score > 0) scored.push(best);
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score || b.market.volume24hUsd - a.market.volume24hUsd
    )
    .slice(0, limit)
    .map((s) => s.market);
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  const raw = (await gammaLive(
    `/markets?slug=${encodeURIComponent(slug)}`
  )) as Raw[];
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return normalizeMarket(raw[0]);
}

export async function getMarketsBySlugs(slugs: string[]): Promise<Market[]> {
  const results = await Promise.all(
    slugs.slice(0, 30).map((s) => getMarketBySlug(s).catch(() => null))
  );
  return results.filter((m): m is Market => m !== null);
}

/**
 * Live YES price history — sourced from the official
 * @polymarket/clob-client SDK, no caching.
 */
export async function priceHistory(
  yesTokenId: string,
  interval: PriceInterval = "1m"
): Promise<PricePoint[]> {
  return getPriceHistory(yesTokenId, interval, 180);
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}
