"use client";

import { useWatchlist } from "@/lib/use-watchlist";

export function WatchlistButton({ slug }: { slug: string }) {
  const { has, toggle, loaded } = useWatchlist();
  const saved = loaded && has(slug);

  return (
    <button
      onClick={() => toggle(slug)}
      className={`btn-press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ${
        saved
          ? "bg-accent text-white shadow-[var(--shadow-glow)]"
          : "bg-card text-muted border border-border shadow-[var(--shadow-card)] hover:text-foreground hover:border-accent/40"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300"
        style={{ transform: saved ? "scale(1.1) rotate(72deg)" : undefined }}
      >
        <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9z" />
      </svg>
      {saved ? "Watching" : "Watch"}
    </button>
  );
}
