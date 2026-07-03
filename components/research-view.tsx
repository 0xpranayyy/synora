import Link from "next/link";
import type { Market, Research } from "@/lib/types";

/** The structured body of an AI research response. */
export function ResearchView({
  research,
  relatedMarkets = [],
}: {
  research: Research;
  relatedMarkets?: Market[];
}) {
  return (
    <div className="space-y-5">
      <Section title="Summary" delay={1}>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {research.summary}
        </p>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Bull case" tone="mint" delay={2}>
          <CaseList items={research.bullCase} tone="mint" />
        </Section>
        <Section title="Bear case" tone="rose" delay={2}>
          <CaseList items={research.bearCase} tone="rose" />
        </Section>
      </div>

      <Section title="AI insight" tone="accent" delay={3}>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {research.insight}
        </p>
        <p className="mt-3 text-xs text-faint">
          {modeCopy[research.mode]}
        </p>
      </Section>

      {research.news.length > 0 && (
        <Section title="Recent news" delay={3}>
          <ul className="space-y-5">
            {research.news.map((n) => (
              <li key={n.url + n.title} className="flex gap-4">
                <span className="font-mono text-[11px] text-faint shrink-0 pt-1 w-16">
                  {n.date ? shortDate(n.date) : ""}
                </span>
                <div>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[15px] leading-snug hover:text-accent-ink transition-colors"
                  >
                    {n.title}
                  </a>
                  <p className="mt-1 text-sm text-muted leading-relaxed">
                    {n.summary}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[11px] text-muted">
                    {n.source}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {research.timeline.length > 0 && (
        <Section title="Timeline" delay={4}>
          <ol className="relative border-l-2 border-accent-soft ml-2 space-y-6">
            {research.timeline.map((e) => (
              <li key={e.date + e.title} className="pl-6 relative">
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-accent border-[3px] border-card shadow-sm" />
                <span className="font-mono text-[11px] text-faint">
                  {shortDate(e.date)}
                </span>
                <p className="mt-0.5 font-medium text-sm">{e.title}</p>
                <p className="mt-0.5 text-sm text-muted leading-relaxed">
                  {e.description}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Resolution rules" delay={4}>
        <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
          {research.resolution.trim()}
        </p>
      </Section>

      {relatedMarkets.length > 0 && (
        <div className="reveal d-5">
          <h2 className="text-xs font-semibold text-faint uppercase tracking-widest mb-4 px-1">
            Related markets
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedMarkets.map((m) => (
              <RelatedCard key={m.id} market={m} />
            ))}
          </div>
        </div>
      )}

      <Section title="Sources" delay={5}>
        <div className="flex flex-wrap gap-2">
          {research.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="btn-press inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted hover:text-accent-ink hover:border-accent/40"
            >
              <LinkIcon />
              {s.label}
            </a>
          ))}
        </div>
      </Section>

      {research.followUps.length > 0 && (
        <div className="reveal d-6">
          <h2 className="text-xs font-semibold text-faint uppercase tracking-widest mb-3 px-1">
            Keep researching
          </h2>
          <div className="flex flex-wrap gap-2">
            {research.followUps.map((q) => (
              <Link
                key={q}
                href={`/research?q=${encodeURIComponent(q)}`}
                className="btn-press rounded-full bg-accent-soft px-4 py-2.5 text-[13px] font-medium text-accent-ink hover:bg-accent hover:text-white"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const modeCopy: Record<Research["mode"], string> = {
  ai: "Hosted AI reasoning grounded in live web research — verify the cited sources before trading.",
  local:
    "Local open-model reasoning over live Polymarket data only. No web news was fetched or invented.",
  quant:
    "Deterministic analysis from live Polymarket data only. Connect Ollama or a hosted AI key for generated reasoning.",
};

function Section({
  title,
  tone,
  delay,
  children,
}: {
  title: string;
  tone?: "mint" | "rose" | "accent";
  delay?: number;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "mint"
      ? "text-mint"
      : tone === "rose"
        ? "text-rose"
        : tone === "accent"
          ? "text-accent-ink"
          : "text-faint";
  return (
    <section
      className={`rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)] ${
        delay !== undefined ? `reveal d-${Math.min(delay, 6)}` : ""
      }`}
    >
      <h2
        className={`text-xs font-semibold uppercase tracking-widest mb-4 ${toneClass}`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CaseList({
  items,
  tone,
}: {
  items: string[];
  tone: "mint" | "rose";
}) {
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed">
          <span
            className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              tone === "mint" ? "bg-mint-soft text-mint" : "bg-rose-soft text-rose"
            }`}
            style={{ height: 18, width: 18, marginTop: 2 }}
          >
            {tone === "mint" ? "+" : "−"}
          </span>
          <span className="text-foreground/85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RelatedCard({ market }: { market: Market }) {
  return (
    <Link
      href={`/market/${market.slug}`}
      className="card-lift flex items-center justify-between gap-4 rounded-[20px] border border-border bg-card px-5 py-4"
    >
      <span className="text-sm font-medium leading-snug line-clamp-2">
        {market.question}
      </span>
      <span className="font-mono text-lg font-semibold shrink-0">
        {market.probability}
        <span className="text-xs text-faint">%</span>
      </span>
    </Link>
  );
}

function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
