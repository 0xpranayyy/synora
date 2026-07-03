export function CardSkeleton() {
  return (
    <div className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-3/5 rounded-full" />
        </div>
        <div className="skeleton h-8 w-12 rounded-lg" />
      </div>
      <div className="skeleton mt-4 h-1.5 w-full rounded-full" />
      <div className="mt-3.5 flex justify-between">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  className = "sm:grid-cols-2",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ResearchSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div className="space-y-2.5 flex-1">
            <div className="skeleton h-3 w-28 rounded-full" />
            <div className="skeleton h-5 w-4/5 rounded-full" />
          </div>
          <div className="skeleton h-14 w-24 rounded-2xl" />
        </div>
      </div>
      <div className="rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-3">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-2/3 rounded-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-3"
          >
            <div className="skeleton h-3 w-20 rounded-full" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex gap-3">
                <div className="skeleton h-4 w-4 rounded-full shrink-0" />
                <div className="skeleton h-4 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-faint animate-pulse pt-2">
        Synora is researching — reading markets, searching the news…
      </p>
    </div>
  );
}
