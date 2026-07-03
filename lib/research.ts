import Anthropic from "@anthropic-ai/sdk";
import type { Confidence, Market, PricePoint, Research } from "./types";
import { formatUsd } from "./polymarket";

type ResearchProvider = "auto" | "anthropic" | "ollama" | "quant";

function provider(): ResearchProvider {
  const value = process.env.AI_PROVIDER?.toLowerCase();
  if (
    value === "anthropic" ||
    value === "ollama" ||
    value === "quant" ||
    value === "auto"
  ) {
    return value;
  }
  return "auto";
}

export function hasAiCredentials(): boolean {
  return Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
  );
}

export function hasOllamaConfig(): boolean {
  return Boolean(process.env.OLLAMA_MODEL || process.env.AI_PROVIDER === "ollama");
}

export async function runResearch(
  market: Market,
  history: PricePoint[],
  query: string
): Promise<Research> {
  const selected = provider();

  if ((selected === "anthropic" || selected === "auto") && hasAiCredentials()) {
    try {
      return await aiResearch(market, history, query);
    } catch (error) {
      console.error("AI research failed, falling back to quant:", error);
    }
  }

  if (selected === "ollama" || (selected === "auto" && hasOllamaConfig())) {
    try {
      return await ollamaResearch(market, history, query);
    } catch (error) {
      console.error("Local LLM research failed, falling back to quant:", error);
    }
  }

  return quantResearch(market, history);
}

/* ————— AI research: Claude + live web search ————— */

const RESEARCH_SCHEMA = `{
  "summary": string,            // one tight paragraph: what the market prices and why, grounded in current probability and recent news
  "confidence": "Low" | "Medium" | "High",  // how much evidence supports a firm read
  "bullCase": string[],         // 3-5 evidence-backed reasons YES resolves true
  "bearCase": string[],         // 3-5 evidence-backed reasons NO resolves true
  "news": [{ "title": string, "source": string, "date": string (ISO), "summary": string, "url": string }],  // 2-4 real recent items found via search
  "timeline": [{ "date": string (ISO), "title": string, "description": string }],  // 3-5 key chronological events
  "resolution": string,         // the resolution criteria explained in plain language
  "insight": string,            // your sharpest analytical take: what traders may be mispricing, key catalysts, how market pricing compares to evidence
  "followUps": string[],        // 4 natural follow-up research questions
  "sources": [{ "label": string, "url": string }]  // every source you actually used
}`;

async function aiResearch(
  market: Market,
  history: PricePoint[],
  query: string
): Promise<Research> {
  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
    system: `You are Synora, an AI research engine for prediction markets. You produce rigorous, evidence-based research briefs for traders. Never fabricate facts, quotes, dates, or URLs — every claim in news/sources must come from your web search results or the market data provided. Clearly analytical, never promotional. Output ONLY a single JSON object matching the requested schema — no markdown fences, no prose before or after.`,
    messages: [
      {
        role: "user",
        content: `Research this Polymarket prediction market for a trader deciding whether to take a position.

User's question: ${JSON.stringify(query)}

Market data (live from Polymarket):
- Question: ${market.question}
- Current YES probability: ${market.probability}%
- 24h change: ${market.change24h} percentage points
- Total volume: ${formatUsd(market.volumeUsd)} | 24h volume: ${formatUsd(market.volume24hUsd)} | Liquidity: ${formatUsd(market.liquidityUsd)}
- Resolves by: ${market.endDate ?? "unknown"}
- Resolution criteria: ${market.description.slice(0, 1500)}
- Recent YES price history (unix seconds, probability 0-1): ${JSON.stringify(summarizeHistory(history))}

Search the web for the latest relevant news and evidence before writing. Then respond with ONLY a JSON object of this shape:
${RESEARCH_SCHEMA}`,
      },
    ],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("Model declined the research request");
  }

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  const parsed = extractJson(text);

  const confidence: Confidence = ["Low", "Medium", "High"].includes(
    parsed.confidence
  )
    ? parsed.confidence
    : "Medium";

  return {
    confidence,
    summary: str(parsed.summary),
    bullCase: strArray(parsed.bullCase),
    bearCase: strArray(parsed.bearCase),
    news: Array.isArray(parsed.news)
      ? parsed.news
          .filter((n: Record<string, unknown>) => n && n.title && n.url)
          .map((n: Record<string, unknown>) => ({
            title: str(n.title),
            source: str(n.source),
            date: n.date ? str(n.date) : undefined,
            summary: str(n.summary),
            url: str(n.url),
          }))
      : [],
    timeline: Array.isArray(parsed.timeline)
      ? parsed.timeline.map((t: Record<string, unknown>) => ({
          date: str(t.date),
          title: str(t.title),
          description: str(t.description),
        }))
      : [],
    resolution: str(parsed.resolution) || market.description,
    insight: str(parsed.insight),
    followUps: strArray(parsed.followUps).slice(0, 4),
    sources: dedupeSources([
      ...(Array.isArray(parsed.sources)
        ? parsed.sources
            .filter((s: Record<string, unknown>) => s && s.url)
            .map((s: Record<string, unknown>) => ({
              label: str(s.label) || str(s.url),
              url: str(s.url),
            }))
        : []),
      { label: "Polymarket market page", url: market.url },
    ]),
    mode: "ai",
  };
}

