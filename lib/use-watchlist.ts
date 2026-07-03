"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "synora.watchlist";
const EVENT = "synora:watchlist";
const EMPTY: string[] = [];

// Cache the parsed array so getSnapshot returns a stable reference
// until the underlying value actually changes.
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;

function getSnapshot(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedIds = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    } catch {
      cachedIds = EMPTY;
    }
  }
  return cachedIds;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Watchlist persisted to localStorage, synced across components and tabs. */
export function useWatchlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  // False during SSR/hydration, true once client state is live —
  // lets pages show a skeleton instead of flashing the empty state.
  const loaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { ids, loaded, toggle, has: (id: string) => ids.includes(id) };
}
