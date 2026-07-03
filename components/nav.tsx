"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/watchlist", label: "Watchlist", icon: StarIcon },
  { href: "/portfolio", label: "Portfolio", icon: ChartIcon },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col px-5 py-7 sticky top-0 h-screen">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2.5 px-2 group">
            {/* Fixed dark tile regardless of theme — the mark's chrome/silver
                palette needs a dark backdrop for contrast; bg-card would
                flip to near-white in light mode and wash it out. */}
            <span className="h-9 w-9 rounded-xl border border-white/10 bg-[#14161f] flex items-center justify-center shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
              <Image
                src="/brand/synora-mark.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain drop-shadow-[0_4px_10px_rgba(74,88,216,0.22)]"
              />
            </span>
            <span className="font-semibold tracking-tight text-[17px]">
              Synora
            </span>
          </Link>
          <ThemeToggle compact />
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`btn-press flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-card text-accent-ink shadow-[var(--shadow-card)]"
                    : "text-muted hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6">
          <WalletButton />
        </div>
        <div className="mt-auto rounded-2xl bg-accent-soft/70 border border-accent/10 px-4 py-3.5">
          <p className="text-xs font-medium text-accent-ink">
            Research, not advice
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Live data from Polymarket. Verify sources before trading.
          </p>
        </div>
      </aside>

      {/* Mobile header actions */}
      <div className="md:hidden fixed top-4 right-4 z-50 flex items-center gap-2">
        <WalletButton compact />
        <ThemeToggle compact />
      </div>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/85 backdrop-blur-xl flex pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-accent-ink" : "text-faint"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-8" />
      <path d="M22 20H2" />
    </svg>
  );
}
