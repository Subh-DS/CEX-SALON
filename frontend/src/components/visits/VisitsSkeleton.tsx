/** Skeleton loading for My Visits — shapes, never blank. */
export default function VisitsSkeleton() {
  return (
    <div aria-label="Loading your visits" aria-busy="true">
      <div className="h-9 w-48 animate-pulse bg-ink/10" />
      <div className="mt-2 h-6 w-72 animate-pulse bg-ink/10" />
      <div className="mt-6 border border-ink/10 bg-white p-5 md:p-7">
        <div className="flex gap-5">
          <div className="h-28 w-24 shrink-0 animate-pulse bg-ink/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-32 animate-pulse bg-ink/10" />
            <div className="h-7 w-56 animate-pulse bg-ink/10" />
            <div className="h-4 w-40 animate-pulse bg-ink/10" />
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-5 animate-pulse bg-ink/10" style={{ width: `${85 - i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
