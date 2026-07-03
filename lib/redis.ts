import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client, shared by rate limiting and AI response caching.
 * Both env vars are optional — without them, `redis` is null and every
 * caller falls back to "no cache / no limit" rather than breaking the
 * app for anyone who hasn't set up Upstash yet.
 */
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

let warned = false;

/** Logs once per process if Redis isn't configured, instead of on every call. */
export function warnIfRedisMissing(feature: string) {
  if (redis || warned) return;
  warned = true;
  console.warn(
    `[redis] UPSTASH_REDIS_REST_URL/TOKEN not set — ${feature} is disabled. ` +
      "Set them to enable it (see .env.example)."
  );
}
