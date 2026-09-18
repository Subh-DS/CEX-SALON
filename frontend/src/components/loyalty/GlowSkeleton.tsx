/** Skeleton loading for Glow Points — never a misleading 0. */
export default function GlowSkeleton() {
  return (
    <div aria-label="Loading your Glow Points" aria-busy="true">
      <div className="h-4 w-32 animate-pulse bg-ink/10" />
      <div className="mt-3 h-10 w-64 animate-pulse bg-ink/10" />
      <div className="mt-8 h-[76px] w-48 animate-pulse bg-ink/10" />
      <div className="mt-6 h-2 w-full animate-pulse rounded-full bg-ink/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse border border-ink/10 bg-white" />
        <div className="h-40 animate-pulse border border-ink/10 bg-white" />
      </div>
    </div>
  );
}
