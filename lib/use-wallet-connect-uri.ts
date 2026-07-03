"use client";

import { useEffect, useState } from "react";
import { useConnectors } from "wagmi";

/** Listen for WalletConnect pairing URIs from the connector emitter. */
export function useWalletConnectUri(active: boolean) {
  const connectors = useConnectors();
  const [uri, setUri] = useState<string | null>(null);

  const walletConnect = connectors.find(
    (connector) => connector.id === "walletConnect"
  );
  const enabled = active && Boolean(walletConnect);

  useEffect(() => {
    if (!enabled) return;

    function onMessage(message: { type: string; data?: unknown }) {
      if (message.type === "display_uri" && typeof message.data === "string") {
        setUri(message.data);
      }
    }

    walletConnect!.emitter.on("message", onMessage);
    return () => {
      walletConnect!.emitter.off("message", onMessage);
      setUri(null);
    };
  }, [enabled, walletConnect]);

  return enabled ? uri : null;
}