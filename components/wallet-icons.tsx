export function MetaMaskIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 3.5l5.2 7.7-2.1-4.2-3.1-3.5z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth=".25"
      />
      <path
        d="M19.5 3.5l-5.2 7.7 2.1-4.2 3.1-3.5z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth=".25"
      />
      <path
        d="M4.5 3.5l2.1 9.2-2.1-1.5-2.5-7.7z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth=".25"
      />
      <path
        d="M19.5 3.5l-2.1 9.2 2.1-1.5 2.5-7.7z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth=".25"
      />
      <path
        d="M8.2 14.2l-1.6 2.4 3.5 1.5 1-3.9-2.9-.9z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth=".25"
      />
      <path
        d="M15.8 14.2l1.6 2.4-3.5 1.5-1-3.9 2.9-.9z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth=".25"
      />
      <path
        d="M10.1 18.1l1.9 1.9 2-2.6-1.9-1.5-2 2.2z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth=".25"
      />
      <path
        d="M6.6 16.6l1.5 3.5 4.4-1.2-1.5-3.5-4.4 1.2z"
        fill="#233447"
        stroke="#233447"
        strokeWidth=".25"
      />
      <path
        d="M17.4 16.6l-1.5 3.5-4.4-1.2 1.5-3.5 4.4 1.2z"
        fill="#233447"
        stroke="#233447"
        strokeWidth=".25"
      />
    </svg>
  );
}

export function CoinbaseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#0052FF" />
      <path
        d="M8.2 12.5c0-2.1 1.7-3.8 3.8-3.8 1.4 0 2.6.7 3.3 1.8l2.4-2.4C16.5 6.6 14.4 5.7 12 5.7 7.9 5.7 4.5 9.1 4.5 13.2s3.4 7.5 7.5 7.5c2.4 0 4.5-.9 5.9-2.4l-2.4-2.4c-.7 1.1-1.9 1.8-3.3 1.8-2.1 0-3.8-1.7-3.8-3.8z"
        fill="#fff"
      />
    </svg>
  );
}

export function WalletConnectIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.2 8.6c3.7-3.6 9.7-3.6 13.4 0l.4.4c.2.2.2.5 0 .7l-1.5 1.5c-.1.1-.3.1-.4 0l-.6-.6c-2.6-2.5-6.8-2.5-9.4 0l-.7.7c-.1.1-.3.1-.4 0L4.8 9.7c-.2-.2-.2-.5 0-.7l.4-.4zm-1.6 3.6l1.5-1.5c.2-.2.5-.2.7 0l.7.7c2.6 2.5 6.8 2.5 9.4 0l.7-.7c.2-.2.5-.2.7 0l1.5 1.5c.2.2.2.5 0 .7l-1.5 1.5c-3.7 3.6-9.7 3.6-13.4 0l-1.5-1.5c-.2-.2-.2-.5 0-.7z"
        fill="#3B99FC"
      />
    </svg>
  );
}

export function PolygonBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      Polygon
    </span>
  );
}

export function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-faint"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function WalletGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18" />
      <path d="M16 14h.01" />
    </svg>
  );
}