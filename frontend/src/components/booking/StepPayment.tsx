import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePayBooking } from "@/api/bookings";
import type { Service, Staff } from "@/types";
import PaymentMethodSelector from "../payment/PaymentMethodSelector";
import BookingSummary from "../payment/BookingSummary";
import UPIPayment from "../payment/UPIPayment";
import CardPayment from "../payment/CardPayment";
import CashPayment from "../payment/CashPayment";
import { PaymentFailed, PaymentProcessing, PaymentSuccess, type SuccessDetails } from "../payment/PaymentStates";
import {
  calcPrice,
  formatINR,
  makeTxnId,
  type Coupon,
  type DemoOutcome,
  type PaymentMethod,
  type PaymentPhase,
} from "../payment/utils";

export default function StepPayment({
  bookingId,
  bookingNumber,
  service,
  staff,
  date,
  slot,
  onPaid,
}: {
  bookingId: string | null;
  bookingNumber: string | null;
  service: Service | undefined;
  staff: Staff | undefined;
  date: string;
  slot: string | null;
  onPaid: (info: { id: string; booking_number?: string }) => void;
}) {
  const pay = usePayBooking();
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [phase, setPhase] = useState<PaymentPhase>("form");
  const [demoOutcome, setDemoOutcome] = useState<DemoOutcome>("success");
  const [procTitle, setProcTitle] = useState("");
  const [procSub, setProcSub] = useState("");
  const [failMessage, setFailMessage] = useState("");
  const [success, setSuccess] = useState<SuccessDetails | null>(null);
  const [methodLabel, setMethodLabel] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const price = calcPrice(service?.price ?? 0, 0, coupon);
  const ready = !!bookingId && !!service && !!staff && !!slot;

  useEffect(() => {
    if (phase !== "form") topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  function friendlyPayError(err: unknown): string {
    const code = (err as { code?: string }).code;
    if (code === "HTTP_401") return "Your session expired. Please log in again — your selections are kept in this flow.";
    if (code === "ALREADY_PAID") return "This booking is already paid.";
    return "The payment didn't go through. Your appointment is still reserved — please try again or choose another method.";
  }

  function baseSuccess(serviceName: string, staffName: string): Omit<SuccessDetails, "headline" | "amountCaption" | "referenceLabel" | "reference" | "methodLabel" | "note" | "onViewBooking"> {
    return {
      amount: price.total,
      serviceName,
      staffName,
      dateISO: date,
      slot: slot ?? "",
      durationMin: service?.duration_minutes ?? 60,
    };
  }

  /** Online (UPI/card) rail: simulate gateway, then confirm with the backend using only the booking id. */
  function startOnlinePayment(label: string) {
    if (!ready) return;
    setMethodLabel(label);
    setProcTitle("Processing payment…");
    setProcSub(method === "upi" ? "Verifying your UPI payment." : "Authorising your card securely.");
    setPhase("processing");
  }

  async function finishOnlinePayment() {
    if (!bookingId || !service || !staff) return;
    if (demoOutcome === "fail") {
      setFailMessage("Your bank declined this demo transaction. No money moved — try again or pick another method.");
      setPhase("failed");
      return;
    }
    try {
      const result = await pay.mutateAsync({ booking_id: bookingId, coupon_code: coupon?.code });
      const txnId = makeTxnId();
      const svc = service.name;
      const stf = staff.name;
      const base = baseSuccess(svc, stf);
      const paidCaption =
        result.discount > 0
          ? `Paid via ${methodLabel} · ${txnId} · ${result.coupon_code} saved ${formatINR(result.discount)}`
          : `Paid via ${methodLabel} · ${txnId}`;
      setSuccess({
        ...base,
        amount: result.amount,
        headline: "Payment successful",
        amountCaption: paidCaption,
        referenceLabel: "Booking ID",
        reference: result.booking_number,
        methodLabel,
        note: "Your appointment has been confirmed. We can't wait to see you.",
        onViewBooking: () => onPaid({ id: result.booking_id, booking_number: result.booking_number }),
      });
      setPhase("success");
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "ALREADY_PAID") {
        const svc = service.name;
        const stf = staff.name;
        const base = baseSuccess(svc, stf);
        setSuccess({
          ...base,
          headline: "Payment successful",
          amountCaption: `Paid via ${methodLabel}`,
          referenceLabel: "Booking ID",
          reference: bookingNumber ?? bookingId,
          methodLabel,
          note: "This booking was already paid — your appointment is confirmed.",
          onViewBooking: () => onPaid({ id: bookingId }),
        });
        setPhase("success");
        return;
      }
      setFailMessage(friendlyPayError(err));
      setPhase("failed");
    }
  }

  /** Cash rail: no gateway, no backend charge — reservation already exists. */
  function startCashConfirm() {
    if (!ready) return;
    setProcTitle("Confirming your reservation…");
    setProcSub("No payment is taken now — you'll pay at the salon.");
    setPhase("processing");
  }

  function finishCashConfirm() {
    if (!bookingId || !service || !staff) return;
    if (!bookingNumber) {
      setFailMessage("We couldn't find your reservation reference. Please go back one step and continue again.");
      setPhase("failed");
      return;
    }
    const svc = service.name;
    const stf = staff.name;
    const base = baseSuccess(svc, stf);
    setSuccess({
      ...base,
      headline: "Booking confirmed",
      amountCaption: `Due at The Blush Studio`,
      referenceLabel: "Booking ID",
      reference: bookingNumber,
      methodLabel: "Cash at salon",
      note: "Your appointment is reserved. Please arrive 10 minutes early — payment will be collected at the salon.",
      onViewBooking: () => onPaid({ id: bookingId, booking_number: bookingNumber }),
    });
    setPhase("success");
  }

  if (!service || !staff || !slot) {
    return (
      <p role="alert" className="rounded-md bg-[#f7e8e8] px-4 py-3 text-sm text-[#b84444]">
        We&apos;re missing some booking details. Please go back and complete each step first.
      </p>
    );
  }

  if (phase === "processing") {
    const online = method !== "cash";
    return (
      <div ref={topRef}>
        <PaymentProcessing
          title={procTitle}
          sub={procSub}
          durationMs={online ? 2100 : 1400}
          onDone={online ? finishOnlinePayment : finishCashConfirm}
        />
      </div>
    );
  }

  if (phase === "success" && success) {
    return (
      <div ref={topRef}>
        <PaymentSuccess d={success} />
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div ref={topRef}>
        <PaymentFailed
          message={failMessage}
          onRetry={() => setPhase("form")}
          onChangeMethod={() => setPhase("form")}
        />
      </div>
    );
  }

  return (
    <div ref={topRef}>
      <h2 className="font-display text-[26px] font-medium text-ink">Complete payment</h2>
      <p className="mt-1 text-[15px] text-ink/60">
        Simulated demo checkout — no real money moves and no payment details are stored.
      </p>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-3">
        {/* Payment column */}
        <div className="order-2 lg:order-1 lg:col-span-2">
          <h3 className="font-accent text-[13px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Payment method
          </h3>
          <div className="mt-3">
            <PaymentMethodSelector selected={method} onSelect={setMethod} />
          </div>

          <div className="mt-5 rounded-md2 border border-warmborder bg-white p-5 shadow-sm2 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={method}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {method === "upi" && <UPIPayment amount={price.total} onPay={startOnlinePayment} />}
                {method === "card" && <CardPayment amount={price.total} onPay={(last4) => startOnlinePayment(`Card ···· ${last4}`)} />}
                {method === "cash" && <CashPayment amount={price.total} onConfirm={startCashConfirm} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {method !== "cash" && (
            <details className="mt-4 rounded-md2 border border-dashed border-warmborder bg-white/60 px-4 py-3 text-sm text-ink/60">
              <summary className="cursor-pointer font-accent text-[13px] font-semibold text-ink/60">
                Demo controls
              </summary>
              <div className="mt-2 flex flex-wrap gap-4 pb-1" role="radiogroup" aria-label="Simulated payment outcome">
                {(["success", "fail"] as const).map((o) => (
                  <label key={o} className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="demo-outcome"
                      checked={demoOutcome === o}
                      onChange={() => setDemoOutcome(o)}
                      className="h-4 w-4 accent-[#3b2038]"
                    />
                    Simulate {o === "success" ? "success" : "failure"}
                  </label>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Summary column — first on mobile */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <BookingSummary
            serviceName={service.name}
            durationMin={service.duration_minutes}
            staffName={staff.name}
            dateISO={date}
            slot={slot}
            price={price}
            coupon={coupon}
            onCoupon={setCoupon}
          />
        </div>
      </div>
    </div>
  );
}
