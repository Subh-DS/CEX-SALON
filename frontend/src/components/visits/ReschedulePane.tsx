import { useState } from "react";
import SlotPicker from "../booking/SlotPicker";
import { useAvailability, useReschedule } from "@/api/bookings";
import type { Booking } from "@/types";

/** Shared reschedule pane: live availability for the booking's expert,
 *  slot pick, confirm. Used by NextVisit and individual history rows. */
export default function ReschedulePane({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const item = booking.items[0];
  const [date, setDate] = useState(item.start_time.slice(0, 10));
  const [slot, setSlot] = useState<string | null>(null);
  const { data } = useAvailability(item.staff_id, date, item.service_id);
  const reschedule = useReschedule();

  async function submit() {
    if (!slot) return;
    try {
      await reschedule.mutateAsync({
        booking_id: booking.id,
        items: [{ item_id: item.id, start_time: `${date}T${slot}:00+00:00` }],
      });
      onDone();
    } catch {
      /* error rendered below */
    }
  }

  return (
    <div className="mt-4 border-t border-ink/10 pt-4">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-ink/60">
        Choose a new time
      </p>
      <input
        type="date"
        value={date}
        onChange={(e) => { setDate(e.target.value); setSlot(null); }}
        aria-label="New date"
        className="mt-2 min-h-[44px] w-full max-w-xs border border-warmborder bg-white px-3.5 text-[15px] text-ink"
      />
      <div className="mt-2">{data && <SlotPicker slots={data.slots} selected={slot} onSelect={setSlot} />}</div>
      {reschedule.error && (
        <p role="alert" className="mt-2 text-sm text-[#b84444]">
          {(reschedule.error as { message?: string }).message ?? "Couldn't reschedule. Please try again."}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          disabled={!slot || reschedule.isPending}
          onClick={submit}
          className="inline-flex min-h-[44px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep disabled:opacity-50"
        >
          {reschedule.isPending ? "Moving…" : "Confirm new time"}
        </button>
        <button
          onClick={onDone}
          className="inline-flex min-h-[44px] items-center px-4 font-accent text-sm text-ink/60 hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}
