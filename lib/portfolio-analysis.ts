import { formatUsd } from "./polymarket";
import type {
  Confidence,
  ExposureSlice,
  PortfolioReview,
  PortfolioSummary,
  Position,
} from "./types";

/** Group open positions by Polymarket event for exposure breakdown. */
export function computeExposure(
  positions: Position[],
  totalValue: number
): ExposureSlice[] {
  const buckets = new Map<string, { label: string; value: number; count: number }>();

  for (const position of positions) {
    const label = position.eventSlug
      ? position.title.split("?")[0]?.trim() || position.title
      : position.title;
    const key = position.eventSlug || position.slug;
    const entry = buckets.get(key) ?? { label, value: 0, count: 0 };
    entry.value += position.currentValue;
    entry.count += 1;
    buckets.set(key, entry);
  }

  return [...buckets.entries()]
    .map(([key, data]) => ({
      key,
      label: data.label,
      valueUsd: data.value,
      sharePct:
        totalValue > 0
          ? Math.round((data.value / totalValue) * 1000) / 10
          : 0,
      positionCount: data.count,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

/** Deterministic portfolio read from live Polymarket position data only. */
export function quantPortfolioReview(
  portfolio: PortfolioSummary,
  exposure: ExposureSlice[]
): PortfolioReview {
  const { positions, totalValue, totalCashPnl, positionCount } = portfolio;

  if (positionCount === 0) {
    return {
      mode: "quant",
      confidence: "Low",
      summary:
        "No open Polymarket positions detected for this wallet. Connect the wallet you trade with on Polymarket.",
      risks: [],
      strengths: [],
      insight:
        "Once you hold positions, Synora will summarize exposure concentration, PnL mix, and resolution timing from live Data API feeds.",
    };
  }

  const winners = positions.filter((p) => p.cashPnl > 0);
  const losers = positions.filter((p) => p.cashPnl < 0);
  const redeemable = positions.filter((p) => p.redeemable);
  const top = exposure[0];
  const topShare = top?.sharePct ?? 0;

  const soon = positions
    .filter((p) => p.endDate)
    .sort(
      (a, b) =>
        new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime()
    )
    .slice(0, 3);

  const confidence: Confidence =
    positionCount >= 8 && topShare > 55
      ? "High"
      : positionCount >= 3
        ? "Medium"
        : "Low";

  const risks: string[] = [];
  const strengths: string[] = [];

  if (topShare >= 40) {
    risks.push(
      `Concentration: ${top?.label ?? "Top event"} is ${topShare}% of mark-to-market value (${formatUsd(top?.valueUsd ?? 0)}).`
    );
  }
  if (losers.length > winners.length) {
    risks.push(
      `${losers.length} of ${positionCount} positions are underwater on an unrealized basis.`
    );
  }
  if (redeemable.length > 0) {
    risks.push(
      `${redeemable.length} position(s) are redeemable — capital may be idle until claimed.`
    );
  }
  if (totalCashPnl < 0 && Math.abs(totalCashPnl) > totalValue * 0.15) {
    risks.push(
      `Drawdown is ${formatUsd(Math.abs(totalCashPnl))} (${((Math.abs(totalCashPnl) / Math.max(totalValue, 1)) * 100).toFixed(0)}% of portfolio value).`
    );
  }

  if (winners.length > 0) {
    strengths.push(
      `${winners.length} position(s) show positive unrealized PnL, led by ${formatUsd(Math.max(...winners.map((p) => p.cashPnl)))} max gain.`
    );
  }
  if (topShare < 25 || positionCount >= 5) {
    strengths.push(
      `Exposure is spread across ${exposure.length} event(s) — no single-name dominance.`
    );
  }
  if (totalCashPnl >= 0) {
    strengths.push(
      `Portfolio is net positive ${formatUsd(totalCashPnl)} unrealized across open positions.`
    );
  }

  const soonText =
    soon.length > 0
      ? ` Next resolutions: ${soon
          .map((p) =>
            new Date(p.endDate!).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          )
          .join(", ")}.`
      : "";

  return {
    mode: "quant",
    confidence,
    summary: `You hold ${positionCount} open Polymarket position(s) worth ${formatUsd(totalValue)} mark-to-market, with ${totalCashPnl >= 0 ? "+" : ""}${formatUsd(totalCashPnl)} unrealized PnL. Largest exposure is ${top?.label ?? "—"} at ${topShare}% of the book.${soonText}`,
    risks: risks.length ? risks : ["No major concentration or drawdown flags from position data alone."],
    strengths: strengths.length
      ? strengths
      : ["Portfolio is small enough that position-level risk is limited."],
    insight:
      topShare >= 50
        ? "Consider whether the top event alone reflects your intended risk budget — single-event books move sharply on one resolution."
        : totalCashPnl < 0 && losers.length >= 2
          ? "Underwater positions may still be rational holds — check resolution dates and whether odds moved against you or your thesis changed."
          : "Book looks balanced relative to size. Use Synora market pages to re-research names before adding size.",
  };
}