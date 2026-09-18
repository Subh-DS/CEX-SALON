import SlotPicker from "./SlotPicker";
import { SlotSkeleton } from "./Skeletons";
import { useAvailability } from "@/api/bookings";
import { parseVisitDate } from "../visits/dates";

export default function StepTime({
  staffId,
  serviceId,
  staffName,
  date,
  slot,
  setSlot,
  onBackToDate,
}: {
  staffId: string;
  serviceId: string;
  staffName?: string;
  date: string;
  slot: string | null;
  setSlot: (t: string | null) => void;
  onBackToDate: () => void;
}) {
  const { data, isPending, isError, refetch } = useAvailability(staffId, date, serviceId);
  const nice = (() => {
    try {
      return parseVisitDate(`${date}T12:00:00`).full;
    } catch {
      return date;
    }
  })();
  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Choose a time</h2>
      <p className="mt-1 text-[15px] text-ink/60">
        Live from {staffName ? `${staffName}'s` : "your expert's"} calendar · {nice}
      </p>
      <div className="mt-5">
        {isPending && <SlotSkeleton />}
        {isError && (
          <div className="border border-ink/12 bg-white p-6 text-center">
            <p className="text-[15px] text-ink/70">We couldn't load available times.</p>
            <button onClick={() => refetch()} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Try again
            </button>
          </div>
        )}
        {data && data.slots.length === 0 && (
          <div className="border border-ink/12 bg-white p-6 text-center">
            <p className="text-[15px] text-ink/70">No times available for this date.</p>
            <button onClick={onBackToDate} className="mt-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Choose another date
            </button>
          </div>
        )}
        {data && data.slots.length > 0 && (
          <SlotPicker slots={data.slots} selected={slot} onSelect={setSlot} />
        )}
      </div>
    </div>
  );
}
