export type Confidence = "Low" | "Medium" | "High";

/** Normalized Polymarket market (binary YES/NO). */
export interface Market {
  id: string;
  slug: string;
  question: string;
  /** Parent event title, e.g. "World Cup Winner" — used as a group label. */
  eventTitle: string;
  /** Set when the market was fetched through a category browse. */
  category?: string;
  image?: string;
  /** Probability of YES, 0–100. */
  probability: number;
  /** 24h change in probability, percentage points. */
  change24h: number;
  volumeUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  endDate: string | null;
  /** Full resolution criteria from Polymarket. */
  description: string;
  /** CLOB token id for the YES outcome — used for price history. */
  yesTokenId: string | null;
  /** CLOB top-of-book and display-price data for the YES token. */
  bestBid?: number;
  bestAsk?: number;
  midpoint?: number;
  spread?: number;
  lastTradePrice?: number;
  orderBookHash?: string;
  url: string;
}

export interface PricePoint {
  t: number; // unix seconds
  p: number; // probability 0–1
}

export interface NewsItem {
  title: string;
  source: string;
  date?: string;
  summary: string;
  url: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface Source {
  label: string;
  url: string;
}

/** Open position from Polymarket Data API. */
export interface Position {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  percentRealizedPnl: number;
  curPrice: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon?: string;
  eventId: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string | null;
  negativeRisk: boolean;
}

/** One row in the portfolio exposure breakdown (grouped by event). */
export interface ExposureSlice {
  label: string;
  valueUsd: number;
  sharePct: number;
  positionCount: number;
}

/** AI or quant read on a connected wallet's open Polymarket book. */
export interface PortfolioReview {
  mode: "ai" | "local" | "quant";
  confidence: Confidence;
  summary: string;
  risks: string[];
  strengths: string[];
  insight: string;
}

export interface PortfolioSummary {
  address: string;
  proxyWallet: string | null;
  totalValue: number;
  totalCashPnl: number;
  positionCount: number;
  positions: Position[];
  exposure: ExposureSlice[];
  review: PortfolioReview;
}

export interface Research {
  confidence: Confidence;
  summary: string;
  bullCase: string[];
  bearCase: string[];
  news: NewsItem[];
  timeline: TimelineEvent[];
  resolution: string;
  insight: string;
  followUps: string[];
  sources: Source[];
  /** "ai" = hosted model with web research; "local" = open local LLM; "quant" = deterministic market-data analysis. */
  mode: "ai" | "local" | "quant";
}
