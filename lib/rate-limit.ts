import { Ratelimit } from "@upstash/ratelimit";
import { redis, warnIfRedisMissing } from "./redis";

/**
 * Per-IP sliding-window rate limit for live-data routes and pages.
 * Fails open (always allows) when Upstash isn't configured, so the app
 * keeps working for anyone who hasn't set it up yet — just unprotected.
 */
const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      prefix: "synora:ratelimit",
      analytics: true,
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!limiter) {
    warnIfRedisMissing("rate limiting");
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    // Redis hiccup shouldn't take the whole site down — fail open.
    console.error("[rate-limit] check failed, allowing request:", error);
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }
}

/** Best-effort client IP from standard proxy/edge headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
