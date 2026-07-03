import type { PortfolioSummary, PortfolioReview } from "./types";
import { withCache } from "./cache";
import {
  computeExposure,
  quantPortfolioReview,
} from "./portfolio-analysis";
import { hasAiCredentials, hasOllamaConfig } from "./research";

/** Shorter than research caching — portfolio value shifts faster. */
const PORTFOLIO_REVIEW_CACHE_TTL_SECONDS = 300;

export type PortfolioAnalysis = {
  exposure: ReturnType<typeof computeExposure>;
  review: PortfolioReview;
};

export async function analyzePortfolio(
  portfolio: PortfolioSummary
): Promise<PortfolioAnalysis> {
  const exposure = computeExposure(
    portfolio.positions,
    portfolio.totalValue
  );

  const quant = quantPortfolioReview(portfolio, exposure);

  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? "auto";

  if (
    portfolio.positionCount > 0 &&
    (provider === "anthropic" || provider === "auto") &&
    hasAiCredentials()
  ) {
    try {
      const ai = await withCache(
        `portfolio-review:ai:${portfolio.address}`,
        PORTFOLIO_REVIEW_CACHE_TTL_SECONDS,
        () => aiPortfolioReview(portfolio, exposure)
      );
      return { exposure, review: ai };
    } catch (error) {
      console.error("AI portfolio review failed, using quant:", error);
    }
  }

  if (
    portfolio.positionCount > 0 &&
    (provider === "ollama" || (provider === "auto" && hasOllamaConfig()))
  ) {
    try {
      const local = await withCache(
        `portfolio-review:local:${portfolio.address}`,
        PORTFOLIO_REVIEW_CACHE_TTL_SECONDS,
        () => ollamaPortfolioReview(portfolio, exposure)
      );
      return { exposure, review: local };
    } catch (error) {
      console.error("Local portfolio review failed, using quant:", error);
    }
  }

  return { exposure, review: quant };
}

async function aiPortfolioReview(
  portfolio: PortfolioSummary,
  exposure: ReturnType<typeof computeExposure>
): Promise<PortfolioReview> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    system:
      "You are Synora, a prediction-market portfolio analyst. Analyze ONLY the position data provided. Output ONLY valid JSON matching the schema. Never invent positions or prices.",
    messages: [
      {
        role: "user",
        content: `Review this Polymarket portfolio. Schema: {"summary":string,"confidence":"Low"|"Medium"|"High","risks":string[],"strengths":string[],"insight":string}

Data:
${JSON.stringify({ portfolio, exposure }, null, 2)}`,
      },
    ],
  });

  const text =
    message.content[0]?.type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

  return {
    mode: "ai",
    confidence: parsed.confidence ?? "Medium",
    summary: String(parsed.summary ?? ""),
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.map(String)
      : [],
    insight: String(parsed.insight ?? ""),
  };
}

async function ollamaPortfolioReview(
  portfolio: PortfolioSummary,
  exposure: ReturnType<typeof computeExposure>
): Promise<PortfolioReview> {
  const base =
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";
  const model =
    process.env.OLLAMA_MODEL?.trim() || "qwen2.5:7b-instruct";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are Synora portfolio analyst. Analyze ONLY the JSON data. Respond with ONLY a JSON object: {\"summary\":string,\"confidence\":\"Low\"|\"Medium\"|\"High\",\"risks\":string[],\"strengths\":string[],\"insight\":string}",
          },
          {
            role: "user",
            content: JSON.stringify({ portfolio, exposure }),
          },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  const text = data?.message?.content ?? "";
  const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

  return {
    mode: "local",
    confidence: parsed.confidence ?? "Medium",
    summary: String(parsed.summary ?? ""),
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.map(String)
      : [],
    insight: String(parsed.insight ?? ""),
  };
}