"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Catches failures from live Polymarket data
 * fetches that survive the built-in retry (see lib/polymarket.ts) —
 * a genuine outage or network issue, not routine transient hiccups.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-soft text-rose">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight">
          Couldn&apos;t reach Polymarket
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Live market data is temporarily unavailable. This is usually
          momentary — try again in a few seconds.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-press mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] hover:bg-accent-ink"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
