import { CardGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="skeleton h-7 w-40 rounded-full" />
      <div className="skeleton mt-3 h-4 w-72 rounded-full" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-8">
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
