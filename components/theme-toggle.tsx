"use client";

import { useTheme } from "next-themes";

/** Sun/moon toggle with a cross-fade + rotate morph. Adds a temporary
 *  class to <html> so every surface transitions colors together. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { setTheme } = useTheme();

  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className={`btn-press relative inline-flex items-center justify-center rounded-full border border-border bg-card text-muted shadow-[var(--shadow-card)] hover:text-foreground hover:border-accent/40 ${
        compact ? "h-9 w-9" : "h-10 w-10"
      }`}
    >
      {/* Sun */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute opacity-100 rotate-0 scale-100 transition-all duration-500 ease-[cubic-bezier(0.21,0.68,0.24,1)] dark:opacity-0 dark:rotate-90 dark:scale-[0.4]"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
      {/* Moon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute -rotate-90 scale-[0.4] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.21,0.68,0.24,1)] dark:rotate-0 dark:scale-100 dark:opacity-100"
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
      </svg>
    </button>
  );
}
