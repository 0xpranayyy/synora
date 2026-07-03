import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ChainGuard } from "@/components/chain-guard";
import { Nav } from "@/components/nav";
import { Web3Provider } from "@/components/web3-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synora — AI Research Engine for Prediction Markets",
  description:
    "Ask a question. Get probabilities, evidence, and insight before you trade.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d13",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Web3Provider>
          <div className="flex min-h-screen">
            <Nav />
            <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>
          </div>
          <ChainGuard />
        </Web3Provider>
      </body>
    </html>
  );
}
