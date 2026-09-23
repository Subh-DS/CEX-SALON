import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarPlus, CircleAlert, LoaderCircle, TriangleAlert } from "lucide-react";
import { downloadIcs, formatINR, formatLongDate, formatTime12 } from "./utils";

/* ---------- Processing ---------- */

export function PaymentProcessing({
  title,
  sub,
  durationMs = 2000,
  onDone,
}: {
  title: string;
  sub: string;
  durationMs?: number;
  onDone: () => void;
}) {
  // Stable callback ref: parent re-renders must not restart the timer.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t = window.setTimeout(() => doneRef.current(), durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-md2 border border-warmborder bg-white px-6 py-14 text-center shadow-sm2"
    >
      <LoaderCircle className="h-11 w-11 animate-spin text-primary" strokeWidth={1.6} />
      <p className="mt-5 font-display text-2xl text-ink">{title}</p>
      <p className="mt-1.5 text-[15px] text-ink/60">{sub}</p>
      <p className="mt-4 text-[13px] text-ink/45">Please don&apos;t close this window.</p>
    </div>
  );
}

/* ---------- Success ---------- */

export interface SuccessDetails {
  headline: string;
  amountCaption: string;
  amount: number;
  referenceLabel: string;
  reference: string;
  methodLabel: string;
  serviceName: string;
  staffName: string;
  dateISO: string;
  slot: string;
  durationMin: number;
  note: string;
  onViewBooking: () => void;
}

export function PaymentSuccess({ d }: { d: SuccessDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      className="mx-auto max-w-xl rounded-md2 border border-warmborder bg-white px-6 py-10 text-center shadow-md2 md:px-10"
    >
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        aria-hidden
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3efe8] text-3xl font-bold text-leafgreen"
      >
        ✓
      </motion.span>
      <p className="mt-4 font-accent text-xs font-bold uppercase tracking-[0.2em] text-leafgreen">
        {d.headline}
      </p>
      <p className="mt-2 font-display text-4xl text-ink">{formatINR(d.amount)}</p>
      <p className="mt-1 text-sm text-ink/55">{d.amountCaption}</p>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink/65">{d.note}</p>

      <dl className="mx-auto mt-6 max-w-md border-y border-ink/12 py-4 text-left text-[15px]">
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">{d.referenceLabel}</dt>
          <dd className="font-accent font-bold text-ink">{d.reference}</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">Service</dt>
          <dd className="font-semibold text-ink">{d.serviceName}</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">Professional</dt>
          <dd className="font-semibold text-ink">{d.staffName}</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">Date</dt>
          <dd className="font-semibold text-ink">{formatLongDate(d.dateISO)}</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">Time</dt>
          <dd className="font-semibold text-ink">{formatTime12(d.slot)} · {d.durationMin} min</dd>
        </div>
        <div className="flex justify-between gap-3 py-1.5">
          <dt className="text-ink/55">Payment</dt>
          <dd className="font-semibold text-ink">{d.methodLabel}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={d.onViewBooking}
          className="inline-flex min-h-[52px] items-center rounded-sm2 bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep"
        >
          View booking
        </button>
        <Link
          to="/"
          className="inline-flex min-h-[52px] items-center rounded-sm2 px-4 font-accent text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </div>
      <button
        onClick={() =>
          downloadIcs({ service: d.serviceName, dateISO: d.dateISO, slot: d.slot, durationMin: d.durationMin })
        }
        className="mx-auto mt-3 inline-flex min-h-[44px] items-center gap-2 font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to calendar
      </button>
    </motion.div>
  );
}

/* ---------- Failed ---------- */

export function PaymentFailed({
  message,
  onRetry,
  onChangeMethod,
}: {
  message: string;
  onRetry: () => void;
  onChangeMethod: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      role="alert"
      className="mx-auto max-w-xl rounded-md2 border border-[#efc9c9] bg-white px-6 py-10 text-center shadow-md2 md:px-10"
    >
      <span aria-hidden className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e8e8] text-3xl font-bold text-[#b84444]">
        !
      </span>
      <p className="mt-4 font-accent text-xs font-bold uppercase tracking-[0.2em] text-[#b84444]">
        Payment failed
      </p>
      <h2 className="mt-2 font-display text-3xl text-ink">We couldn&apos;t complete your payment.</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink/65">{message}</p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink/50">
        <CircleAlert className="h-4 w-4" />
        Your appointment is still reserved — nothing was charged.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex min-h-[52px] items-center gap-2 rounded-sm2 bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep"
        >
          <TriangleAlert className="h-4 w-4" />
          Try again
        </button>
        <button
          onClick={onChangeMethod}
          className="inline-flex min-h-[52px] items-center rounded-sm2 border border-ink/25 px-7 font-accent text-[15px] font-semibold text-ink hover:border-ink"
        >
          Change payment method
        </button>
      </div>
    </motion.div>
  );
}
