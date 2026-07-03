import { ResearchSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-start gap-4">
        <div className="skeleton h-14 w-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-7 w-4/5 rounded-full" />
        </div>
        <div className="skeleton h-10 w-24 rounded-full" />
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[20px] border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-3"
          >
            <div className="skeleton h-3 w-16 rounded-full" />
            <div className="skeleton h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="skeleton h-3 w-40 rounded-full" />
        <div className="skeleton mt-4 h-36 w-full rounded-xl" />
      </div>
      <div className="mt-6">
        <ResearchSkeleton />
      </div>
    </div>
  );
}
