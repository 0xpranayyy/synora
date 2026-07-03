"use client";

import { useState } from "react";
import { polygon } from "wagmi/chains";
import { useChainId, useConnection, useSwitchChain } from "wagmi";
import { polygonChainId } from "@/lib/wagmi";

/** Prompts a switch to Polygon when the wallet is on the wrong network. */
export function ChainGuard() {
  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { mutate: switchChain, isPending } = useSwitchChain();
  const [dismissed, setDismissed] = useState(false);

  const wrongChain = isConnected && chainId !== polygonChainId;

  if (!wrongChain || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="pop-in flex items-start gap-3 rounded-[20px] border border-peach/20 bg-card p-4 shadow-[var(--shadow-pop)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-peach-soft text-peach">
          <NetworkIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-tight">Wrong network</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Switch to <span className="text-foreground">{polygon.name}</span> to
            use Polymarket features.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => switchChain({ chainId: polygonChainId })}
              className="btn-press rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60"
            >
              {isPending ? "Switching…" : "Switch to Polygon"}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-full px-3 py-2 text-xs text-muted hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  );
}