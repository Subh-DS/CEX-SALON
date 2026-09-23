import { CalendarCheck2, IndianRupee, RefreshCw, Sparkles, UserPlus, Wallet } from "lucide-react";
import { useAnalytics } from "@/api/admin";
import { formatINR } from "@/lib/utils";
import { AdminEmpty, AdminError, AdminPageHeader, Panel, SkeletonCards, StatCard } from "@/components/admin/AdminUI";

export default function AdminOverview() {
  const { data, isPending, isError, refetch, isFetching } = useAnalytics();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Command centre"
        title="Today's operations"
        sub="Live pulse of appointments, revenue, guests and Glow Points."
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-warmborder bg-white px-5 font-accent text-sm font-semibold text-ink shadow-sm2 transition-colors hover:border-primary-light disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      {isPending && (
        <div className="mt-6">
          <SkeletonCards />
        </div>
      )}
      {isError && (
        <div className="mt-6">
          <AdminError message="We couldn't load analytics right now." onRetry={() => refetch()} />
        </div>
      )}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CalendarCheck2}
              tone="plum"
              label="Today's appointments"
              value={String(data.today.appointments)}
              sub={`${data.month.bookings} bookings in last 30 days`}
            />
            <StatCard
              icon={IndianRupee}
              tone="leaf"
              label="Today's revenue"
              value={formatINR(data.today.revenue)}
              sub="Completed payments only"
            />
            <StatCard
              icon={UserPlus}
              tone="rose"
              label="New guests · 7d"
              value={String(data.new_customers_7d)}
              sub="First-time customers this week"
            />
            <StatCard
              icon={Wallet}
              tone="gold"
              label="Cancellation · 30d"
              value={`${(data.month.cancellation_rate * 100).toFixed(1)}%`}
              sub={`${data.month.cancelled} of ${data.month.bookings} bookings cancelled`}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <Panel
              title="Popular services"
              sub="Top rituals by visits · last 30 days"
              className="xl:col-span-3"
              action={
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-surfacewarm px-3 py-1.5 font-accent text-xs font-semibold text-ink/60">
                  <Sparkles className="h-3.5 w-3.5 text-marigold-deep" />
                  {data.popular_services.length} trending
                </span>
              }
            >
              {data.popular_services.length === 0 ? (
                <AdminEmpty title="No bookings yet" sub="Once guests start booking, the most-loved rituals will surface here." />
              ) : (
                <ul className="divide-y divide-warmborder/70">
                  {(() => {
                    const max = Math.max(1, ...data.popular_services.map((s) => s.bookings));
                    return data.popular_services.map((s, i) => (
                      <li key={s.name} className="flex items-center gap-4 py-3.5">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 font-display text-sm font-bold text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <b className="truncate text-[15px] text-ink">{s.name}</b>
                            <span className="text-[13px] text-ink/55">
                              {s.bookings} visit{s.bookings === 1 ? "" : "s"} · {formatINR(s.revenue)}
                            </span>
                          </span>
                          <span className="mt-2 block h-1.5 overflow-hidden rounded-pill bg-surfacewarm">
                            <span
                              className="block h-full rounded-pill bg-gradient-to-r from-primary to-primary-light"
                              style={{ width: `${Math.max(6, (s.bookings / max) * 100)}%` }}
                            />
                          </span>
                        </span>
                      </li>
                    ));
                  })()}
                </ul>
              )}
            </Panel>

            <Panel
              title="Revenue · 7 days"
              sub="Completed payments, day by day"
              className="xl:col-span-2"
              action={
                <span className="rounded-pill bg-[#e3efe8] px-3 py-1.5 font-accent text-xs font-bold text-leafgreen">
                  {formatINR(data.revenue_7d.reduce((a, r) => a + r.revenue, 0))} total
                </span>
              }
            >
              {data.revenue_7d.length === 0 ? (
                <AdminEmpty title="No payments yet" sub="Revenue bars will bloom here once checkout completes." />
              ) : (
                <>
                  {(() => {
                    const maxRev = Math.max(1, ...data.revenue_7d.map((r) => r.revenue));
                    return (
                      <div className="flex h-36 items-end gap-2" role="img" aria-label="Revenue by day, last 7 days">
                        {data.revenue_7d.map((r) => (
                          <div key={r.day} className="group flex flex-1 flex-col items-center gap-1.5">
                            <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {formatINR(r.revenue)}
                            </span>
                            <div
                              title={`${r.day}: ${formatINR(r.revenue)}`}
                              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-light transition-all group-hover:from-plum-deep group-hover:to-marigold"
                              style={{ height: `${Math.max(8, (r.revenue / maxRev) * 96)}px` }}
                            />
                            <span className="text-[11px] font-medium text-ink/45">{r.day.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surfacewarm/70 px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-ink/65">
                      <Sparkles className="h-4 w-4 text-marigold-deep" />
                      Glow Points
                    </span>
                    <span className="text-ink/70">
                      <b className="text-ink">{data.loyalty.issued.toLocaleString("en-IN")}</b> issued
                      <span className="mx-1.5 text-warmborder">·</span>
                      <b className="text-ink">{data.loyalty.redeemed.toLocaleString("en-IN")}</b> redeemed
                    </span>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
