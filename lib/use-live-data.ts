"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls a fetcher on an interval and keeps data fresh while the tab is
 * visible, pausing when it isn't (backgrounded tabs don't burn requests).
 * Seeded with server-rendered data so there's no loading flash on mount.
 */
export function useLiveData<T>(
  initialData: T,
  fetcher: () => Promise<T>,
  {
    intervalMs = 12_000,
    enabled = true,
  }: { intervalMs?: number; enabled?: boolean } = {}
) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const next = await fetcherRef.current();
      setData(next);
      setLastUpdated(new Date());
    } catch {
      // Keep showing the last good data; next tick tries again.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled || document.hidden) return;
      refresh();
    };

    // Refresh immediately when this instance becomes active (e.g. a
    // just-switched-to tab), then settle into the regular interval.
    tick();
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, intervalMs, refresh]);

  return { data, refresh, isRefreshing, lastUpdated };
}
