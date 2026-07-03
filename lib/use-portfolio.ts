"use client";

import { useQuery } from "@tanstack/react-query";
import type { PortfolioSummary } from "./types";

export function usePortfolio(address: string | undefined) {
  return useQuery<PortfolioSummary>({
    queryKey: ["portfolio", address],
    queryFn: async () => {
      const res = await fetch(
        `/api/portfolio?address=${encodeURIComponent(address!)}`
      );
      if (!res.ok) throw new Error("Failed to load portfolio");
      return res.json();
    },
    enabled: Boolean(address),
    refetchInterval: 60_000,
  });
}