import { redis, warnIfRedisMissing } from "./redis";

/**
 * Caches the result of an expensive call (hosted/local AI inference)
 * behind a Redis key with a TTL. Without Upstash configured, this is a
 * no-op passthrough — every call just runs `compute()` fresh, same as
 * before caching existed.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  if (!redis) {
    warnIfRedisMissing("AI response caching");
    return compute();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch (error) {
    console.error("[cache] read failed, computing fresh:", error);
  }

  const value = await compute();

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("[cache] write failed:", error);
  }

  return value;
}
