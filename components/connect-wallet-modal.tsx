"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import type { Connector } from "wagmi";
import { useConnect, useConnectors } from "wagmi";
import {
  ChevronRightIcon,
  CoinbaseIcon,
  MetaMaskIcon,
  PolygonBadge,
  WalletConnectIcon,
  WalletGlyph,
} from "@/components/wallet-icons";
import { walletConnectEnabled } from "@/lib/wagmi";
import { useWalletConnectUri } from "@/lib/use-wallet-connect-uri";

type ConnectWalletModalProps = {
  open: boolean;
  onClose: () => void;
};

type Step = "pick" | "qr";

const CONNECTOR_ORDER = ["metaMask", "coinbaseWallet", "walletConnect"];

export function ConnectWalletModal({ open, onClose }: ConnectWalletModalProps) {
  const connectors = useConnectors();
  const { mutate: connect, isPending, error, reset } = useConnect();
  const [step, setStep] = useState<Step>("pick");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const waitingForQr = open && step === "qr";
  const uri = useWalletConnectUri(waitingForQr);

  const walletOptions = useMemo(
    () => sortConnectors(connectors),
    [connectors]
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !mounted) return null;

  function handleClose() {
    reset();
    setStep("pick");
    onClose();
  }

  function handlePick(connector: Connector) {
    reset();

    if (connector.id === "walletConnect") {
      setStep("qr");
      connect(
        { connector },
        {
          onSuccess: () => handleClose(),
          onError: () => setStep("pick"),
        }
      );
      return;
    }

    handleClose();
    connect({ connector });
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#0b0d13]/50 backdrop-blur-[8px] animate-[fade-in_0.2s_ease-out]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-title"
        className="pop-in relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-border bg-card shadow-[var(--shadow-pop)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-accent-soft/80 to-transparent" />

        {step === "qr" ? (
          <QrStep
            uri={uri}
            busy={isPending}
            error={error}
            onBack={() => {
              reset();
              setStep("pick");
            }}
            onClose={handleClose}
          />
        ) : (
          <PickStep
            options={walletOptions}
            busy={isPending}
            error={error}
            onPick={handlePick}
            onClose={handleClose}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

function PickStep({
  options,
  busy,
  error,
  onPick,
  onClose,
}: {
  options: Connector[];
  busy: boolean;
  error: Error | null;
  onPick: (connector: Connector) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative px-6 pb-6 pt-7">
      <ModalHeader
        title="Connect wallet"
        subtitle="Link your wallet on Polygon to view live Polymarket positions."
        onClose={onClose}
      />

      <div className="mt-5 flex flex-col gap-2.5">
        {options.map((connector) => (
          <button
            key={connector.uid}
            type="button"
            disabled={busy}
            onClick={() => onPick(connector)}
            className="btn-press card-lift group flex items-center gap-3.5 rounded-[18px] border border-border bg-card/80 px-4 py-3.5 text-left disabled:opacity-60"
          >
            <ConnectorIcon connector={connector} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold tracking-tight">
                {connectorLabel(connector)}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">
                {connectorHint(connector)}
              </span>
            </span>
            <ChevronRightIcon />
          </button>
        ))}
      </div>

      {error && <ConnectError error={error} />}

      {!walletConnectEnabled && (
        <p className="mt-5 rounded-2xl border border-border bg-foreground/[0.02] px-3.5 py-3 text-center text-[11px] leading-relaxed text-faint">
          Mobile wallets need a WalletConnect project ID in your env.
        </p>
      )}
    </div>
  );
}

function QrStep({
  uri,
  busy,
  error,
  onBack,
  onClose,
}: {
  uri: string | null;
  busy: boolean;
  error: Error | null;
  onBack: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative px-6 pb-6 pt-5">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-press rounded-full border border-border bg-card/80 p-2 text-faint hover:text-foreground"
          aria-label="Back"
        >
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h2
            id="connect-wallet-title"
            className="text-lg font-semibold tracking-tight"
          >
            Scan to connect
          </h2>
          <p className="text-sm text-muted">WalletConnect · Polygon</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-faint hover:bg-foreground/[0.05] hover:text-foreground"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative mx-auto w-fit">
        <div
          className={`absolute -inset-3 rounded-[28px] border border-accent/20 bg-accent-soft/30 ${
            !uri ? "animate-pulse" : ""
          }`}
        />
        <div className="relative rounded-[22px] border border-border bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex h-[200px] w-[200px] items-center justify-center">
            {uri ? (
              <QRCode
                value={uri}
                size={184}
                bgColor="#ffffff"
                fgColor="#191a23"
                level="M"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                <p className="text-xs text-muted">
                  {busy ? "Generating QR…" : "Starting session…"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {uri && (
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(uri);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
          className={`btn-press mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
            copied
              ? "border-mint/30 bg-mint-soft text-mint"
              : "border-border text-muted hover:border-accent/40 hover:text-foreground"
          }`}
        >
          {copied ? "Copied to clipboard" : "Copy pairing link"}
        </button>
      )}

      <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
        Works with Rainbow, MetaMask Mobile, Trust Wallet, and other
        WalletConnect apps.
      </p>

      {error && <ConnectError error={error} />}
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full p-1.5 text-faint hover:bg-foreground/[0.05] hover:text-foreground"
      >
        <CloseIcon />
      </button>

      <div className="flex items-start gap-3.5 pr-10">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card/90 text-accent-ink shadow-[var(--shadow-card)]">
          <WalletGlyph className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="connect-wallet-title"
              className="text-lg font-semibold tracking-tight"
            >
              {title}
            </h2>
            <PolygonBadge />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
      </div>
    </>
  );
}

function ConnectError({ error }: { error: Error }) {
  return (
    <p className="mt-4 rounded-2xl border border-rose/15 bg-rose-soft px-3.5 py-2.5 text-xs text-rose">
      {error.message.toLowerCase().includes("rejected")
        ? "Connection cancelled."
        : "Could not connect. Try again or pick another wallet."}
    </p>
  );
}

function sortConnectors(connectors: readonly Connector[]) {
  const unique = new Map<string, Connector>();
  for (const connector of connectors) {
    if (!unique.has(connector.id)) unique.set(connector.id, connector);
  }

  return [...unique.values()].sort((a, b) => {
    const aIndex = CONNECTOR_ORDER.indexOf(a.id);
    const bIndex = CONNECTOR_ORDER.indexOf(b.id);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function connectorLabel(connector: Connector): string {
  if (connector.id === "metaMask") return "MetaMask";
  if (connector.id === "coinbaseWallet") return "Coinbase Wallet";
  if (connector.id === "walletConnect") return "WalletConnect";
  return connector.name;
}

function connectorHint(connector: Connector): string {
  if (connector.id === "metaMask") return "Browser extension";
  if (connector.id === "coinbaseWallet") return "Coinbase extension or app";
  if (connector.id === "walletConnect") return "Scan QR with your phone";
  return "Connect via browser wallet";
}

function ConnectorIcon({ connector }: { connector: Connector }) {
  const shell =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-foreground/[0.02] shadow-[var(--shadow-card)]";

  if (connector.id === "metaMask") {
    return (
      <span className={shell}>
        <MetaMaskIcon className="h-6 w-6" />
      </span>
    );
  }
  if (connector.id === "coinbaseWallet") {
    return (
      <span className={shell}>
        <CoinbaseIcon className="h-6 w-6" />
      </span>
    );
  }
  if (connector.id === "walletConnect") {
    return (
      <span className={shell}>
        <WalletConnectIcon className="h-6 w-6" />
      </span>
    );
  }
  return (
    <span className={shell}>
      <WalletGlyph className="h-5 w-5 text-muted" />
    </span>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}