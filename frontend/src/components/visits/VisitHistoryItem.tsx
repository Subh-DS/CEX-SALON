import { useState } from "react";
import { Link } from "react-router-dom";
import VisitStatus from "./VisitStatus";
import CancelVisitDialog from "./CancelVisitDialog";
import ReschedulePane from "./ReschedulePane";
import { useSubmitReview } from "@/api/loyalty";
import { useCancelBooking } from "@/api/bookings";
import { formatINR } from "@/lib/utils";
import { parseVisitDate } from "./dates";
import type { Booking } from "@/types";

function Stars({ value, onPick }: { value: number; onPick: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rate this visit">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onPick(n)}
          className={`text-xl leading-none ${n <= value ? "text-coral" : "text-ink/20 hover:text-ink/40"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function VisitHistoryItem({
  booking,
  reviewed,
  earnedPoints,
}: {
  booking: Booking;
  reviewed: boolean;
  earnedPoints: number | null;
}) {
  const [rating, setRating] = useState(0);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [bonus, setBonus] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const submit = useSubmitReview();
  const cancel = useCancelBooking();
  const item = booking.items[0];
  const d = parseVisitDate(item.start_time);
  const cancelled = booking.status === "cancelled" || booking.status === "no_show";
  // Active + in the future → the guest can still move or cancel it.
  const manageable =
    (booking.status === "pending" || booking.status === "confirmed") &&
    new Date(item.start_time).getTime() > Date.now();

  async function confirmCancel() {
    try {
      await cancel.mutateAsync(booking.id);
      setConfirming(false);
    } catch {
      /* error rendered in dialog via cancel.error */
    }
  }

  async function send() {
    if (!rating) return;
    try {
      const res = await submit.mutateAsync({ booking_id: booking.id, rating });
      setBonus(res.points_awarded > 0 ? res.points_awarded : null);
      setRatingOpen(false);
    } catch {
      /* error below */
    }
  }

  return (
    <div className={`border-t border-ink/10 py-5 ${cancelled ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="w-32 shrink-0 font-accent text-[13px] font-semibold uppercase tracking-wide text-ink/50">
          {d.month} {d.day} · {d.time}
        </span>
        <span className="min-w-0 flex-1">
          <b className="font-display text-lg font-medium text-ink">{item.service_name}</b>
          <span className="block text-sm text-ink/60">
            {item.staff_name} · {formatINR(item.price)}
          </span>
        </span>
        <VisitStatus status={booking.status} />
        {manageable ? (
          <span className="flex shrink-0 items-center gap-4">
            <button
              onClick={() => setRescheduling((v) => !v)}
              className="inline-flex min-h-[44px] items-center font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Reschedule
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-[44px] items-center font-accent text-sm text-ink/55 underline-offset-4 hover:text-[#b84444] hover:underline"
            >
              Cancel
            </button>
          </span>
        ) : (
          <Link
            to={`/book?service_id=${item.service_id}&staff_id=${item.staff_id}`}
            className="shrink-0 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Book again →
          </Link>
        )}
      </div>

      {!cancelled && booking.status === "completed" && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-0 sm:pl-[152px]">
          {reviewed ? (
            <span className="text-sm text-leafgreen">★ Reviewed — thank you.{bonus ? ` +${bonus} Glow Points` : ""}</span>
          ) : ratingOpen ? (
            <span className="flex flex-wrap items-center gap-3">
              <Stars value={rating} onPick={setRating} />
              <button
                onClick={send}
                disabled={!rating || submit.isPending}
                className="inline-flex min-h-[36px] items-center bg-primary px-4 font-accent text-[13px] font-semibold text-ivory hover:bg-plum-deep disabled:opacity-50"
              >
                {submit.isPending ? "Sending…" : "Submit"}
              </button>
              {submit.error && <span className="text-[13px] text-[#b84444]">Couldn't save. Try again.</span>}
            </span>
          ) : (
            <button
              onClick={() => setRatingOpen(true)}
              className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Rate your visit →
            </button>
          )}
          {earnedPoints !== null && earnedPoints > 0 && (
            <span className="text-sm font-semibold text-leafgreen">+{earnedPoints} Glow Points</span>
          )}
        </div>
      )}

      {rescheduling && (
        <div className="pl-0 sm:pl-[152px]">
          <ReschedulePane booking={booking} onDone={() => setRescheduling(false)} />
        </div>
      )}

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
