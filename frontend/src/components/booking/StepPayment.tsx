import { useState } from "react";
import Input from "../ui/Input";
import { usePayBooking } from "@/api/bookings";
import { formatINR } from "@/lib/utils";
import type { Service, Staff } from "@/types";

export default function StepPayment({
  bookingId,
  service,
  staff,
  onPaid,
}: {
  bookingId: string | null;
  service: Service | undefined;
  staff: Staff | undefined;
  onPaid: (booking: { id: string; booking_number: string }) => void;
}) {
  const pay = usePayBooking();
  const [card, setCard] = useState("4111 1111 1111 1111");
  const amount = service?.price ?? 0;

  function friendlyError(): string {
    const err = pay.error as { code?: string; message?: string } | null;
    if (!err) return "";
    if (err.code === "HTTP_401") return "Your session expired. Please log in again — your selections are kept in this flow.";
    if (err.code === "ALREADY_PAID") return "This booking is already paid.";
    return "Payment didn't go through. Your appointment hasn't been confirmed. Please try again.";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) return;
    try {
      const result = await pay.mutateAsync(bookingId);
      onPaid({ id: result.booking_id, booking_number: result.booking_number });
    } catch {
      /* rendered below */
    }
  }

  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Complete payment</h2>
      <p className="mt-1 text-[15px] text-ink/60">
        {service?.name ?? "Your appointment"} with {staff?.name ?? "your expert"} ·{" "}
        <b className="text-ink">{formatINR(amount)}</b>
      </p>
      <form onSubmit={submit} className="mt-5 max-w-md space-y-4">
        <Input
          id="pay-card"
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          value={card}
          onChange={(e) => setCard(e.target.value)}
          placeholder="4111 1111 1111 1111"
        />
        {pay.error && (
          <p role="alert" className="rounded-md bg-[#f7e8e8] px-3.5 py-2.5 text-sm text-[#b84444]">
            {friendlyError()}
          </p>
        )}
        <button
          type="submit"
          disabled={pay.isPending || !bookingId}
          className="inline-flex min-h-[52px] w-full items-center justify-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep disabled:opacity-50"
        >
          {pay.isPending ? "Processing payment…" : `Pay ${formatINR(amount)} securely`}
        </button>
        <p className="text-[13px] leading-relaxed text-ink/55">
          Demo checkout — no real money moves. Your payment information is handled securely by the booking system.
        </p>
      </form>
    </div>
  );
}
