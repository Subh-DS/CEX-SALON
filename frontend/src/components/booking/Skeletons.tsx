/** Skeleton states for booking steps — shapes, never blank. */
export function ServiceSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading services" aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-ink/10 bg-white">
          <div className="aspect-[16/10] animate-pulse bg-ink/10" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse bg-ink/10" />
            <div className="h-4 w-1/3 animate-pulse bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExpertSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading experts" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-ink/10 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-ink/10" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-1/2 animate-pulse bg-ink/10" />
            <div className="h-4 w-2/3 animate-pulse bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SlotSkeleton() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Loading times" aria-busy="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-[44px] w-24 animate-pulse rounded-full bg-ink/10" />
      ))}
    </div>
  );
}
