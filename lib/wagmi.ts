import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

const connectors = [
  metaMask(),
  coinbaseWallet({ appName: "Synora" }),
];

if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: false,
      metadata: {
        name: "Synora",
        description: "AI Research Engine for Prediction Markets",
        url: appUrl,
        icons: [`${appUrl}/brand/synora-mark-256.png`],
      },
    })
  );
}

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [polygon.id]: http(),
  },
  ssr: true,
});

export const polygonChainId = polygon.id;
export const walletConnectEnabled = Boolean(projectId);