import ServiceCard from "./ServiceCard";
import { ServiceSkeleton } from "./Skeletons";
import { useServices } from "@/api/bookings";

export default function StepService({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { data, isPending, isError, refetch } = useServices();
  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Choose your service</h2>
      <p className="mt-1 text-[15px] text-ink/60">Real prices, real durations. Everything earns Glow Points.</p>
      {isPending && <div className="mt-5"><ServiceSkeleton /></div>}
      {isError && (
        <div className="mt-5 border border-ink/12 bg-white p-6 text-center">
          <p className="text-[15px] text-ink/70">We couldn't load services.</p>
          <button onClick={() => refetch()} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Try again
          </button>
        </div>
      )}
      {data && data.length === 0 && (
        <p className="mt-5 text-[15px] text-ink/60">No services available right now. Please check back soon.</p>
      )}
      {data && data.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Services">
          {data.map((s) => (
            <ServiceCard key={s.id} service={s} selected={selected === s.id} onSelect={() => onSelect(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
