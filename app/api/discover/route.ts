import { NextRequest, NextResponse } from "next/server";
import {
  fetchCategoryFeed,
  fetchDiscoverFeed,
  isDiscoverView,
} from "@/lib/discover";
import { categories } from "@/lib/polymarket";

/** Live discover feed from Polymarket Gamma API (no cache). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? 12) || 12,
    30
  );

  try {
    if (category) {
      const valid = categories.some((c) => c.slug === category);
      if (!valid) {
        return NextResponse.json({ error: "Unknown category" }, { status: 400 });
      }
      const feed = await fetchCategoryFeed(category, limit);
      return NextResponse.json(feed);
    }

    const activeView = view && isDiscoverView(view) ? view : "trending";
    const feed = await fetchDiscoverFeed(activeView, limit);
    return NextResponse.json(feed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Polymarket fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}