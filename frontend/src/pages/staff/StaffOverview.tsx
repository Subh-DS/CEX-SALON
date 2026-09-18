import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/api/admin";
import { useMyBookings } from "@/api/bookings";
import VisitStatus from "@/components/visits/VisitStatus";
import { parseVisitDate } from "@/components/visits/dates";
import { formatINR } from "@/lib/utils";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function StaffOverview() {
  const { user } = useAuth();
  const name = (user?.email ?? "team").split("@")[0].replace(/^\w/, (c) => c.toUpperCase());
  const { data: bookings } = useMyBookings();
  const stats = useAnalytics();

  const list = bookings ?? [];
  const todayKey = new Date().toDateString();
  const todays = list.filter((b) => b.items.some((i) => new Date(i.start_time).toDateString() === todayKey));
  const pending = list.filter((b) => b.status === "pending");
  const doneToday = todays.filter((b) => b.status === "completed");
  const revenueToday = todays
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.total_amount, 0);

  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Staff console</p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
        {greeting()}, {name}.
      </h1>
      <p className="mt-1 text-[15px] text-ink/60">Here&apos;s what needs you today.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Today's appointments", String(todays.length)],
          ["Awaiting confirmation", String(pending.length)],
          ["Completed today", String(doneToday.length)],
          ["Today's takings", formatINR(revenueToday)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md2 border border-warmborder bg-white p-4">
            <p className="font-accent text-xs uppercase tracking-wide text-mutedbrown">{k}</p>
            <p className="mt-1 font-display text-2xl text-ink">{v}</p>
          </div>
        ))}
      </div>
      {stats.data && (
        <p className="mt-2 text-[13px] text-ink/50">
          Salon-wide today: {stats.data.today.appointments} appointments · {formatINR(stats.data.today.revenue)} revenue.
        </p>
      )}

      <div className="mt-6 rounded-md2 border border-warmborder bg-white">
        <div className="flex items-center justify-between border-b border-warmborder px-4 py-3">
          <h2 className="font-display text-xl text-ink">Needs attention</h2>
          <Link to="/staff/appointments" className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            All appointments →
          </Link>
        </div>
        {pending.length === 0 && (
          <p className="px-4 py-5 text-sm text-ink/60">Nothing waiting. New bookings will appear here for confirmation.</p>
        )}
        <ul className="divide-y divide-warmborder">
          {pending.slice(0, 5).map((b) => {
            const item = b.items[0];
            const d = item ? parseVisitDate(item.start_time) : null;
            return (
              <li key={b.id}>
                <Link to={`/staff/appointments/${b.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-ivory">
                  <span className="font-semibold text-ink">{d ? `${d.month} ${d.day} · ${d.time}` : b.booking_number}</span>
                  <span className="text-sm text-ink/65">{item ? `${item.service_name} · ${b.customer_name ?? "Guest"}` : ""}</span>
                  <span className="ml-auto"><VisitStatus status={b.status} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
