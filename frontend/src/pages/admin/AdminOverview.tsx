import { useAnalytics } from "@/api/admin";
import { formatINR } from "@/lib/utils";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md2 border border-warmborder bg-white p-4">
      <p className="font-accent text-xs uppercase tracking-wide text-mutedbrown">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[13px] text-ink/55">{sub}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const { data, isPending, isError, refetch } = useAnalytics();

  if (isPending) return <p className="text-mutedbrown">Loading today's numbers…</p>;
  if (isError || !data)
    return (
      <p role="alert" className="text-sm text-[#b84444]">
        We couldn't load analytics. <button onClick={() => refetch()} className="underline">Try again</button>
      </p>
    );

  const maxRev = Math.max(1, ...data.revenue_7d.map((r) => r.revenue));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Today&apos;s operations</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Today's appointments" value={String(data.today.appointments)} />
        <Stat label="Today's revenue" value={formatINR(data.today.revenue)} />
        <Stat label="New customers (7d)" value={String(data.new_customers_7d)} />
        <Stat
          label="Cancellation rate (30d)"
          value={`${(data.month.cancellation_rate * 100).toFixed(1)}%`}
          sub={`${data.month.cancelled} of ${data.month.bookings} bookings`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md2 border border-warmborder bg-white p-5">
          <h2 className="font-display text-xl text-ink">Popular services (30d)</h2>
          {data.popular_services.length === 0 && <p className="mt-2 text-sm text-ink/55">No bookings yet.</p>}
          <ul className="mt-3 divide-y divide-warmborder">
            {data.popular_services.map((s) => (
              <li key={s.name} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="text-ink/60">{s.bookings} visit{s.bookings === 1 ? "" : "s"} · {formatINR(s.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md2 border border-warmborder bg-white p-5">
          <h2 className="font-display text-xl text-ink">Revenue (7d)</h2>
          {data.revenue_7d.length === 0 && <p className="mt-2 text-sm text-ink/55">No payments yet.</p>}
          <div className="mt-3 flex h-28 items-end gap-2" role="img" aria-label="Revenue by day, last 7 days">
            {data.revenue_7d.map((r) => (
              <div key={r.day} className="flex flex-1 flex-col items-center gap-1" title={`${r.day}: ${formatINR(r.revenue)}`}>
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(4, (r.revenue / maxRev) * 96)}px` }} />
                <span className="text-[11px] text-ink/50">{r.day.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-warmborder pt-3 text-sm text-ink/60">
            Glow Points issued <b className="text-ink">{data.loyalty.issued.toLocaleString("en-IN")}</b>
            {" · "}redeemed <b className="text-ink">{data.loyalty.redeemed.toLocaleString("en-IN")}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
