"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useConnection } from "wagmi";
import { WalletButton } from "@/components/wallet-button";
import { PolygonBadge, WalletGlyph } from "@/components/wallet-icons";
import { CardGridSkeleton } from "@/components/skeletons";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { formatUsd } from "@/lib/polymarket";
import { shortenAddress } from "@/lib/format-address";
import { usePortfolio } from "@/lib/use-portfolio";
import type { ExposureSlice, PortfolioReview, Position } from "@/lib/types";

export function PortfolioView() {
  const { address, isConnected } = useConnection();
  const { data, isLoading, isError, refetch, isFetching } = usePortfolio(
    isConnected ? address : undefined
  );

  if (!isConnected || !address) {
    return (
      <div className="reveal d-1 mt-8 overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="h-24 bg-gradient-to-br from-lilac-soft via-accent-soft/60 to-transparent" />
        <div className="px-8 pb-10 -mt-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-lilac shadow-[var(--shadow-card)]">
            <WalletGlyph className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight">
            Connect to view your portfolio
          </h2>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed">
            Load live Polymarket positions, unrealized PnL, and exposure —
            pulled directly from on-chain data.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <WalletButton />
            <PolygonBadge />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8">
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="reveal d-1 mt-8 rounded-[24px] border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted">
          Couldn&apos;t load your portfolio. Check your connection and try
          again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn-press mt-4 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-accent/40"
        >
          Retry
        </button>
      </div>
    );
  }

  const pnlUp = data.totalCashPnl >= 0;

  return (
    <div className="mt-8 space-y-6">
      <div className="reveal d-1 overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="h-16 bg-gradient-to-r from-accent-soft/80 via-lilac-soft/50 to-transparent" />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 -mt-4 mx-4 mb-4 overflow-hidden rounded-[20px] border border-border bg-border">
          <SummaryStat
            label="Wallet"
            value={shortenAddress(data.address, 6)}
            sub="Connected"
          />
          <SummaryStat
            label="Portfolio value"
            value={formatUsd(data.totalValue)}
            sub="Mark-to-market"
          />
          <SummaryStat
            label="Unrealized PnL"
            value={`${pnlUp ? "+" : ""}${formatUsd(data.totalCashPnl)}`}
            tone={pnlUp ? "mint" : "rose"}
            sub={pnlUp ? "In profit" : "In drawdown"}
          />
          <SummaryStat
            label="Open positions"
            value={String(data.positionCount)}
            sub="Active markets"
          />
        </div>
      </div>

      {data.proxyWallet && (
        <p className="reveal d-2 flex flex-wrap items-center gap-2 text-xs text-faint">
          <span>Polymarket proxy</span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted">
            {shortenAddress(data.proxyWallet, 8)}
          </span>
        </p>
      )}

      <PortfolioReviewPanel review={data.review} />

      {data.exposure.length > 0 && (
        <ExposureBreakdown exposure={data.exposure} />
      )}

      <div className="reveal d-2 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-faint">
          Positions
        </h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-press inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        >
          <RefreshIcon spinning={isFetching} />
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {data.positions.length === 0 ? (
        <div className="reveal d-3 rounded-[24px] border border-border bg-card p-12 text-center shadow-[var(--shadow-card)]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
            <WalletGlyph className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm text-muted">
            No open positions found for this wallet on Polymarket.
          </p>
          <Link
            href="/discover"
            className="btn-press mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)]"
          >
            Browse markets
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.positions.map((position, i) => (
            <PositionCard
              key={`${position.conditionId}-${position.outcomeIndex}`}
              position={position}
              revealDelay={Math.min(i + 1, 6)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const reviewModeCopy: Record<PortfolioReview["mode"], string> = {
  ai: "Claude analysis from your live position data.",
  local: "Local open-model analysis from position data.",
  quant: "Deterministic read from live Polymarket position data.",
};

function PortfolioReviewPanel({ review }: { review: PortfolioReview }) {
  return (
    <section className="reveal d-2 overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-faint">
          Portfolio review
        </h2>
        <ConfidenceBadge level={review.confidence} />
      </div>
      <div className="space-y-5 p-6">
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {review.summary}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewList title="Risks" items={review.risks} tone="rose" />
          <ReviewList title="Strengths" items={review.strengths} tone="mint" />
        </div>
        <div className="rounded-[16px] border border-border bg-accent-soft/30 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            Insight
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
            {review.insight}
          </p>
          <p className="mt-3 text-xs text-faint">{reviewModeCopy[review.mode]}</p>
        </div>
      </div>
    </section>
  );
}

function ReviewList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "mint" | "rose";
}) {
  const dot = tone === "mint" ? "bg-mint" : "bg-rose";
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2.5 text-sm leading-relaxed text-muted"
          >
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExposureBreakdown({ exposure }: { exposure: ExposureSlice[] }) {
  const maxShare = Math.max(...exposure.map((s) => s.sharePct), 1);

  return (
    <section className="reveal d-2 overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-faint">
          Exposure by event
        </h2>
        <p className="mt-1 text-xs text-muted">
          Mark-to-market allocation across your open Polymarket positions.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {exposure.map((slice, i) => (
          <li key={`${slice.label}-${i}`} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{slice.label}</p>
                <p className="mt-1 text-[11px] text-faint">
                  {slice.positionCount} position
                  {slice.positionCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-semibold">
                  {formatUsd(slice.valueUsd)}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {slice.sharePct}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent-soft">
              <div
                className="prob-bar h-full rounded-full bg-accent"
                style={{ width: `${(slice.sharePct / maxShare) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "mint" | "rose";
}) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-[22px] font-semibold tracking-tight ${
          tone === "mint"
            ? "text-mint"
            : tone === "rose"
              ? "text-rose"
              : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function PositionCard({
  position,
  revealDelay,
}: {
  position: Position;
  revealDelay: number;
}) {
  const pnlUp = position.cashPnl >= 0;
  const pricePct = Math.round(position.curPrice * 1000) / 10;

  return (
    <article
      className={`card-lift reveal d-${revealDelay} rounded-[20px] border border-border bg-card p-5`}
    >
      <div className="flex items-start gap-4">
        {position.icon ? (
          <img
            src={position.icon}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover shadow-[var(--shadow-card)]"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-soft text-sm font-semibold text-accent-ink">
            {position.title.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/market/${position.slug}`}
            className="font-medium leading-snug hover:text-accent-ink"
          >
            {position.title}
          </Link>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-ink">
              {position.outcome}
            </span>
            <span className="font-mono text-xs text-muted">
              {position.size.toFixed(1)} shares · avg{" "}
              {(position.avgPrice * 100).toFixed(1)}¢
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-lg font-semibold tracking-tight">
            {formatUsd(position.currentValue)}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${
              pnlUp ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
            }`}
          >
            {pnlUp ? "+" : ""}
            {formatUsd(position.cashPnl)} · {pnlUp ? "+" : ""}
            {position.percentPnl.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-faint">
          <span>Current odds</span>
          <span className="font-mono">{pricePct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent-soft">
          <div
            className="prob-bar h-full rounded-full bg-accent"
            style={{ width: `${pricePct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-[11px] text-faint">
          {position.endDate
            ? `Resolves ${new Date(position.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : "Resolution TBD"}
          {position.redeemable ? " · Redeemable" : ""}
        </p>
        <a
          href={`https://polymarket.com/market/${position.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-accent-ink hover:underline"
        >
          Trade →
        </a>
      </div>
    </article>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : ""}
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}