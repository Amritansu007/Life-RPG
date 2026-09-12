interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2" role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton rounded h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading content">
      <div className={`skeleton rounded ${className}`} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function QuestCardSkeleton() {
  return (
    <div
      className="rounded-lg bg-void-light/50 border border-violet/15 p-4 space-y-3"
      role="status"
      aria-label="Loading quest"
    >
      <div className="flex items-center gap-3">
        <div className="skeleton rounded-full h-8 w-8" />
        <div className="skeleton rounded h-5 w-48" />
      </div>
      <div className="flex gap-4">
        <div className="skeleton rounded h-4 w-16" />
        <div className="skeleton rounded h-4 w-16" />
      </div>
      <span className="sr-only">Loading quest details…</span>
    </div>
  );
}

export function CharacterPanelSkeleton() {
  return (
    <div className="space-y-6 p-5" role="status" aria-label="Loading character">
      <div className="flex items-center gap-3">
        <div className="skeleton rounded-full h-12 w-12" />
        <div className="space-y-2 flex-1">
          <div className="skeleton rounded h-5 w-32" />
          <div className="skeleton rounded h-3 w-20" />
        </div>
      </div>
      <div className="skeleton rounded-full h-3 w-full" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex justify-between">
            <div className="skeleton rounded h-4 w-20" />
            <div className="skeleton rounded h-4 w-8" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading character data…</span>
    </div>
  );
}
