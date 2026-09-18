import { useState } from "react";
import { useAdminBookings } from "@/api/admin";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";

const FILTERS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

export default function AdminBookings() {
  const { data, isPending, isError } = useAdminBookings();
  const [f, setF] = useState<(typeof FILTERS)[number]>("all");
  const rows = (data ?? []).filter((b) => f === "all" || b.status === f);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Bookings</h1>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setF(s)}
            aria-pressed={f === s}
            className={`min-h-[44px] rounded-pill border px-4 font-accent text-sm font-semibold ${
              f === s ? "border-primary bg-primary text-white" : "border-warmborder bg-white text-ink"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>
      {isPending && <p className="mt-4 text-mutedbrown">Loading bookings…</p>}
      {isError && <p role="alert" className="mt-4 text-sm text-[#b84444]">We couldn&apos;t load bookings. Try again.</p>}
      {data && rows.length === 0 && <p className="mt-4 text-ink/60">No bookings with this status.</p>}
      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-md2 border border-warmborder bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-surfacewarm text-left font-accent text-xs uppercase text-mutedbrown">
                <th className="px-4 py-2.5">Booking</th>
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Service · Expert</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const item = b.items[0];
                const d = item ? parseVisitDate(item.start_time) : null;
                return (
                  <tr key={b.id} className="border-t border-warmborder">
                    <td className="px-4 py-3 font-semibold text-ink">{b.booking_number}</td>
                    <td className="px-4 py-3 text-ink/70">{d ? `${d.month} ${d.day} · ${d.time}` : "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{b.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{item ? `${item.service_name} · ${item.staff_name}` : "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{formatINR(b.total_amount)}{b.paid ? " · paid" : ""}</td>
                    <td className="px-4 py-3"><VisitStatus status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
