import { Link } from "react-router-dom";
import { useAnalytics } from "@/api/admin";
import { useMyBookings } from "@/api/bookings";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/utils";

export default function StaffAnalytics() {
  const { user } = useAuth();
  const stats = useAnalytics();
  const { data: bookings } = useMyBookings();

  const mine = bookings ?? [];
  const done = mine.filter((b) => b.status === "completed").length;
  const cancelled = mine.filter((b) => b.status === "cancelled").length;
  const takings = mine.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total_amount, 0);

  if (stats.isPending) return <p className="text-mutedbrown">Loading analytics…</p>;
  if (stats.isError || !stats.data)
    return (
      <p role="alert" className="text-sm text-[#b84444]">
        We couldn&apos;t load analytics. <button onClick={() => stats.refetch()} className="underline">Try again</button>
      </p>
    );
  const d = stats.data;
  const maxRev = Math.max(1, ...d.revenue_7d.map((r) => r.revenue));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Analytics</h1>
        {user?.role === "admin" && (
          <Link to="/admin" className="font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Full admin overview →
          </Link>
        )}
      </div>

      <h2 className="mt-5 font-display text-xl text-ink">My performance</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {[
          ["Completed visits", String(done)],
          ["Cancelled", String(cancelled)],
          ["My takings", formatINR(takings)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md2 border border-warmborder bg-white p-4">
            <p className="font-accent text-xs uppercase tracking-wide text-mutedbrown">{k}</p>
            <p className="mt-1 font-display text-2xl text-ink">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 font-display text-xl text-ink">Salon today</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {[
          ["Appointments", String(d.today.appointments)],
          ["Revenue", formatINR(d.today.revenue)],
          ["New guests (7d)", String(d.new_customers_7d)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md2 border border-warmborder bg-white p-4">
            <p className="font-accent text-xs uppercase tracking-wide text-mutedbrown">{k}</p>
            <p className="mt-1 font-display text-2xl text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md2 border border-warmborder bg-white p-5">
          <h2 className="font-display text-xl text-ink">Popular services (30d)</h2>
          {d.popular_services.length === 0 && <p className="mt-2 text-sm text-ink/55">No bookings yet.</p>}
          <ul className="mt-2 divide-y divide-warmborder">
            {d.popular_services.map((s) => (
              <li key={s.name} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="text-ink/60">{s.bookings} visit{s.bookings === 1 ? "" : "s"} · {formatINR(s.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md2 border border-warmborder bg-white p-5">
          <h2 className="font-display text-xl text-ink">Revenue (7d)</h2>
          {d.revenue_7d.length === 0 && <p className="mt-2 text-sm text-ink/55">No payments yet.</p>}
          <div className="mt-3 flex h-24 items-end gap-2" role="img" aria-label="Revenue by day, last 7 days">
            {d.revenue_7d.map((r) => (
              <div key={r.day} className="flex flex-1 flex-col items-center gap-1" title={`${r.day}: ${formatINR(r.revenue)}`}>
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(4, (r.revenue / maxRev) * 88)}px` }} />
                <span className="text-[11px] text-ink/50">{r.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
