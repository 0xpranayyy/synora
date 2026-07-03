# Synora

**The AI Research Engine for Prediction Markets.**

Ask a question — get the matching live market, current probability, price history, bull and bear cases, recent news, and AI insight before you trade. Connect a wallet to track Polymarket positions, exposure, and portfolio review. Think *Perplexity for prediction markets*.

## What's real

Everything renders from live data — there is no mock layer:

- **Markets, probabilities, volume, liquidity, resolution rules** — Polymarket Gamma API (live on home & discover; cached elsewhere)
- **Discover feeds** — trending, hot movers, featured, ending soon via `/api/discover` with `cache: no-store`
- **Price history and microstructure** — Polymarket CLOB `prices-history`, orderbook, midpoint, spread
- **Search** — Polymarket public search, re-ranked by keyword relevance + volume
- **Portfolio** — live positions, PnL, and exposure from Polymarket Data API; AI or quant portfolio review
- **Web3** — WalletConnect + injected wallets on Polygon; portfolio tied to connected address
- **AI analysis** — local open LLM via Ollama, hosted Claude with live web search, or deterministic quant mode

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `ollama`, `anthropic`, `quant`, or `auto` (default) |
| `OLLAMA_BASE_URL` | Local Ollama endpoint (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Model name, e.g. `qwen2.5:7b-instruct` |
| `ANTHROPIC_API_KEY` | Hosted Claude for market research + portfolio review |
| `NEXT_PUBLIC_APP_URL` | App URL for WalletConnect metadata |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional WalletConnect project ID |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional — enables per-IP rate limiting and AI response caching (see Production hardening below) |

For free local AI, install Ollama and pull a model:

```bash
ollama pull qwen2.5:7b-instruct
```

Keep `AI_PROVIDER=ollama` in `.env.local`. If Ollama is not running, research and portfolio pages fall back to **quant mode**: deterministic analysis from live Polymarket data only.

For hosted web-grounded research, set `AI_PROVIDER=anthropic` and add `ANTHROPIC_API_KEY`.

### Web3

MetaMask and Coinbase Wallet work without a WalletConnect project ID. For WalletConnect QR pairing, create a free project at [cloud.walletconnect.com](https://cloud.walletconnect.com) and set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

Portfolio reads use your connected wallet address, resolves the Polymarket proxy wallet when present, and fetches open positions from the Data API.

## Production hardening

- **Rate limiting** (`proxy.ts`) — 30 requests/60s per IP across all API routes and the AI/live-data pages, backed by Upstash Redis. Without `UPSTASH_REDIS_REST_URL`/`TOKEN` set, this fails open (no limiting) rather than breaking the app — set them before real public traffic.
- **AI response caching** (`lib/cache.ts`) — hosted/local AI research and portfolio review results are cached per market/wallet for 5–10 minutes via the same Redis instance, so repeat visits don't re-bill the AI provider. Same fail-open behavior without Upstash configured.
- **Live-fetch resilience** — Gamma API calls get a 10s timeout and one automatic retry on network errors/429/5xx (`lib/polymarket.ts`); a root `app/error.tsx` boundary catches anything that still fails.
- **Security headers** (`next.config.ts`) — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy on every response. `connect-src`/`img-src` are intentionally permissive (`https:`/`wss:`) since wallet extensions and WalletConnect's relay call a range of hosts that vary by provider — tighten these once you've confirmed your exact wallet setup.
- Before enabling `AI_PROVIDER=anthropic` in production, set up Upstash first — without caching, every page view re-runs a full Claude Opus + web search call with no cap.

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables from `.env.example` in the Vercel dashboard.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://synora.vercel.app`).
5. Deploy — Next.js App Router runs API routes server-side; no extra config required.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 — design tokens in `app/globals.css`
- wagmi + viem + WalletConnect for Web3
- TanStack Query for client-side portfolio caching
- Ollama-compatible local open models for free AI analysis
- Optional `@anthropic-ai/sdk` hosted AI (server-side only)
- `@polymarket/clob-client` — official SDK for order book, price, and trade data
- Optional Upstash Redis for rate limiting and AI response caching
- Inter + JetBrains Mono via `next/font`

## Structure

```
app/
  page.tsx              # Home — live trending, search, animated hero
  research/             # Research workspace (?q=...), streams via Suspense
  market/[slug]/        # Market pages: stats, price chart, AI research
  discover/             # Trending / hot / featured / ending soon + categories
  portfolio/            # Wallet-connected positions, exposure, AI review
  watchlist/            # Saved markets, live prices (localStorage + API)
  api/discover/         # Live discover feed collections
  api/portfolio/        # Live positions + exposure + review
  api/markets/          # Resolves watchlist slugs to live market data
components/             # Nav, search, cards, charts, wallet UI, skeletons
lib/
  polymarket.ts         # Gamma + CLOB fetchers, normalization, search
  discover.ts           # Unified discover feeds (trending, hot, featured)
  polymarket-portfolio.ts  # Data API positions + portfolio value
  portfolio-analysis.ts # Exposure grouping + quant review
  portfolio-review.ts   # AI / Ollama / quant portfolio review routing
  research.ts           # AI provider routing for market research
  wagmi.ts              # Chain + connector config (Polygon)
  types.ts              # Shared shapes
```

## Design

Dual-theme design system with light and dark modes (system-preference aware, toggle in the nav, persisted via `next-themes`, no flash on load). Light: lavender-white `#F7F6FC` with white cards; dark: deep ink `#0B0D13` with `#14161F` cards. Shared pastel accents — periwinkle, mint/rose for up/down — every color, border, shadow, chart gridline, and skeleton driven by CSS tokens in `app/globals.css`.

Micro-animations throughout: staggered fade-up reveals, card hover lifts, animated probability bars, line-draw charts, count-up numbers, a sun/moon morphing theme toggle with a full-surface color cross-fade, shimmer skeletons, and instant route-level loading states on every page. All CSS/rAF, honoring `prefers-reduced-motion`.

Research, not financial advice.