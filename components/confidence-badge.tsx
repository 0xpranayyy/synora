import type { Confidence } from "@/lib/types";

const styles: Record<Confidence, string> = {
  High: "text-mint bg-mint-soft",
  Medium: "text-peach bg-peach-soft",
  Low: "text-muted bg-foreground/[0.05]",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${styles[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {level} confidence
    </span>
  );
}
