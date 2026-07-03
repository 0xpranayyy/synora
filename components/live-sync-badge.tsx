"use client";

import { useEffect, useState } from "react";

export function LiveSyncBadge({ fetchedAt }: { fetchedAt: string }) {
  const [label, setLabel] = useState("Synced just now");

  useEffect(() => {
    function update() {
      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(fetchedAt).getTime()) / 1000)
      );
      if (seconds < 8) setLabel("Synced just now");
      else if (seconds < 60) setLabel(`Synced ${seconds}s ago`);
      else setLabel(`Synced ${Math.floor(seconds / 60)}m ago`);
    }

    update();
    const id = window.setInterval(update, 5000);
    return () => window.clearInterval(id);
  }, [fetchedAt]);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] text-muted backdrop-blur-sm">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-40" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
      </span>
      {label}
      <span className="text-faint">· Polymarket</span>
    </span>
  );
}