import type { Market, PricePoint } from "./types";

/** Polymarket Gamma API — events, markets, tags, search. */
export const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";

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

async function gamma(
  path: string,
  options: GammaFetchOptions | number = 60
): Promise<Raw> {
  const revalidate =
    typeof options === "number" ? options : (options.revalidate ?? 60);

  const res = await fetch(`${GAMMA}${path}`, {
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

async function clob(path: string, revalidate = 15): Promise<Raw | null> {
  try {
    const res = await fetch(`${CLOB}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function decimal(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function firstBookPrice(book: Raw | null, side: "bids" | "asks") {
  const levels = Array.isArray(book?.[side]) ? book?.[side] : [];
  return decimal(levels[0]?.price);
}

/** Public CLOB read model for a YES token: top-of-book, midpoint, spread. */
export async function marketMicrostructure(
  yesTokenId: string | null
): Promise<Partial<Market>> {
  if (!yesTokenId) return {};

  const token = encodeURIComponent(yesTokenId);
  const [book, midpoint, spread, lastTrade] = await Promise.all([
    clob(`/book?token_id=${token}`),
    clob(`/midpoint?token_id=${token}`),
    clob(`/spread?token_id=${token}`),
    clob(`/last-trade-price?token_id=${token}`),
  ]);

  return {
    bestBid: firstBookPrice(book, "bids"),
    bestAsk: firstBookPrice(book, "asks"),
    midpoint: decimal(midpoint?.mid ?? midpoint?.midpoint),
    spread: decimal(spread?.spread),
    lastTradePrice: decimal(lastTrade?.price),
    orderBookHash: typeof book?.hash === "string" ? book.hash : undefined,
  };
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
 */
export async function searchMarkets(query: string, limit = 8): Promise<Market[]> {
  const data = await gamma(
    `/public-search?q=${encodeURIComponent(query)}&limit_per_type=${limit * 2}&events_status=active`,
    30
  );
  const events: Raw[] = Array.isArray(data?.events) ? data.events : [];
  const terms = queryTerms(query);

  const scored: { market: Market; score: number }[] = [];
  for (const event of events) {
    const candidates = (Array.isArray(event.markets) ? event.markets : [])
      .filter((m: Raw) => !m.closed)
      .map((m: Raw) => normalizeMarket({ ...m, events: [event] }))
      .filter((m: Market | null): m is Market => m !== null)
      .sort((a: Market, b: Market) => b.volumeUsd - a.volumeUsd);
    const top = candidates[0];
    if (!top) continue;
    scored.push({
      market: top,
      score: Math.max(
        relevance(terms, `${event.title} ${top.question}`),
        relevance(terms, String(event.title ?? ""))
      ),
    });
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
  const raw = (await gamma(
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

/** YES price history from the CLOB. */
export async function priceHistory(
  yesTokenId: string,
  interval: "1d" | "1w" | "1m" | "max" = "1m"
): Promise<PricePoint[]> {
  const res = await fetch(
    `${CLOB}/prices-history?market=${yesTokenId}&interval=${interval}&fidelity=180`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.history) ? data.history : [];
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}
