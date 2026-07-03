"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./wallet-button";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/watchlist", label: "Watchlist", icon: StarIcon },
  { href: "/portfolio", label: "Portfolio", icon: ChartIcon },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const activeIndex = items.findIndex(({ href }) => isActive(href, pathname));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col px-5 py-7 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2.5 px-2 mb-10 group">
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
        <nav className="flex flex-col gap-1.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`btn-press group/link relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-card text-accent-ink shadow-[var(--shadow-card)]"
                    : "text-muted hover:text-foreground hover:bg-card/60"
                }`}
              >
                <span
                  className={`nav-rail ${active ? "nav-rail-active" : ""}`}
                  aria-hidden
                />
                <span
                  className={`transition-transform duration-300 ease-out group-hover/link:scale-110 ${
                    active
                      ? "text-accent-ink drop-shadow-[0_0_10px_rgba(124,137,255,0.5)]"
                      : ""
                  }`}
                >
                  <Icon filled={active} />
                </span>
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
      <div className="md:hidden fixed top-4 right-4 z-50">
        <WalletButton compact />
      </div>

      {/* Mobile floating dock */}
      <nav className="md:hidden fixed inset-x-3 z-50 bottom-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="nav-dock relative flex items-stretch p-1.5">
          {activeIndex >= 0 && (
            <span
              aria-hidden
              className="nav-dock-indicator"
              style={{
                width: `calc((100% - 0.75rem) / ${items.length})`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          )}
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative z-10 flex flex-1 flex-col items-center gap-1 rounded-3xl py-2 text-[10px] font-medium transition-transform duration-200 active:scale-90"
              >
                <span
                  className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    active
                      ? "-translate-y-px scale-110 text-accent-ink drop-shadow-[0_0_9px_rgba(124,137,255,0.55)]"
                      : "text-faint"
                  }`}
                >
                  <Icon filled={active} />
                </span>
                <span
                  className={`transition-colors duration-300 ${
                    active ? "text-accent-ink" : "text-faint"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function HomeIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M4.5 9.8 12 3.5l7.5 6.3V20a1 1 0 0 1-1 1h-4.6v-5.6a1.9 1.9 0 0 0-3.8 0V21H5.5a1 1 0 0 1-1-1z"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.22 : 0}
      />
    </svg>
  );
}

function CompassIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.22 : 0}
      />
      <path
        d="m15.5 8.5-2 5-5 2 2-5z"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.85 : 0}
      />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9z"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.22 : 0}
      />
    </svg>
  );
}

function ChartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10" strokeWidth={filled ? 3 : 1.8} />
      <path d="M10 20V4" strokeWidth={filled ? 3 : 1.8} />
      <path d="M16 20v-8" strokeWidth={filled ? 3 : 1.8} />
      <path d="M22 20H2" />
    </svg>
  );
}
