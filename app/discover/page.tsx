import Link from "next/link";
import { DiscoverFeed } from "@/components/discover-feed";
import {
  discoverViews,
  fetchCategoryFeed,
  fetchDiscoverFeed,
  isDiscoverView,
  type DiscoverView,
} from "@/lib/discover";
import { categories } from "@/lib/polymarket";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; view?: string }>;
}) {
  const { category, view } = await searchParams;
  const activeCategory = categories.find((c) => c.slug === category);
  const activeView: DiscoverView =
    !activeCategory && view && isDiscoverView(view) ? view : "trending";
  const activeCollection =
    discoverViews.find((c) => c.slug === activeView) ?? discoverViews[0];

  const feed = activeCategory
    ? await fetchCategoryFeed(activeCategory.slug, 12)
    : await fetchDiscoverFeed(activeView, 12);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="reveal">
        <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted">
          {activeCategory
            ? `${activeCategory.label} markets — Gamma API, tag_slug=${activeCategory.slug}, sorted by 24h volume.`
            : activeCollection.hint}
        </p>
      </div>

      <div className="reveal d-1 mt-6 flex flex-wrap gap-2">
        {discoverViews.map((c) => (
          <Chip
            key={c.slug}
            href={`/discover?view=${c.slug}`}
            active={!activeCategory && activeView === c.slug}
            label={c.label}
          />
        ))}
        <span className="mx-1 self-center h-4 w-px bg-border-strong" />
        {categories.map((c) => (
          <Chip
            key={c.slug}
            href={`/discover?category=${c.slug}`}
            active={activeCategory?.slug === c.slug}
            label={c.label}
          />
        ))}
      </div>

      <div className="mt-8">
        <DiscoverFeed
          key={activeCategory?.slug ?? activeView}
          initialFeed={feed}
          category={activeCategory?.slug}
        />
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  label,
}: {
  href: string;
  active?: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`btn-press rounded-full px-4 py-2 text-xs font-medium ${
        active
          ? "bg-accent text-white shadow-[var(--shadow-glow)]"
          : "bg-card text-muted border border-border shadow-[var(--shadow-card)] hover:text-foreground hover:border-accent/40"
      }`}
    >
      {label}
    </Link>
  );
}