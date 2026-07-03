import { analyzePortfolio } from "./portfolio-review";
import type { PortfolioSummary, Position } from "./types";

const DATA_API = "https://data-api.polymarket.com";
const GAMMA = "https://gamma-api.polymarket.com";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = Record<string, any>;

function normalizePosition(raw: Raw): Position | null {
  if (!raw.slug || !raw.title) return null;
  return {
    proxyWallet: String(raw.proxyWallet ?? ""),
    asset: String(raw.asset ?? ""),
    conditionId: String(raw.conditionId ?? ""),
    size: Number(raw.size ?? 0),
    avgPrice: Number(raw.avgPrice ?? 0),
    initialValue: Number(raw.initialValue ?? 0),
    currentValue: Number(raw.currentValue ?? 0),
    cashPnl: Number(raw.cashPnl ?? 0),
    percentPnl: Number(raw.percentPnl ?? 0),
    totalBought: Number(raw.totalBought ?? 0),
    realizedPnl: Number(raw.realizedPnl ?? 0),
    percentRealizedPnl: Number(raw.percentRealizedPnl ?? 0),
    curPrice: Number(raw.curPrice ?? 0),
    redeemable: Boolean(raw.redeemable),
    mergeable: Boolean(raw.mergeable),
    title: String(raw.title),
    slug: String(raw.slug),
    icon: typeof raw.icon === "string" ? raw.icon : undefined,
    eventId: String(raw.eventId ?? ""),
    eventSlug: String(raw.eventSlug ?? ""),
    outcome: String(raw.outcome ?? ""),
    outcomeIndex: Number(raw.outcomeIndex ?? 0),
    oppositeOutcome: String(raw.oppositeOutcome ?? ""),
    oppositeAsset: String(raw.oppositeAsset ?? ""),
    endDate: raw.endDate ?? null,
    negativeRisk: Boolean(raw.negativeRisk),
  };
}

export async function getProxyWallet(
  address: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${GAMMA}/public-profile?address=${encodeURIComponent(address)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.proxyWallet === "string" ? data.proxyWallet : null;
  } catch {
    return null;
  }
}

export async function getPositions(
  wallet: string,
  limit = 100
): Promise<Position[]> {
  try {
    const res = await fetch(
      `${DATA_API}/positions?user=${encodeURIComponent(wallet)}&limit=${limit}&sizeThreshold=0.01&sortBy=CURRENT&sortDirection=DESC`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((item: Raw) => normalizePosition(item))
      .filter((p: Position | null): p is Position => p !== null);
  } catch {
    return [];
  }
}

export async function getPortfolioValue(wallet: string): Promise<number> {
  try {
    const res = await fetch(
      `${DATA_API}/value?user=${encodeURIComponent(wallet)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : data;
    return Number(entry?.value ?? 0);
  } catch {
    return 0;
  }
}

export async function getPortfolio(address: string): Promise<PortfolioSummary> {
  const proxyWallet = (await getProxyWallet(address)) ?? address;
  const [positions, totalValue] = await Promise.all([
    getPositions(proxyWallet),
    getPortfolioValue(proxyWallet),
  ]);

  const totalCashPnl = positions.reduce((sum, p) => sum + p.cashPnl, 0);

  const summary: PortfolioSummary = {
    address,
    proxyWallet: proxyWallet === address ? null : proxyWallet,
    totalValue,
    totalCashPnl,
    positionCount: positions.length,
    positions,
    exposure: [],
    review: {
      mode: "quant",
      confidence: "Low",
      summary: "",
      risks: [],
      strengths: [],
      insight: "",
    },
  };

  const { exposure, review } = await analyzePortfolio(summary);
  return { ...summary, exposure, review };
}