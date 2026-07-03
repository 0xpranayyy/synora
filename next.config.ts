import type { NextConfig } from "next";

/**
 * CSP is strict on the vectors that actually stop XSS/clickjacking
 * (script-src, object-src, base-uri, frame-ancestors). connect-src/img-src
 * are deliberately permissive on https:/wss: — wallet extensions and
 * WalletConnect's relay can call out to a range of RPC/relay hosts that
 * vary by provider, and over-restricting here risks silently breaking
 * wallet connect in ways that are hard to catch without a live wallet.
 * Tighten these once you've confirmed the exact hosts your wallet setup
 * actually uses.
 */
// Dev/Turbopack's React Refresh relies on eval() for HMR and debug
// call-stack reconstruction — only relax script-src for that locally.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "polymarket-upload.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
