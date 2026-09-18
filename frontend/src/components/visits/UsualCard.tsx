import { Link } from "react-router-dom";
import type { Booking } from "@/types";

export interface Usual {
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  count: number;
}

export function computeUsual(bookings: Booking[]): Usual | null {
  const freq = new Map<string, Usual & { key: string }>();
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "no_show") continue;
    for (const item of b.items) {
      const key = `${item.service_id}|${item.staff_id}`;
      const cur = freq.get(key) ?? {
        key,
        serviceId: item.service_id,
        serviceName: item.service_name,
        staffId: item.staff_id,
        staffName: item.staff_name,
        count: 0,
      };
      cur.count += 1;
      freq.set(key, cur);
    }
  }
  let best: Usual | null = null;
  for (const v of freq.values()) {
    if (v.count >= 2 && (!best || v.count > best.count)) best = v;
  }
  return best;
}

export default function UsualCard({ usual }: { usual: Usual }) {
  return (
    <div className="border border-ink/12 bg-white p-5 md:p-6">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-primary">Your usual</p>
      <p className="mt-1 font-display text-[22px] font-medium text-ink">{usual.serviceName}</p>
      <p className="mt-0.5 text-sm text-ink/60">
        You've booked this {usual.count} times · {usual.staffName}
      </p>
      <div className="mt-3">
        <Link
          to={`/book?service_id=${usual.serviceId}&staff_id=${usual.staffId}`}
          className="inline-flex min-h-[44px] items-center bg-primary px-6 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
        >
          Book again
        </Link>
      </div>
    </div>
  );
}
