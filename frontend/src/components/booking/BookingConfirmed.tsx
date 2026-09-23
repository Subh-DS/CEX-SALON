import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { parseVisitDate } from "../visits/dates";
import { formatINR } from "@/lib/utils";
import type { Booking } from "@/types";

export default function BookingConfirmed({ booking }: { booking: Booking }) {
  const item = booking.items[0];
  if (!item) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p role="alert" className="rounded-md bg-[#f7e8e8] px-4 py-3 text-sm text-[#b84444]">
          Your booking was confirmed, but we couldn&apos;t load its details. Check My Visits for the full summary.
        </p>
      </div>
    );
  }
  const when = parseVisitDate(item.start_time);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-xl text-center"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e3efe8] text-xl font-bold text-leafgreen" aria-hidden="true">
        ✓
      </span>
      <p className="mt-4 font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
        Booking confirmed
      </p>
      <h2 className="mt-2 font-display text-[34px] font-medium tracking-tight text-ink">You're all set.</h2>

      <dl className="mx-auto mt-6 max-w-md border-y border-ink/12 py-5 text-left">
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">Service</dt>
          <dd className="font-semibold text-ink">{item.service_name}</dd>
        </div>
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">Expert</dt>
          <dd className="font-semibold text-ink">{item.staff_name}</dd>
        </div>
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">When</dt>
          <dd className="font-semibold text-ink">{when.full} · {when.time}</dd>
        </div>
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">Where</dt>
          <dd className="font-semibold text-ink">{booking.branch_name ?? "Patia, Bhubaneswar"}</dd>
        </div>
        {(booking.discount_amount ?? 0) > 0 && (
          <div className="flex justify-between py-1.5 text-[15px]">
            <dt className="text-ink/55">Discount{booking.coupon_code ? ` (${booking.coupon_code})` : ""}</dt>
            <dd className="font-semibold text-leafgreen">−{formatINR(booking.discount_amount ?? 0)}</dd>
          </div>
        )}
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">{booking.paid ? "Total paid" : "Total due at salon"}</dt>
          <dd className="font-semibold text-ink">{formatINR(booking.total_amount)}</dd>
        </div>
        <div className="flex justify-between py-1.5 text-[15px]">
          <dt className="text-ink/55">Booking</dt>
          <dd className="font-semibold text-ink">{booking.booking_number}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex min-h-[52px] items-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep"
        >
          View my visit
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-[52px] items-center px-4 font-accent text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </motion.div>
  );
}
