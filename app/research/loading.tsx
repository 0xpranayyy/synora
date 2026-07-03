import { ResearchSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="skeleton h-12 w-full rounded-full" />
      <div className="skeleton mt-8 h-3 w-24 rounded-full" />
      <div className="skeleton mt-3 h-7 w-3/4 rounded-full" />
      <div className="mt-6">
        <ResearchSkeleton />
      </div>
    </div>
  );
}
