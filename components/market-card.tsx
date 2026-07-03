/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Market } from "@/lib/types";
import { formatUsd } from "@/lib/polymarket";

export function MarketCard({
  market,
  revealDelay,
}: {
  market: Market;
  revealDelay?: number;
}) {
  const rising = market.change24h >= 0;
  const showEvent =
    market.eventTitle && market.eventTitle !== market.question;

  return (
    <Link
      href={`/market/${market.slug}`}
      className={`card-lift block rounded-[20px] border border-border bg-card p-5 ${
        revealDelay !== undefined ? `reveal d-${Math.min(revealDelay, 6)}` : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {market.image ? (
          <img
            src={market.image}
            alt=""
            className="h-10 w-10 rounded-xl object-cover shrink-0 border border-border"
          />
        ) : (
          <span className="h-10 w-10 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center text-sm font-semibold shrink-0">
            {market.question.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-faint">
            {market.category ?? (showEvent ? market.eventTitle : "Market")}
          </span>
          <h3 className="mt-1 font-medium leading-snug text-[15px] line-clamp-2">
            {market.question}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-[22px] font-semibold leading-none tracking-tight">
            {market.probability}
            <span className="text-xs text-faint">%</span>
          </div>
          <div
            className={`mt-1.5 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${
              rising ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
            }`}
          >
            {rising ? "↑" : "↓"} {Math.abs(market.change24h).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-accent-soft overflow-hidden">
        <div
          className="prob-bar h-full rounded-full bg-accent"
          style={{ width: `${market.probability}%` }}
        />
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-muted font-mono">
        <span>Vol {formatUsd(market.volumeUsd)}</span>
        <span>24h {formatUsd(market.volume24hUsd)}</span>
        <span>Liq {formatUsd(market.liquidityUsd)}</span>
      </div>
    </Link>
  );
}
