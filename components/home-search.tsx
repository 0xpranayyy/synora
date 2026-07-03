"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeSearch({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeChip, setActiveChip] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  function research(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSubmitting(true);
    router.push(`/research?q=${encodeURIComponent(trimmed)}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    research(query);
  }

  return (
    <div>
      <form
        onSubmit={submit}
        className={`search-shell group relative w-full ${focused ? "search-shell-focus" : ""}`}
      >
        <svg
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 text-faint transition-colors duration-300 group-focus-within:text-accent"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What do you want to predict today?"
          className="search-input relative h-[68px] w-full rounded-full pl-14 pr-[8.5rem] text-[17px] outline-none"
        />

        <button
          type="submit"
          disabled={submitting || !query.trim()}
          className="btn-press absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Researching
            </span>
          ) : (
            "Research"
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-faint">
        Try a trending market
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion);
              setActiveChip(i);
              window.setTimeout(() => setActiveChip(null), 700);
            }}
            className={`btn-press max-w-[min(100%,320px)] truncate rounded-full px-4 py-2.5 text-xs transition-all duration-300 ${
              activeChip === i
                ? "glass-pill-active scale-[1.02] text-accent-ink"
                : "glass-pill text-muted hover:text-accent-ink"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}