import { PortfolioView } from "@/components/portfolio-view";

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="reveal">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">
          Connect a wallet to track positions, PnL, exposure, and get an AI
          portfolio review.
        </p>
      </div>

      <PortfolioView />
    </div>
  );
}