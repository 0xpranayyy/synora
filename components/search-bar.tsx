"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  large = false,
  initialQuery = "",
}: {
  large?: boolean;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitting(true);
    router.push(`/research?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <svg
        className={`absolute top-1/2 -translate-y-1/2 text-faint ${large ? "left-6" : "left-5"}`}
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
        placeholder="What do you want to predict today?"
        className={`w-full rounded-full border border-border bg-card text-foreground placeholder:text-faint outline-none shadow-[var(--shadow-card)] transition-all duration-300 focus:border-accent/40 focus:shadow-[var(--shadow-pop)] ${
          large
            ? "h-16 pl-14 pr-32 text-[17px]"
            : "h-12 pl-12 pr-28 text-sm"
        }`}
      />
      <button
        type="submit"
        disabled={submitting}
        className={`btn-press absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent text-white font-medium shadow-[var(--shadow-glow)] hover:bg-accent-ink disabled:opacity-70 ${
          large ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs"
        }`}
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
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
