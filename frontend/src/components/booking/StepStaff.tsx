import ExpertCard from "./ExpertCard";
import { ExpertSkeleton } from "./Skeletons";
import { useStaff } from "@/api/bookings";

export default function StepStaff({
  serviceId,
  serviceName,
  selected,
  onSelect,
}: {
  serviceId: string;
  serviceName?: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { data, isPending, isError, refetch } = useStaff(serviceId);
  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Choose your expert</h2>
      <p className="mt-1 text-[15px] text-ink/60">
        {serviceName ? `Everyone below performs ${serviceName}.` : "Only experts who perform your service are shown."}
      </p>
      {isPending && <div className="mt-5"><ExpertSkeleton /></div>}
      {isError && (
        <div className="mt-5 border border-ink/12 bg-white p-6 text-center">
          <p className="text-[15px] text-ink/70">We couldn't load experts.</p>
          <button onClick={() => refetch()} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Try again
          </button>
        </div>
      )}
      {data && data.length === 0 && (
        <p className="mt-5 text-[15px] text-ink/60">No experts offer this service right now.</p>
      )}
      {data && data.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Experts">
          {data.map((st) => (
            <ExpertCard key={st.id} staff={st} selected={selected === st.id} onSelect={() => onSelect(st.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
