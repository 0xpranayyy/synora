"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useConnection, useDisconnect } from "wagmi";
import { ConnectWalletModal } from "@/components/connect-wallet-modal";
import { PolygonBadge, WalletGlyph } from "@/components/wallet-icons";
import { shortenAddress } from "@/lib/format-address";

type WalletButtonProps = {
  compact?: boolean;
  className?: string;
};

export function WalletButton({ compact, className = "" }: WalletButtonProps) {
  const { address, isConnected, isConnecting, status } = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const busy = isConnecting || status === "reconnecting";
  const widthClass = compact ? "" : "w-full";

  useEffect(() => {
    if (!menuOpen || !buttonRef.current) return;

    function updatePosition() {
      const rect = buttonRef.current!.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        left: compact ? rect.right - 220 : rect.left,
        width: Math.max(rect.width, 220),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen, compact]);

  if (isConnected && address) {
    return (
      <>
        <div className={`relative ${widthClass}`}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`btn-press group inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-card font-mono text-xs font-medium shadow-[var(--shadow-card)] hover:border-accent/45 ${
              compact ? "px-3 py-2" : "w-full px-4 py-2.5 text-sm"
            } ${className}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            {shortenAddress(address)}
            <ChevronIcon open={menuOpen} />
          </button>
        </div>

        {menuOpen &&
          mounted &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
              }}
              className="pop-in fixed z-[150] overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-pop)]"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">
                  Connected
                </p>
                <p className="mt-1 font-mono text-sm">{shortenAddress(address, 6)}</p>
                <div className="mt-2">
                  <PolygonBadge />
                </div>
              </div>

              <MenuAction
                label={copied ? "Copied!" : "Copy address"}
                onClick={async () => {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  window.setTimeout(() => {
                    setCopied(false);
                    setMenuOpen(false);
                  }, 1200);
                }}
                icon={<CopyIcon />}
                highlight={copied}
              />
              <MenuAction
                label="View on Polygonscan"
                href={`https://polygonscan.com/address/${address}`}
                onNavigate={() => setMenuOpen(false)}
                icon={<ExternalIcon />}
              />
              <MenuAction
                label="Disconnect"
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
                icon={<DisconnectIcon />}
                danger
              />
            </div>,
            document.body
          )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setModalOpen(true)}
        className={`btn-press inline-flex items-center justify-center gap-2 rounded-full bg-accent font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-105 disabled:opacity-60 ${
          compact ? "px-3.5 py-2 text-xs" : "w-full px-5 py-2.5 text-sm"
        } ${className}`}
      >
        <WalletGlyph className="h-4 w-4" />
        {busy ? "Connecting…" : compact ? "Connect" : "Connect wallet"}
      </button>

      <ConnectWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function MenuAction({
  label,
  onClick,
  href,
  onNavigate,
  icon,
  danger,
  highlight,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  onNavigate?: () => void;
  icon: React.ReactNode;
  danger?: boolean;
  highlight?: boolean;
}) {
  const className = `flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
    danger
      ? "border-t border-border text-rose hover:bg-rose-soft/40"
      : highlight
        ? "bg-mint-soft text-mint"
        : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
  }`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-faint transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v7H3V3h7" />
    </svg>
  );
}

function DisconnectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M16 12H8" />
      <path d="M19 9l3 3-3 3" />
    </svg>
  );
}