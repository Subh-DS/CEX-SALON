import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMyBookings } from "@/api/bookings";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";

const STATUSES = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"] as const;

export default function StaffAppointments() {
  const { data, isPending, isError, refetch } = useMyBookings();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [day, setDay] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? [])
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => !day || b.items.some((i) => i.start_time.slice(0, 10) === day))
      .filter(
        (b) =>
          !needle ||
          b.booking_number.toLowerCase().includes(needle) ||
          (b.customer_name ?? "").toLowerCase().includes(needle) ||
          b.items.some((i) => i.service_name.toLowerCase().includes(needle))
      )
      .slice()
      .sort((a, b) => (a.items[0]?.start_time ?? "").localeCompare(b.items[0]?.start_time ?? ""));
  }, [data, q, status, day]);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Appointments</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search booking no., guest, service…"
          aria-label="Search appointments"
          className="min-h-[44px] min-w-0 flex-1 border border-warmborder bg-white px-3.5 text-[15px] text-ink sm:max-w-xs"
        />
        <input
          type="date" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Filter by date"
          className="min-h-[44px] border border-warmborder bg-white px-3 text-[15px] text-ink"
        />
        <select
          value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status"
          className="min-h-[44px] border border-warmborder bg-white px-3 text-[15px] text-ink"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {isPending && <p className="mt-4 text-mutedbrown">Loading appointments…</p>}
      {isError && (
        <p role="alert" className="mt-4 text-sm text-[#b84444]">
          We couldn&apos;t load appointments. <button onClick={() => refetch()} className="underline">Try again</button>
        </p>
      )}
      {data && rows.length === 0 && <p className="mt-4 text-ink/60">No appointments match. Try clearing the filters.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-md2 border border-warmborder bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-surfacewarm text-left font-accent text-xs uppercase text-mutedbrown">
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Guest</th>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const item = b.items[0];
                const d = item ? parseVisitDate(item.start_time) : null;
                return (
                  <tr key={b.id} className="border-t border-warmborder">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{d ? `${d.month} ${d.day} · ${d.time}` : "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{b.customer_name ?? "Guest"}</td>
                    <td className="px-4 py-3 text-ink/70">{item?.service_name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/70">{formatINR(b.total_amount)}</td>
                    <td className="px-4 py-3"><VisitStatus status={b.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/staff/appointments/${b.id}`} className="font-accent font-semibold text-primary underline-offset-4 hover:underline">
                        Open →
                      </Link>
                    </td>
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