function extractJson(text: string): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON in AI response");
  return JSON.parse(text.slice(start, end + 1));
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function dedupeSources(sources: { label: string; url: string }[]) {
  const seen = new Set<string>();
  return sources.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

/** Downsample history so the prompt stays small. */
function summarizeHistory(history: PricePoint[]): PricePoint[] {
  if (history.length <= 30) return history;
  const step = Math.ceil(history.length / 30);
  return history.filter((_, i) => i % step === 0 || i === history.length - 1);
}

/* ————— Local open LLM research: Ollama, grounded in Polymarket data ————— */

async function ollamaResearch(
  market: Market,
  history: PricePoint[],
  query: string
): Promise<Research> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct";
  const controller = new AbortController();
  const timeout = windowlessTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: { temperature: 0.2 },
        prompt: localResearchPrompt(market, history, query),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Ollama ${res.status}`);
    }

    const data = await res.json();
    const parsed = extractJson(str(data?.response));
    const confidence: Confidence = ["Low", "Medium", "High"].includes(
      parsed.confidence
    )
      ? parsed.confidence
      : "Medium";

    return {
      confidence,
      summary: str(parsed.summary),
      bullCase: strArray(parsed.bullCase).slice(0, 5),
      bearCase: strArray(parsed.bearCase).slice(0, 5),
      news: [],
      timeline: Array.isArray(parsed.timeline)
        ? parsed.timeline.slice(0, 5).map((t: Record<string, unknown>) => ({
            date: str(t.date),
            title: str(t.title),
            description: str(t.description),
          }))
        : buildQuantTimeline(market, history),
      resolution: str(parsed.resolution) || market.description,
      insight: str(parsed.insight),
      followUps: strArray(parsed.followUps).slice(0, 4),
      sources: [{ label: "Polymarket market page", url: market.url }],
      mode: "local",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function localResearchPrompt(
  market: Market,
  history: PricePoint[],
  query: string
): string {
  return `You are Synora, an analyst for prediction markets. Analyze ONLY the Polymarket data supplied below. Do not invent news, sources, prices, trades, or facts. If data is missing, say it is missing.

Return ONLY a JSON object matching this schema:
${RESEARCH_SCHEMA}

Because no web search is available in this local open-model mode:
- "news" must be []
- "sources" must only include supplied Polymarket source URLs
- bull/bear cases must be based on probability, orderbook, volume, liquidity, price history, and resolution criteria

User query: ${JSON.stringify(query)}

Polymarket packet:
${JSON.stringify(
  {
    question: market.question,
    eventTitle: market.eventTitle,
    yesProbabilityPercent: market.probability,
    change24hPercentagePoints: market.change24h,
    volumeUsd: market.volumeUsd,
    volume24hUsd: market.volume24hUsd,
    liquidityUsd: market.liquidityUsd,
    endDate: market.endDate,
    resolutionCriteria: market.description,
    clob: {
      yesTokenId: market.yesTokenId,
      bestBid: market.bestBid,
      bestAsk: market.bestAsk,
      midpoint: market.midpoint,
      spread: market.spread,
      lastTradePrice: market.lastTradePrice,
      orderBookHash: market.orderBookHash,
    },
    priceHistory: summarizeHistory(history),
    source: market.url,
  },
  null,
  2
)}`;
}

function windowlessTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms);
}

/* ————— Quant fallback: real market data only, nothing invented ————— */

function quantResearch(market: Market, history: PricePoint[]): Research {
  const prices = history.map((h) => h.p * 100);
  const first = prices[0] ?? market.probability;
  const last = prices[prices.length - 1] ?? market.probability;
  const high = prices.length ? Math.max(...prices) : market.probability;
  const low = prices.length ? Math.min(...prices) : market.probability;
  const trend = last - first;
  const rising = trend >= 0;

  const confidence: Confidence =
    market.liquidityUsd > 1_000_000
      ? "High"
      : market.liquidityUsd > 200_000
        ? "Medium"
        : "Low";

  const timeline = buildQuantTimeline(market, history);

  return {
    confidence,
    summary: `The market prices YES at ${market.probability}%, ${
      market.change24h >= 0 ? "up" : "down"
    } ${Math.abs(market.change24h).toFixed(1)} points in the last 24 hours on ${formatUsd(
      market.volume24hUsd
    )} of daily volume. Over the charted period the probability has ranged between ${low.toFixed(
      1
    )}% and ${high.toFixed(1)}%, ${
      rising ? "trending upward" : "trending downward"
    } by ${Math.abs(trend).toFixed(1)} points overall. Liquidity of ${formatUsd(
      market.liquidityUsd
    )} makes this ${
      market.liquidityUsd > 500_000
        ? "a deep market where quotes are meaningful"
        : "a thinner market — treat the printed probability with some caution"
    }.`,
    bullCase: [
      `Buyers of YES have ${
        rising ? "been in control across the charted period" : "defended the recent range"
      } — the probability ${
        rising
          ? `climbed from ${first.toFixed(1)}% to ${last.toFixed(1)}%`
          : `has held above its ${low.toFixed(1)}% low`
      }.`,
      `Sustained volume (${formatUsd(
        market.volumeUsd
      )} lifetime) means the current price reflects real position-taking, not a stale quote.`,
      `At ${market.probability}%, YES pays roughly ${payout(market.probability)}x if the event occurs.`,
    ],
    bearCase: [
      `The market has traded as ${
        rising ? "low" : "high"
      } as ${(rising ? low : high).toFixed(1)}% in this period — pricing is not settled.`,
      `At ${market.probability}%, NO pays roughly ${payout(100 - market.probability)}x if the event fails.`,
      `Resolution is strict — read the criteria below carefully; markets often resolve NO on technicalities.`,
    ],
    news: [],
    timeline,
    resolution: market.description,
    insight: `This is a quantitative read derived from live Polymarket data only — no AI or news research was performed. Connect Ollama for local open-model analysis, or a hosted AI key for web-grounded research. Structurally: ${
      market.liquidityUsd > 500_000
        ? "liquidity is deep enough that the printed probability is a credible consensus estimate"
        : "liquidity is thin, so the printed probability can move sharply on small orders"
    }, and the ${Math.abs(market.change24h).toFixed(1)}-point 24h move ${
      Math.abs(market.change24h) > 3
        ? "suggests new information is being priced in right now — check the news before trading"
        : "suggests no major new information in the last day"
    }.`,
    followUps: [
      `What news has moved "${market.eventTitle}" recently?`,
      "Explain the resolution criteria in plain language",
      "What are the highest-volume markets right now?",
      "Show me markets ending soon",
    ],
    sources: [{ label: "Polymarket market page", url: market.url }],
    mode: "quant",
  };
}

function payout(probability: number): string {
  if (probability <= 0) return "—";
  return (100 / probability).toFixed(1);
}

function buildQuantTimeline(market: Market, history: PricePoint[]) {
  if (history.length < 2) return [];
  const points = [...history];
  const maxPoint = points.reduce((a, b) => (b.p > a.p ? b : a));
  const minPoint = points.reduce((a, b) => (b.p < a.p ? b : a));
  const events = [
    {
      date: iso(points[0].t),
      title: `Charted period opens at ${(points[0].p * 100).toFixed(1)}%`,
      description: "Start of the available price history window.",
    },
    {
      date: iso(maxPoint.t),
      title: `Period high: ${(maxPoint.p * 100).toFixed(1)}%`,
      description: "Peak market-implied probability of YES.",
    },
    {
      date: iso(minPoint.t),
      title: `Period low: ${(minPoint.p * 100).toFixed(1)}%`,
      description: "Lowest market-implied probability of YES.",
    },
    {
      date: iso(points[points.length - 1].t),
      title: `Currently ${market.probability}%`,
      description: `Latest print with ${formatUsd(market.volume24hUsd)} of 24h volume.`,
    },
  ];
  return events
    .filter((e, i, arr) => arr.findIndex((x) => x.date === e.date) === i)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function iso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}
