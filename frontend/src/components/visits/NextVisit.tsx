import { useState } from "react";
import VisitDateBlock from "./VisitDateBlock";
import VisitStatus from "./VisitStatus";
import CancelVisitDialog from "./CancelVisitDialog";
import ReschedulePane from "./ReschedulePane";
import { useCancelBooking } from "@/api/bookings";
import { formatINR } from "@/lib/utils";
import { daysUntil } from "./dates";
import type { Booking } from "@/types";

export default function NextVisit({ booking }: { booking: Booking }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelBooking();
  const item = booking.items[0];
  const left = daysUntil(item.start_time);

  async function confirmCancel() {
    try {
      await cancel.mutateAsync(booking.id);
      setConfirming(false);
    } catch {
      /* error rendered in dialog via cancel.error */
    }
  }

  return (
    <div className="border border-ink/12 bg-white">
      <div className="flex flex-col gap-5 p-5 sm:flex-row md:p-7">
        <VisitDateBlock iso={item.start_time} large />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Next visit{left === 0 ? " · today" : left === 1 ? " · tomorrow" : ` · in ${left} days`}
              </p>
              <h3 className="mt-1 font-display text-[26px] font-medium leading-tight text-ink">
                {item.service_name}
              </h3>
              <p className="mt-0.5 text-[15px] text-ink/65">
                with {item.staff_name} · {item.duration_minutes} min
              </p>
            </div>
            <VisitStatus status={item.status} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-accent text-xs text-ink/50">Price</dt>
              <dd className="font-semibold text-ink">{formatINR(item.price)}</dd>
            </div>
            <div>
              <dt className="font-accent text-xs text-ink/50">Booking no.</dt>
              <dd className="font-semibold text-ink">{booking.booking_number}</dd>
            </div>
            <div>
              <dt className="font-accent text-xs text-ink/50">Payment</dt>
              <dd className="font-semibold text-ink">{booking.paid ? "Paid" : "Pay at visit"}</dd>
            </div>
            <div>
              <dt className="font-accent text-xs text-ink/50">Where</dt>
              <dd className="font-semibold text-ink">{booking.branch_name ?? "Patia, Bhubaneswar"}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setRescheduling((v) => !v)}
              className="inline-flex min-h-[44px] items-center border border-ink px-6 font-accent text-sm font-semibold text-ink hover:bg-primary hover:border-primary hover:text-ivory"
            >
              Reschedule
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="font-accent text-sm text-ink/55 underline-offset-4 hover:text-[#b84444] hover:underline"
            >
              Cancel
            </button>
          </div>

          {rescheduling && <ReschedulePane booking={booking} onDone={() => setRescheduling(false)} />}
        </div>
      </div>

      {confirming && (
        <CancelVisitDialog
          serviceName={item.service_name}
          staffName={item.staff_name}
          iso={item.start_time}
          busy={cancel.isPending}
          error={cancel.error ? "We couldn't cancel right now. Please try again." : null}
          onKeep={() => setConfirming(false)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}
